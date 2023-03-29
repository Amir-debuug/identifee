import axios from 'axios';

import authHeader from './auth-header';
import { PROSPECTS_FILTER_STORAGE_KEY } from '../utils/Utils';
import { ProspectTypes } from '../components/prospecting/v2/constants';

const API_URL = '/api/prospects';

class ProspectService {
  getProspects(queryFilter, { page = 1, name = '', limit = 10 }) {
    const { filter, ...restProps } = queryFilter || {};

    const URL = `${API_URL}/${
      filter?.globalSearch ? 'quick-search' : 'prospector-pro-search'
    }?`;

    const params = {
      ...restProps,
      ...filter,
      page,
      regions: ['AMER'],
      countries: ['United States'],
      name: filter && filter?.name !== '' ? filter?.name : name,
      per_page: limit,
    };

    return axios
      .get(URL, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getProspectByCriteria(query) {
    const params = {
      ...query,
    };

    return axios
      .get(`${API_URL}/search`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getProspectById(id) {
    const params = {
      id,
    };

    return axios
      .get(`${API_URL}/person-search`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getCompanyByCriteria(query) {
    const params = {
      ...query,
    };

    return axios
      .get(`${API_URL}/company-search`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getCompany(opts) {
    const params = {
      name: opts.name,
      location: 'USA', // default to always search USA
    };

    return axios
      .get(`${API_URL}/companies`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  async getCompanyRR(orgName) {
    const buildNewOrganizationObject = (rocketReachOrganization) => {
      return {
        name: rocketReachOrganization.name,
        employees: rocketReachOrganization.employees,
        annual_revenue:
          '' +
          (rocketReachOrganization.revenue ||
            rocketReachOrganization.annual_revenue),
        total_revenue:
          '' +
          (rocketReachOrganization.revenue ||
            rocketReachOrganization.annual_revenue),
        industry: rocketReachOrganization.industry,
        address_street: rocketReachOrganization.address,
        address_city: rocketReachOrganization.city,
        address_state: rocketReachOrganization.state,
        address_country: rocketReachOrganization.country,
        address_postalcode: rocketReachOrganization.postal_code,
        sic_code: '' + rocketReachOrganization.sic,
        naics_code: '' + rocketReachOrganization.naics,
        ticker_symbol: rocketReachOrganization.ticker,
        avatar: rocketReachOrganization.logo_url,
        website:
          rocketReachOrganization.website || rocketReachOrganization.domain,
        domain:
          rocketReachOrganization.website || rocketReachOrganization.domain,
        phone_office: rocketReachOrganization.phone,
        phone_fax: rocketReachOrganization.fax,
        external_id: '' + rocketReachOrganization.id,
        status: 'cold',
      };
    };

    // if there is no org provided, return {} promise response
    if (!orgName || orgName === 'None') {
      return new Promise((resolve) => {
        resolve({});
      });
    }

    const { data } = await this.query(
      { name: [orgName] },
      {
        page: 1,
        limit: 1,
        type: ProspectTypes.company,
      }
    );

    if (!data?.data?.length) {
      // for some company names RR sending error: true so for these create org with just name
      return { name: orgName };
    } else {
      return buildNewOrganizationObject(data?.data[0]);
    }
  }

  getContact(opts) {
    const params = opts;
    return axios
      .get(`${API_URL}/contacts`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  getCompanyEmployees(opts) {
    const params = {
      ...opts,
      type: 'people',
    };

    return axios
      .get(`${API_URL}/search`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  query(opts, { page = 1, limit = 10, type = 'query' }) {
    const body = {
      query: opts,
      type,
      page,
      limit,
    };

    return axios
      .post(`${API_URL}/search`, body, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  // save filter search in localstorage for now, until its backend ready
  saveFilterSearch(type, filter) {
    let currentFilter =
      localStorage.getItem(PROSPECTS_FILTER_STORAGE_KEY) || null;

    if (!currentFilter) {
      currentFilter = '{}';
    }

    const parseFilter = JSON.parse(currentFilter);
    if (!parseFilter[type] || !filter) {
      parseFilter[type] = { ...filter };
    } else {
      parseFilter[type] = { ...parseFilter[type], ...filter };
    }

    localStorage.setItem(
      PROSPECTS_FILTER_STORAGE_KEY,
      JSON.stringify(parseFilter)
    );
  }

  getSavedFilters(type) {
    const currentFilter =
      localStorage.getItem(PROSPECTS_FILTER_STORAGE_KEY) || null;
    if (currentFilter) {
      const parsedFilter = JSON.parse(currentFilter);
      return parsedFilter[type];
    }
    return {};
  }
}

export default new ProspectService();
