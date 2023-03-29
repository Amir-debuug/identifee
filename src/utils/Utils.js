import moment from 'moment';
import routes from './routes.json';
import usaStates from '../components/organizations/Constants.states.json';
import _ from 'lodash';
import { useNewPermissionContext } from '../contexts/newPermissionContext';

export const DATE_FORMAT = 'MM/DD/YYYY';
export const formatHHMM = 'hh:mm A';
export const DATE_FORMAT_REPEAT = 'YYYY-MM-DD';
export const DATE_FORMAT_EJS = 'MM/dd/yyyy';
export const DATE_FORMAT_EJS_UPDATED = 'MM/DD/YYYY';
export const DATE_FORMAT_TIME = 'MM/DD/YYYY hh:mm:ss A';
export const DATE_FORMAT_TIME_WO_SEC = 'MM/DD/YYYY h:mm A';

export const DATE_FORMAT_Z = 'MM/DD/YYYYTHH:mm:ssZ';
export const DATE_FORMAT_Z2 = 'MM/DD/YYYYTHH:mm:ss.SSS[Z]';

export const createBlobObject = (file) => {
  return new Blob([file], { type: file.type });
};

export const base64ToBlob = (base64) => {
  return fetch(base64).then((res) => res.blob());
};

export const createObjectURL = (blobFile) => {
  return window.URL.createObjectURL(blobFile);
};

export const formateDate = function (mm, dd, year) {
  mm = mm + 1;
  return [year, (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const validateEmail = (mail = '') => {
  return !(mail === '' || !emailRegex.test(mail));
};

export const validateEmails = (emails = []) => {
  const result = emails.filter((email) => !validateEmail(email));
  return { isValid: result.length === 0, invalidEmails: result };
};

export const isAlphanumeric = (value) => {
  if (/[^0-9a-zA-Z\s]/.test(value)) {
    return false;
  }
  return true;
};

export const isMatchInCommaSeperated = (input, value) => {
  if (
    input
      ?.toLowerCase()
      ?.match(new RegExp('(?:^|,)' + value.toLowerCase() + '(?:,|$)'))
  ) {
    return true;
  }
  return false;
};

export const isModuleAllowed = (modules, value) => {
  if (!modules || modules === '*') {
    return true;
  } else {
    return isMatchInCommaSeperated(modules, value);
  }
};

export const isPermissionAllowed = (
  collection,
  action,
  permissionContext = undefined
) => {
  try {
    const context = permissionContext || useNewPermissionContext();
    const { permissionChanges } = context;
    const permissionsCheck = permissionChanges.filter((item) => {
      return item.collection === collection;
    });
    const permissionAction = permissionsCheck?.find((child) => {
      return child.action === action;
    });
    if (permissionAction) {
      return (
        permissionAction.collection === collection &&
        permissionAction.action === action
      );
    } else {
      console.error(
        `Permission not found for collection: ${collection}, action: ${action}`
      );
      return false;
    }
  } catch (error) {
    console.error(`Error occurred while fetching permission context: ${error}`);
    return false;
  }
};

export const getRootComponentName = (tenant) => {
  let moduleis = ['Dashboards'];
  if (isModuleAllowed(tenant.modules, 'Dashboard')) {
    moduleis = ['Dashboards'];
    return moduleis;
  }

  const arrayOfModules = tenant.modules.split(',');
  for (
    let moduleCount = 0;
    moduleCount < arrayOfModules.length;
    moduleCount++
  ) {
    const module = arrayOfModules[moduleCount];
    let moduleFound;
    switch (module) {
      case 'Contacts':
        moduleFound = ['Contacts'];
        break;
      case 'Deals':
        moduleFound = ['Deals'];
        break;
      case 'Dashboards':
        moduleFound = ['Dashboards'];
        break;
      case 'Resources':
        moduleFound = ['Resources'];
        break;
      case 'Reports':
        moduleFound = ['Reports'];
        break;
      case 'Training':
        moduleFound = ['Training'];
        break;
      default:
        moduleFound = ['Dashboards'];
    }
    if (moduleFound) {
      moduleis = moduleFound;
      break;
    }
  }

  return moduleis;
};

export const isEmpty = (value) => {
  if (!value || !value.trim()) return true;

  return false;
};

export const isDefined = (value) => {
  if (!value || value === 'undefined') return false;

  return true;
};

export const convertTime12to24 = (time12h) => {
  const [time, modifier] = time12h.split(' ');

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
};

export const checkDate = (data) => {
  const TODAY = moment().clone().startOf('day');
  const TOMORROW = moment().add(1, 'day');

  if (!data?.done) {
    if (new Date(data?.start_date) < new Date()) {
      return 'text-danger';
    }
  }

  if (moment(data.start_date, DATE_FORMAT_Z).isSame(TODAY, 'd')) {
    return 'text-success';
  }

  if (moment(data.start_date, DATE_FORMAT_Z).isSame(TOMORROW, 'd')) {
    return 'text-primary';
  }

  return '';
};
export const setDateFormat = (date, format = 'MM/DD/YYYY LT') => {
  const browser =
    navigator.userAgent.match(
      /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
    ) || [];

  if (browser[1] === 'Safari') {
    if (isNaN(Date.parse(date))) {
      const dateTimeValues = date.split(' ');

      const standardTime = convertTime12to24(
        `${dateTimeValues[1]} ${dateTimeValues[2]}`
      );

      const internationalDateFormat = `${dateTimeValues[0]}T${standardTime}:00Z`;

      return moment(internationalDateFormat, DATE_FORMAT_Z)
        .utc()
        .format(format);
    }

    return moment(date, DATE_FORMAT_Z).format(format);
  }

  return moment(date).format(format);
};

export const setDateFormatUTC = (date, format = 'MM/DD/YYYY LT') => {
  return moment(date, DATE_FORMAT_Z).utc().format(format);
};

export const floorFigure = (figure, decimals = 2) => {
  const d = 10 ** decimals;
  return (parseInt(figure * d, 10) / d).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
  });
};

export const valueNumberValidator = (value, decimals = 0, max, min = 0) => {
  const inputNumber = Number(value);
  if (Number.isNaN(inputNumber)) {
    value = parseFloat(value) || '';
  }

  if (max && max > min) {
    if (value > max) {
      value = parseInt(
        Math.max(Number(min), Math.min(Number(max), Number(value) / 10))
      );
    }
  }

  if (Number(value) - parseInt(value) > 0) {
    const textValue = value.toString();
    const index = textValue.indexOf('.');

    if (textValue.length - index - 1 > decimals) {
      value = Number(value).toFixed(decimals);
    }
  }

  return value;
};

export const isToFixedNoRound = (num = 0, decimals = 2) => {
  const newNum = parseFloat(num);
  if (Number.isNaN(newNum)) {
    return '$0.00';
  }
  return floorFigure(num, decimals);
};

export const decimalToNumber = (num = 0) => {
  const newNum = parseInt(num);
  if (Number.isNaN(newNum)) {
    return '0';
  }
  return newNum;
};

export const formatNumber = (
  num,
  decimals = 2,
  mandatoryDecimals = 0,
  parseMillions = true
) => {
  const newNum = parseFloat(num);
  if (Number.isNaN(newNum)) {
    return '0';
  }
  if (parseMillions && newNum >= 1e6) {
    return `${isToFixedNoRound(newNum / 1e6, decimals)}M`;
  }

  if (mandatoryDecimals > 0) {
    return isToFixedNoRound(newNum.toFixed(mandatoryDecimals), decimals);
  }
  return isToFixedNoRound(newNum, decimals);
};

export const parseJwt = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
};

export const getFileSize = (size) => {
  const byteUnits = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const fileSize = Math.floor(Math.log(size) / Math.log(1024));
  const fSize = (size / Math.pow(1024, fileSize)).toFixed(2);
  return `${!isNaN(fSize) ? fSize : 0} ${byteUnits[fileSize] || 'B'}`;
};

export const MaxByCriteria = (array, key) => {
  return array?.reduce((max, obj) =>
    parseFloat(max[key]) > parseFloat(obj[key]) ? max : obj
  );
};

export const capitalize = (str) => {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
};

export const numberWithCommas = (x = 0) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
/**
 * Allows us to attach a TTL to a memoized function.
 */
export const ttlMemoize = (fn) => {
  const cache = {};

  // drop keys from cache based on the ttl
  setInterval(() => {
    const keysToDrop = Object.entries(cache)
      .filter(([key, item]) => {
        if (!item.ttl) {
          return false;
        }

        const now = new Date().valueOf();
        const ttl = new Date(item.ttl).valueOf();
        return now > ttl;
      })
      .map(([key]) => key);

    keysToDrop.forEach((key) => delete cache[key]);
  }, 5000);

  return {
    memo: (...args) => {
      const argsKey = JSON.stringify(args);
      if (!cache[argsKey]) {
        cache[argsKey] = {
          fn: fn(...args),
        };
      }

      return cache[argsKey].fn;
    },
    setTTL: (ttl, ...args) => {
      const argsKey = JSON.stringify(args);
      if (!cache[argsKey]) {
        return;
      }
      cache[argsKey].ttl = ttl;
    },
  };
};

export const searchParams = (params, search) => {
  return new URLSearchParams(params).get(search);
};

export const routerConstants = routes;

export const errorsRedirectHandler = (error) => {
  if (
    error.response.status === 401 ||
    error.response.status === 400 ||
    error.response.status === 404 ||
    error.response.status === 409 ||
    error.response.status === 500
  ) {
    throw error; // instead of returning error, just throw it here so that we can catch it from where it is being called
  } else if (error.response.status === 403) {
    document.location.href = '/403';
  } else {
    console.log(error);
  }
};

export const generateArrayDates = (
  initialDate,
  endDate,
  type = 'day',
  format = 'MM/DD/YYYY'
) => {
  const start = moment(initialDate);
  const end = moment(endDate);
  const dates = [];
  let initial = start;

  while (initial <= end) {
    dates.push(initial.format(format));
    initial = initial.clone().add(1, type);
  }

  return dates;
};

export const getProductsTotalAmount = (products) => {
  let totalAmountAcum = 0;
  products.forEach((dealProduct) => {
    const price = dealProduct.price;
    const quantity = dealProduct.quantity;
    const amount = price * quantity;
    totalAmountAcum = amount + totalAmountAcum || 0;
  });
  return totalAmountAcum;
};

export const timeList = [
  { name: '12:00 AM', value: '12:00_AM' },
  { name: '01:00 AM', value: '01:00_AM' },
  { name: '02:00 AM', value: '02:00_AM' },
  { name: '03:00 AM', value: '03:00_AM' },
  { name: '04:00 AM', value: '04:00_AM' },
  { name: '05:00 AM', value: '05:00_AM' },
  { name: '06:00 AM', value: '06:00_AM' },
  { name: '07:00 AM', value: '07:00_AM' },
  { name: '08:00 AM', value: '08:00_AM' },
  { name: '09:00 AM', value: '09:00_AM' },
  { name: '10:00 AM', value: '10:00_AM' },
  { name: '11:00 AM', value: '11:00_AM' },
  { name: '12:00 PM', value: '12:00_PM' },
  { name: '01:00 PM', value: '01:00_PM' },
  { name: '02:00 PM', value: '02:00_PM' },
  { name: '03:00 PM', value: '03:00_PM' },
  { name: '04:00 PM', value: '04:00_PM' },
  { name: '05:00 PM', value: '05:00_PM' },
  { name: '06:00 PM', value: '06:00_PM' },
  { name: '07:00 PM', value: '07:00_PM' },
  { name: '08:00 PM', value: '08:00_PM' },
  { name: '09:00 PM', value: '09:00_PM' },
  { name: '10:00 PM', value: '10:00_PM' },
  { name: '11:00 PM', value: '11:00_PM' },
];

export const companyProspects = [
  {
    id: 18097967,
    name: 'Rocketreach.co',
    domain: 'rocketreach.co',
    email_domain: 'rocketreach.co',
    website_domain: 'rocketreach.co',
    ticker_symbol: null,
    links: {
      twitter: null,
      facebook: null,
      linkedin: 'http://linkedin.com/company/rocketreach.co',
      crunchbase: null,
    },
    year_founded: 2015,
    address: {
      description:
        '800 Bellevue Way NE Suite 500, Bellevue, Washington 98004, US',
      street: '800 Bellevue Way NE Suite 500',
      city: 'Bellevue',
      region: 'Washington',
      postal_code: '98004',
      country_code: 'US',
    },
    phone: '(833) 212-3828',
    fax: null,
    num_employees: 68,
    revenue: 30000000,
    funding_investors: null,
    industry: 'Information Services',
    sic_codes: [73, 737],
    rr_profile_url:
      'https://rocketreach.co/rocketreachco-profile_b4d23efdf855f2de',
    description:
      '4 Million+ businesses worldwide trust RocketReach. Including the biggest - Google, Amazon, Apple, Facebook, and 90% of S&P 500. Access real-time verified personal/professional emails, phone numbers, social media links for over 400 million profiles, at 10 million companies worldwide.',
  },
  {
    id: 18097968,
    name: 'Rocketreach.co',
    domain: 'rocketreach.co',
    email_domain: 'rocketreach.co',
    website_domain: 'rocketreach.co',
    ticker_symbol: null,
    links: {
      twitter: null,
      facebook: null,
      linkedin: 'http://linkedin.com/company/rocketreach.co',
      crunchbase: null,
    },
    year_founded: 2015,
    address: {
      description:
        '800 Bellevue Way NE Suite 500, Bellevue, Washington 98004, US',
      street: '800 Bellevue Way NE Suite 500',
      city: 'Bellevue',
      region: 'Washington',
      postal_code: '98004',
      country_code: 'US',
    },
    phone: '(833) 212-3828',
    fax: null,
    num_employees: 68,
    revenue: 30000000,
    funding_investors: null,
    industry: 'Information Services',
    sic_codes: [73, 737],
    rr_profile_url:
      'https://rocketreach.co/rocketreachco-profile_b4d23efdf855f2de',
    description:
      '4 Million+ businesses worldwide trust RocketReach. Including the biggest - Google, Amazon, Apple, Facebook, and 90% of S&P 500. Access real-time verified personal/professional emails, phone numbers, social media links for over 400 million profiles, at 10 million companies worldwide.',
  },
  {
    id: 18097969,
    name: 'Rocketreach.co',
    domain: 'rocketreach.co',
    email_domain: 'rocketreach.co',
    website_domain: 'rocketreach.co',
    ticker_symbol: null,
    links: {
      twitter: null,
      facebook: null,
      linkedin: 'http://linkedin.com/company/rocketreach.co',
      crunchbase: null,
    },
    year_founded: 2015,
    address: {
      description:
        '800 Bellevue Way NE Suite 500, Bellevue, Washington 98004, US',
      street: '800 Bellevue Way NE Suite 500',
      city: 'Bellevue',
      region: 'Washington',
      postal_code: '98004',
      country_code: 'US',
    },
    phone: '(833) 212-3828',
    fax: null,
    num_employees: 68,
    revenue: 30000000,
    funding_investors: null,
    industry: 'Information Services',
    sic_codes: [73, 737],
    rr_profile_url:
      'https://rocketreach.co/rocketreachco-profile_b4d23efdf855f2de',
    description:
      '4 Million+ businesses worldwide trust RocketReach. Including the biggest - Google, Amazon, Apple, Facebook, and 90% of S&P 500. Access real-time verified personal/professional emails, phone numbers, social media links for over 400 million profiles, at 10 million companies worldwide.',
  },
];

export const prospectsMocked = [
  {
    id: 1430548,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic:
      'https://d1hbpr09pwz0sk.cloudfront.net/profile_pic/amit-shanbhag-5fd199dd',
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amitshanbhag',
    location: 'United States',
    city: null,
    region: null,
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'Founder',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
  {
    id: 240837210,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic: null,
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amit-shanbhag-b142592',
    location: 'San Francisco, California, United States',
    city: 'San Francisco',
    region: 'CA ',
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'unknown normalized title',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '+91 98335 8XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
  {
    id: 1430549,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic:
      'https://d1hbpr09pwz0sk.cloudfront.net/profile_pic/amit-shanbhag-5fd199dd',
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amitshanbhag',
    location: 'United States',
    city: null,
    region: null,
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'Founder',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
  {
    id: 1430550,
    status: 'complete',
    name: 'Amit Shanbhag',
    profile_pic:
      'https://d1hbpr09pwz0sk.cloudfront.net/profile_pic/amit-shanbhag-5fd199dd',
    links: null,
    linkedin_url: 'https://www.linkedin.com/in/amitshanbhag',
    location: 'United States',
    city: null,
    region: null,
    country_code: 'US',
    current_title: 'Founder',
    normalized_title: 'Founder',
    current_employer: 'rocketreach.co',
    teaser: {
      emails: ['rocketreach.co', 'gmail.com', 'yahoo.com', 'hotmail.com'],
      phones: [
        {
          number: '415-519-XXXX',
          is_premium: true,
        },
        {
          number: '212-946-XXXX',
          is_premium: true,
        },
        {
          number: '415-674-XXXX',
          is_premium: true,
        },
        {
          number: '415669XXXX',
          is_premium: false,
        },
        {
          number: '415381XXXX',
          is_premium: false,
        },
      ],
      preview: [],
      is_premium_phone_available: false,
    },
  },
];

// this method will split google sent address back to address/city/state separately
export const splitAddress = (item) => {
  const stateIndex = item?.terms?.length - 2;
  const cityIndex = item?.terms?.length - 3;
  const addressIndex = item?.terms[cityIndex]?.offset - 2;

  const state = usaStates.find(
    (state) => state.abbreviation === item?.terms[stateIndex]?.value
  );
  const city = item?.terms[cityIndex]?.value;
  const address = item.description.slice(0, addressIndex);

  return { address, city, state };
};

export const pageTitleBeautify = (titles, separator = ' - ') => {
  return titles.join(separator);
};

export const sortByCompleted = (list, lessonOrCourse) => {
  if (lessonOrCourse === 'courseTracking') {
    return list;
  }
  return _.orderBy(list, [`${lessonOrCourse}.status`], ['desc']);
};

function getFaviconEl() {
  return document.getElementById('favicon');
}
export const changeFavIcon = (favIc) => {
  if (favIc) {
    const favicon = getFaviconEl(); // Accessing favicon element
    favicon.href = favIc;
  }
};

export const percentageChange = (last, current) => {
  const lastValue = parseInt(last);
  const currentValue = parseInt(current);
  if (lastValue !== 0) {
    return (currentValue / lastValue) * 100 - 100;
  } else if (currentValue > 0) {
    return 100;
  } else {
    return 0;
  }
};

export const TrainingViewTypes = {
  Lesson: 1,
  Course: 2,
};

export const PROSPECTS_FILTER_STORAGE_KEY = 'prospectsSavedFilter';

export const replaceSpaceWithCharacter = (value, ch = '-') => {
  return value?.replace(/\s+/g, ch);
};

export const TrainingFilterOptions = [
  { id: 1, key: 'updated_at', name: 'Last Modified' },
  { id: 2, key: "eq 'draft'", name: 'Draft' },
  { id: 3, key: "eq 'published'", name: 'Published' },
];

export const DashboardFilterOptions = [
  { id: 1, key: 'updated_at', name: 'Last Modified' },
  { id: 2, key: 'latest', name: 'Latest' },
  { id: 3, key: 'custom', name: 'Custom' },
];

export const AddComponentOptions = [
  { id: 1, icon: 'leaderboard', key: 'KPI', name: 'KPI' },
  { id: 2, icon: 'add_chart', key: 'Chart', name: 'Chart' },
];

export const DashboardShareOptions = [
  { id: 1, icon: 'lock', key: 'only_me', name: 'Only Me' },
  { id: 2, icon: 'language', key: 'all_users', name: 'All Users' },
  { id: 3, icon: 'edit', key: 'custom', name: 'Custom' },
];

// took this from here: https://stackoverflow.com/a/43467144/2633871
export const isValidUrl = (str) => {
  let url;

  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

// moving the scroll to top of window
export const scrollToTop = () => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  });
};

// moving scroll to bottom of passed container
export const scrollToBottomContainer = (container) => {
  window.scroll({
    top: container?.scrollHeight,
    behavior: 'smooth',
  });
};

// converting values 12641 to 12.6K or 24578000000 to 24.6B etc.
export const roundNumbers = (value, display = 'short', decimals = 1) => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: display,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const numbersWithComma = (value, decimals = 2) => {
  return new Intl.NumberFormat('en', {
    maximumSignificantDigits: decimals,
  }).format(value);
};

// only get keys with data
export const getKeysWithData = (obj) => {
  const filters = {};
  for (const key in obj) {
    const item = obj[key];
    for (const sub in item) {
      if (Array.isArray(item[sub])) {
        if (item[sub].length) {
          filters[sub] = item[sub];
        }
      } else if (item[sub]?.trim()) {
        filters[sub] = [item[sub]];
      }
    }
  }
  return filters;
};

// took the following from here: https://vijayendren-r.medium.com/javascript-react-js-function-to-convert-array-json-into-a-csv-file-8315ea8f6ab2
// Function to convert the JSON(Array of objects) to CSV.
export const arrayToCsv = (headers, data) => {
  const csvRows = [];
  // getting headers.
  const headerValues = headers.map((header) => header.label);
  csvRows.push(headerValues.join(',')); // Push into array as comma separated values
  // Getting rows.
  for (const row of data) {
    const rowValues = headers.map((header) => {
      const value = row[header.key] || '';
      const escaped = ('' + value).replace(/"/g, '\\"'); // To replace the unwanted quotes.
      return `"${escaped}"`; // To escape the comma in a address like string.
    });
    csvRows.push(rowValues.join(',')); // Push into array as comma separated values.
  }
  return csvRows.join('\n'); // To enter the next rows in the new line '\n'
};

// Function to download the generated CSV as a .csv file.
const download = (data, fileName) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName + '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const generateCSV = (header, data, filename) => {
  const csvData = arrayToCsv(header, data);
  download(csvData, filename);
};

export const overflowing = () => {
  document.body.classList.remove('overflow-hidden');
  document.body.classList.add('overflow-auto');
};

export const removeBodyScroll = () => {
  document.body.classList.remove('overflow-auto');
  document.body.classList.add('overflow-hidden');
};

export const addressify = (comp, type = 'people') => {
  if (type === 'people') {
    const address = [comp.address_street, comp.address_city]
      .filter((a) => !!a)
      .join(', ');
    return `${address || ''} ${comp.address_state || ''} ${
      comp.address_country || ''
    } ${comp.address_postalcode || ''}`;
  } else {
    const address = [comp.address, comp.city].filter((a) => !!a).join(', ');
    return `${address || ''} ${comp.state || ''} ${comp.country || ''} ${
      comp.postal_code || ''
    }`;
  }
};

export const secondsToMinutes = (seconds) => {
  // currently support to minutes not hours
  return `${
    Math.floor(seconds / 60) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2)
  }`;
};

export const formatPhoneNumber = (phoneNumber) => {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumber;
};

export const getDiffBetweenObjects = (one, two) => {
  const combinedObject = { ...one, ...two };

  return Object.entries(combinedObject).reduce((acc, [key, value]) => {
    if (
      !Object.values(one).includes(value) ||
      !Object.values(two).includes(value)
    )
      acc[key] = value;

    return acc;
  }, {});
};

export const convertDataToNewDataObject = (baseObject, destinationObject) => {
  return Object.entries(baseObject).reduce((acc, [key, value]) => {
    if (destinationObject[key]) {
      acc[value] = destinationObject[key];
    }
    return acc;
  }, {});
};

export const parseNaics = (str) => {
  if (!str) {
    return '';
  }

  if (!str.includes(',')) {
    return str.trim();
  }

  const splitted = str.split(', ');

  if (splitted.length === 1) {
    return splitted[0]; // return first one only in case we found one, thats a generic one
  }

  return splitted[1]; // the specific one if we found
};
