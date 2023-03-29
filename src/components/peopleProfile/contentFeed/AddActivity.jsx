import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './AddActivity.css';
import stringConstants from '../../../utils/stringConstants.json';
import organizationService from '../../../services/organization.service';
import {
  DATE_FORMAT,
  DATE_FORMAT_EJS,
  DATE_FORMAT_EJS_UPDATED,
  DATE_FORMAT_TIME,
  formatHHMM,
  overflowing,
} from '../../../utils/Utils';
import feedService from '../../../services/feed.service';
import userService from '../../../services/user.service';
import AddActivityOptions from './AddActivityOptions';
import { ModalFooter, Form, FormLabel } from 'react-bootstrap';
import routes from '../../../utils/routes.json';
import ButtonIcon from '../../commons/ButtonIcon';
import { renderComponent } from '../../peoples/constantsPeople';
import IdfSelectMultiOpp from '../../idfComponents/idfDropdown/IdfSelectMultiOpp';
import SelectRepeats from '../../idfComponents/idfDropdown/idfSelectRepeats';
import ButtonFilterDropdown from '../../commons/ButtonFilterDropdown';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import moment from 'moment-timezone';
import DateRangeInput from '../../inputs/DateRange/DatePickerInput';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../../commons/ControllerValidation';
import { CardBody, Col, FormGroup, Label } from 'reactstrap';
import { CheckboxInput } from '../../layouts/CardLayout';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import ReactDatepicker from '../../inputs/ReactDatpicker';
const AddActivity = ({
  componentId,
  contactId,
  dataType,
  dealId,
  deal,
  organization,
  getActivityId,
  organizationId,
  feedId,
  owner,
  getProfileInfo,
  isModal,
  closeModal,
  allFields = [],
  activityData,
  setActiveTab,
  contactInfo,
  fromNavbar,
  setOpenActivity,
  profileInfo,
  activeTab,
  btnType,
  getData,
  feedInfo,
  searchValue,
  ...props
}) => {
  const currentDate = new Date();
  const currentDateSet = moment(new Date()).format(DATE_FORMAT_TIME);
  const activityObj = {
    type: btnType,
    owner: '',
    guests: '',
    start_date: currentDateSet,
    location: '',
    conference_link: '',
    description: '',
    free_busy: 'abc',
    notes: '',
    lead: '',
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: activityObj,
  });
  const history = useHistory();
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [activityForm, setActivityForm] = useState(activityObj);
  const [tagifyValue, setTagifyValue] = useState([]);
  const [tagifyDropdownlist, setTagifyDropdownlist] = useState([]);
  const [allUsers, setAllUsersData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [user, setUser] = useState({});
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [anotherGuests, setAnotherGuests] = useState([]);
  const [charactersRequire, setCharactersRequire] = useState('');
  const constants = stringConstants.deals.contacts.profile;
  const [loading, setLoading] = useState(false);
  const [errorTextMessage, setErrorTextMessage] = useState('');
  const [nameSet, setMultipleName] = useState('');
  const [filterOptionSelected, setFilterOptionSelected] = useState({});
  const regex =
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const getUsers = async () => {
    const result = await userService.getUsers(
      { status: 'active' },
      { limit: 10 }
    );
    const sortUsers = result.data.users?.map((user) => {
      const name = `${user.first_name} ${user.last_name}`;
      const userItem = {
        value: name,
        name,
        email: user.email_work || user.email_home,
        avatar: user.avatar,
        id: user.id,
      };

      return userItem;
    });
    setAllUsersData(sortUsers);
  };
  useEffect(() => {
    if (activityData !== '') {
      setActivityForm(activityData);
    }
  }, [activityData]);
  const searchGuest = async (search) => {
    const match = search.match(/([A-Za-z])/g);
    if (tagifyValue.length > 0 || (match && match?.length >= 2)) {
      setAnotherGuests(
        search.length ? search.split(' ').join('').split(',') : []
      );

      const allGuest = await userService.getMatchingGuests(search);

      const list = allGuest.data?.map((user) => {
        const name = `${user.first_name} ${user.last_name}`;
        const userItem = {
          value: name,
          name,
          email: user.email || user.email_work || user.email_home,
          avatar: user.avatar,
          id: user.id,
        };
        return userItem;
      });
      setCharactersRequire('');
      setTagifyDropdownlist(list);
    } else {
      return setCharactersRequire(match?.length);
    }
  };
  const getUser = async () => {
    const result = await userService.getUserInfo();
    setUser({
      value: `${result.first_name} ${result.last_name}`,
      name: `${result.first_name} ${result.last_name}`,
      email: result.email,
      avatar: result.avatar,
      id: result.id,
    });
    let activityIdsGet;
    if (dataType === 'deal') {
      activityIdsGet = {
        ...activityForm,
        deal_id: deal?.id,
        owner: result?.id,
      };
      setActivityForm(activityIdsGet);
      setValue('deal_id', deal?.id);
    } else if (dataType === 'contact') {
      activityIdsGet = {
        ...activityForm,
        contact_id: contactInfo?.id,
        owner: result?.id,
      };
      setActivityForm(activityIdsGet);
      setValue('contact_id', contactInfo?.id);
    } else if (dataType === 'organization') {
      const activityIdsGet = {
        ...activityForm,
        organization_id: organizationId,
        owner: result?.id,
      };
      setActivityForm(activityIdsGet);
      setValue('organization_id', organizationId);
    } else {
      const userGet = {
        ...activityForm,
        owner: result?.id,
      };
      setActivityForm(userGet);
      setValue('owner', result?.id);
    }
  };
  useEffect(() => {
    getUser();
    getUsers();
  }, []);
  useEffect(() => {
    setFilterOptionSelected(user);
  }, [user]);
  useEffect(() => {
    if (tagifyValue !== '') {
      const activityGueste = {
        ...activityForm,
        guests: tagifyValue,
      };
      setActivityForm(activityGueste);
      setValue('guests', tagifyValue);
    }
  }, [tagifyValue]);
  const getRedirect = () => {
    if (activityForm?.organization_id) {
      history.push(
        `${routes.companies}/${activityForm?.organization_id}/organization/profile`
      );
    } else if (activityForm?.contact_id) {
      history.push(`${routes.contacts}/${activityForm?.contact_id}/profile`);
    } else if (activityForm?.deal_id) {
      history.push(`${routes.dealsPipeline}/${activityForm?.deal_id}`);
    }
  };
  useEffect(() => {
    if (tagifyValue?.length > 0) {
      const guests = tagifyValue?.map((user) => user.id);
      if (guests?.length > 0) {
        const activityData = {
          ...activityForm,
          guests: guests.join(',') || '',
        };
        setActivityForm(activityData);
        setValue('guests', guests.join(',') || '');
      }
    }
  }, [tagifyValue]);
  useEffect(() => {
    if (btnType === 'event' && !activityForm?.end_date) {
      const activityData = {
        ...activityForm,
        end_date: currentDateSet,
      };
      setActivityForm(activityData);
    }
  }, [!activityForm?.end_date]);
  const saveAndSend = async () => {
    const StartDate = moment(activityForm?.start_date).format(
      DATE_FORMAT_EJS_UPDATED
    );
    if (
      btnType === 'event' &&
      !(Date.parse(activityForm?.end_date) >= Date.parse(StartDate))
    ) {
      return setErrorTextMessage('End Date must be greater then Start Date');
    } else {
      setErrorTextMessage('');
    }

    try {
      const list = [];
      anotherGuests.forEach((guest, i) => {
        list.push({
          id: guest,
          value: guest,
          email: guest,
          alert: !regex.test(guest),
        });
        if (i === anotherGuests.length - 1) {
          setTagifyValue([...tagifyValue, ...list]);
          setAnotherGuests([]);
        }
      });

      if (
        anotherGuests.find((item) => !regex.test(item)) ||
        tagifyValue.find((item) => !regex.test(item.email))
      ) {
        return setErrorMessage(constants.emailsAllowed);
      }

      if (activityForm?.name) {
        if (btnType === 'event') {
          if (
            !(
              Date.parse(activityForm?.end_date) >=
              Date.parse(activityForm?.start_date)
            )
          ) {
            return setErrorTextMessage(
              'End Date must be greater then Start Date'
            );
          }
        }
        setLoading(true);
        await feedService.addActivity(activityForm);
        reset(
          setActivityForm({
            type: btnType,
            owner: '',
            guests: '',
            start_date: '',
            location: '',
            conference_link: '',
            description: '',
            free_busy: 'abc',
            notes: '',
            lead: '',
            name: '',
          })
        );
        closeModal(false);
        reset(activityForm);
        setStartDate('');
        setEndDate('');
        if (fromNavbar) {
          setTimeout(() => {
            closeModal(false);
            getRedirect();
          }, 2000);
        }
        if (activeTab) {
          getData(btnType);
        }
        setSuccessMessage(constants.activityAdded);
        if (getProfileInfo) getProfileInfo(constants.activityAdded);
      }
    } catch (error) {
      setLoading(false);
      if (getProfileInfo) getProfileInfo(constants.activityError);
      setErrorMessage(constants.activityError);
    }
  };
  const updateAndSend = async () => {
    delete activityForm?.id;
    delete activityForm?.start_time;
    delete activityForm?.end_time;
    if (btnType === 'event' || btnType === 'call') {
      delete activityForm?.done;
      delete activityForm?.priority;
    }
    if (btnType === 'call') {
      delete activityForm?.online_meet;
    }

    if (activityForm?.end_date && activityForm?.start_date) {
      const StartDate = moment(activityForm?.start_date).format(
        DATE_FORMAT_EJS_UPDATED
      );
      if (
        btnType === 'event' &&
        !(Date.parse(activityForm?.end_date) >= Date.parse(StartDate))
      ) {
        return setErrorTextMessage('End Date must be greater then Start Date');
      } else {
        setErrorTextMessage('');
      }
    }
    try {
      setLoading(true);
      await feedService.updateActivityFeed(
        feedId,
        activityData.id || getActivityId.id,
        activityForm
      );
      overflowing();
      reset(
        setActivityForm({
          type: btnType,
          owner: '',
          guests: '',
          start_date: '',
          location: '',
          conference_link: '',
          description: '',
          free_busy: 'abc',
          notes: '',
          lead: '',
          name: '',
        })
      );
      if (activeTab) {
        getData(btnType);
      }
      setStartDate('');
      setEndDate('');
      closeModal();
      setLoading(false);
      if (getProfileInfo) {
        getProfileInfo(constants.activityUpdated);
        setSuccessMessage(constants.activityUpdated);
        closeModal();
      }
    } catch (error) {
      setLoading(false);
      if (error?.response?.status === 401) {
        setErrorMessage(constants.unathorizedError);

        return setTimeout(() => closeModal(false), 2000);
      }

      setErrorMessage(constants.activityError);
    }
  };
  const getUserByIds = async (guests = '') => {
    if (guests === '') {
      return;
    }

    const guestIds = guests.split(',');
    const result = [];
    const guestUuid = guestIds.filter((guestId) => {
      if (regex.test(guestId)) {
        result.push({
          value: guestId,
          name: guestId,
          email: guestId,
          avatar: '',
          id: guestId,
        });
      }

      return !regex.test(guestId);
    });

    if (guestUuid.length === 0) {
      return [...result];
    }

    const { data: response } = await userService.getGuestsByIds(
      guestUuid.toString()
    );

    const otherData = [...response.users, ...response.contacts]?.map((user) => {
      const name = `${user.first_name} ${user.last_name}`;
      const userItem = {
        value: name,
        name,
        email: user.email || user.email_work || user.email_home,
        avatar: user.avatar,
        id: user.id,
      };

      return userItem;
    });

    return [...otherData, ...result];
  };
  const getOwnerById = async (organizationId) => {
    let owner = await organizationService
      .getOrganizationById(organizationId)
      .catch((err) => console.log(err));

    if (!owner) {
      const [result] = await getUserByIds(activityData.owner);
      owner = result;
    }

    return owner;
  };
  const setDataEdit = async () => {
    delete activityData?.rich_note;
    if (feedId) {
      const guestes = await getUserByIds(activityData.guests);
      const owner = await getOwnerById(activityData.owner);
      setFilterOptionSelected({
        value: owner.name,
        name: owner.name,
        email: owner.email,
        avatar: owner.avatar,
        id: owner.id,
      });
      const activityDataGet = {
        ...activityForm,
        ...activityData,
        start_time: moment(activityData?.start_date).format(formatHHMM),
        end_time: moment(activityData?.end_date).format(formatHHMM),
        free_busy: 'abc',
      };
      setStartDate(new Date(activityData?.start_date));
      setEndDate(new Date(activityData?.end_date));
      setActivityForm(activityDataGet);
      setTagifyValue(guestes);
    }
  };
  useEffect(() => {
    setDataEdit();
  }, [feedId]);
  useEffect(() => {
    if (activityForm?.id !== '') {
      delete activityForm?.id;
    }
  }, [activityForm?.id]);
  const onSelect = (e) => {
    const { name, value } = e.target;
    setMultipleName(name);
    setValue(name, value);
    const activityData = {
      ...activityForm,
      [name]: value,
    };
    setActivityForm(activityData);
  };
  const resetForm = () => {};
  const onHandleChange = (e) => {
    const target = e.target;
    let activityData;
    if (
      target.name === 'priority' ||
      target.name === 'done' ||
      target.name === 'online_meet'
    ) {
      activityData = {
        ...activityForm,
        [target.name]: target.checked,
      };
    } else {
      activityData = {
        ...activityForm,
        [target.name]: target.value,
      };
    }
    setValue(target.name, target.value);
    setActivityForm(activityData);
  };
  const onActivitySelect = (value) => {
    const activitData = {
      ...activityForm,
      bad_email: value,
    };
    setActivityForm(activitData);
    setValue('bad_email', value);
  };
  const handleFilterSelect = (e, option) => {
    e.preventDefault();
    setOpenFilter(!openFilter);
    setFilterOptionSelected(option);
    const getOwner = {
      ...activityForm,
      owner: option.id,
    };
    setActivityForm(getOwner);
    setValue('owner', option);
  };
  const handleStartDateSelect = (value) => {
    if (value) {
      setStartDate(value);
      const activityStartDate = {
        ...activityForm,
        start_date: `${moment(value).format(DATE_FORMAT_EJS_UPDATED)}`,
      };
      setActivityForm(activityStartDate);
      setValue('start_date', value);
    }
  };
  const handleSetDateSelect = (value) => {
    if (value) {
      setStartDate(value);
      const activityStartDate = {
        ...activityForm,
        start_date: `${moment(value).format(DATE_FORMAT)} 12:00 AM`,
      };
      setActivityForm(activityStartDate);
      setValue('start_date', value);
    }
  };
  const handleEndDateSelect = (value) => {
    setEndDate(value);
    const activityStartDate = {
      ...activityForm,
      end_date: moment(value).format(DATE_FORMAT),
    };
    setActivityForm(activityStartDate);
    setValue('end_date', value);
  };
  const handleStartTimeSelect = (e, focus) => {
    const value = focus ? e?.value : e?.target?.value;
    const dateSet = moment(activityForm?.start_date).format(DATE_FORMAT);
    const activityStartDate = {
      ...activityForm,
      start_date: `${dateSet} ${moment(value).format(formatHHMM)}`,
    };
    setActivityForm(activityStartDate);
    setValue('start_time', value);
  };
  const handleEndTimeSelect = (e, focus) => {
    const value = focus ? e?.value : e?.target?.value;
    const dateSet = moment(activityForm?.end_date).format(DATE_FORMAT);
    const activityStartDate = {
      ...activityForm,
      end_date: `${dateSet} ${moment(value).format(formatHHMM)}`,
    };
    validationCheck(activityStartDate?.end_date);
    setActivityForm(activityStartDate);
    setValue('end_time', value);
  };
  const validationCheck = (end_date) => {
    if (end_date && activityForm?.start_date) {
      const StartDate = activityForm?.start_date;
      if (!(Date.parse(end_date) >= Date.parse(StartDate))) {
        return setErrorTextMessage('End Date must be greater then Start Date');
      } else {
        setErrorTextMessage('');
      }
    }
  };
  useEffect(() => {
    validationCheck(activityForm?.end_date);
  }, [activityForm?.start_date, activityForm?.end_date]);
  return (
    <>
      <CardBody className="right-bar-vh h-100 overflow-y-auto">
        <Form
          onSubmit={
            feedId ? handleSubmit(updateAndSend) : handleSubmit(saveAndSend)
          }
        >
          {Object.keys(allFields).map((key, index) => {
            return (
              <div key={`fields-${index}`}>
                <h5 className="pb-0">{key}</h5>
                {allFields[key]?.length > 0 &&
                  allFields[key]?.map((field) => {
                    const { field_type, columnName, key, mandatory } = field;
                    const fieldName =
                      columnName !== ''
                        ? columnName.toLowerCase()
                        : key?.toLowerCase().replace(/\s+/g, '');
                    setValue(fieldName, activityForm[fieldName]);
                    return (
                      <>
                        <div className="text-right">
                          {(key === 'Owner' ||
                            key === 'Host' ||
                            key === 'Task Owner') && (
                            <div className="d-flex align-items-center justify-content-end">
                              <FormLabel className="pr-3">{key}</FormLabel>
                              <ButtonFilterDropdown
                                filterOptionSelected={filterOptionSelected}
                                options={allUsers}
                                icon={'person'}
                                customKeys={['id', 'name']}
                                openFilter={openFilter}
                                setOpenFilter={setOpenFilter}
                                handleFilterSelect={handleFilterSelect}
                              />
                            </div>
                          )}
                        </div>
                        {key !== 'To/From' &&
                          key !== 'Host' &&
                          key !== 'Related To' &&
                          key !== 'Repeat' &&
                          key !== 'Owner' &&
                          key !== 'Task Owner' &&
                          key !== 'Free Busy' &&
                          key !== 'Conference Link' &&
                          key !== 'Location' &&
                          key !== 'Participants' &&
                          field_type !== 'DATE' &&
                          field_type !== 'CHECKBOX' &&
                          renderComponent(field_type, {
                            value: activityForm,
                            id: fieldName,
                            name: fieldName,
                            label: key,
                            className: 'text-capitalize',
                            classNames: mandatory
                              ? 'border-left-4 border-left-danger'
                              : '',
                            key: columnName,
                            placeholder: key,
                            validationConfig: {
                              required: mandatory,
                              inline: false,
                              onChange: onHandleChange,
                            },
                            errors,
                            register,
                            errorDisplay: 'mb-0',
                            type:
                              field_type === 'CHAR'
                                ? 'input'
                                : field_type === 'TEXT'
                                ? 'textarea'
                                : '',
                            disabled: key === 'Call Type',
                          })}
                        {key !== 'Repeat' && field_type === 'CHECKBOX' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {/* {key} */}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <CheckboxInput
                                    label={key}
                                    id={fieldName}
                                    name={fieldName}
                                    onChange={onHandleChange}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    checked={
                                      (fieldName === 'priority' &&
                                        activityForm?.priority === true) ||
                                      (fieldName === 'done' &&
                                        activityForm?.done === true) ||
                                      (fieldName === 'online_meet' &&
                                        activityForm?.online_meet === true)
                                    }
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {(key === 'To/From' || key === 'Participants') && (
                          <FormGroup row className="align-items-center">
                            <Label
                              md={3}
                              className="text-right font-size-sm mb-0"
                            >
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <AddActivityOptions
                                    tagifyDropdownlist={tagifyDropdownlist}
                                    regex={regex}
                                    constants={constants}
                                    tagifyValue={tagifyValue}
                                    charactersRequire={charactersRequire}
                                    setAnotherGuests={setAnotherGuests}
                                    setTagifyValue={setTagifyValue}
                                    searchGuest={searchGuest}
                                    setBadEmail={onActivitySelect}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    endDate={activityForm?.end_date}
                                    expand={true}
                                    isOpen={true}
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {(key === 'Date & Time' || field_type === 'DATE') &&
                          btnType !== 'event' && (
                            <FormGroup row className="py-1 align-items-center">
                              <Label md={3} className="text-right font-size-sm">
                                {key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <div className="date-picker input-time w-100">
                                  <ControllerValidation
                                    name={fieldName}
                                    errors={errors}
                                    form={activityForm}
                                    errorDisplay="mb-0"
                                    control={control}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    renderer={({ field }) => (
                                      <ReactDatepicker
                                        id={fieldName}
                                        name={fieldName}
                                        format={DATE_FORMAT_EJS}
                                        minDate={new Date()}
                                        autoComplete="off"
                                        todayButton="Today"
                                        validationConfig={{
                                          required: mandatory
                                            ? `${key} is required.`
                                            : '',
                                        }}
                                        fieldState={getFieldState(fieldName)}
                                        value={startDate}
                                        className="form-control"
                                        placeholder={DATE_FORMAT_EJS}
                                        onChange={(date) =>
                                          handleStartDateSelect(date)
                                        }
                                      />
                                    )}
                                  />
                                  {btnType === 'call' && (
                                    <TimePickerComponent
                                      id={`start-time`}
                                      cssClass="e-custom-style"
                                      openOnFocus={true}
                                      value={
                                        activityForm?.start_time || '12:00 PM'
                                      }
                                      format="hh:mm a"
                                      placeholder="Start Time"
                                      onChange={(e) =>
                                        handleStartTimeSelect(e, true)
                                      }
                                    />
                                  )}
                                </div>
                              </Col>
                            </FormGroup>
                          )}
                        {key === 'Date & Time' && btnType === 'event' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <div className="date-picker input-time activity-date-picker align-items-center w-100">
                                    <ReactDatepicker
                                      id="start_date"
                                      name="start_date"
                                      format={DATE_FORMAT_EJS}
                                      minDate={new Date()}
                                      todayButton="Today"
                                      autoComplete="off"
                                      value={startDate}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key} is required.`
                                          : '',
                                      }}
                                      fieldState={getFieldState(fieldName)}
                                      className="form-control mr-1"
                                      placeholder={DATE_FORMAT_EJS}
                                      onChange={(date) =>
                                        handleSetDateSelect(date)
                                      }
                                    />
                                    <DateRangeInput
                                      id={`start-date-1`}
                                      name={columnName}
                                      format={DATE_FORMAT_EJS}
                                      className="calendar-activity text-left"
                                      placeholder={key}
                                      feedId={feedId}
                                      startTime={
                                        activityForm?.start_time || '12:00 PM'
                                      }
                                      timePickerChange={handleStartTimeSelect}
                                      endTimePicker={handleEndTimeSelect}
                                      endTime={
                                        activityForm?.end_time || '12:00 PM'
                                      }
                                    />
                                    <ReactDatepicker
                                      id="end_date"
                                      name="end_date"
                                      format={DATE_FORMAT_EJS}
                                      minDate={new Date()}
                                      todayButton="Today"
                                      autoComplete="off"
                                      value={endDate}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key} is required.`
                                          : '',
                                      }}
                                      fieldState={getFieldState(fieldName)}
                                      className="form-control"
                                      placeholder={DATE_FORMAT_EJS}
                                      onChange={(date) =>
                                        handleEndDateSelect(date)
                                      }
                                    />
                                  </div>
                                )}
                              />
                              {errorTextMessage && (
                                <p className="text-danger mt-2 text-sm">
                                  {errorTextMessage}
                                </p>
                              )}
                            </Col>
                          </FormGroup>
                        )}
                        {key === 'Related To' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={dataType ? `${dataType}_id` : nameSet}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <IdfSelectMultiOpp
                                    label={key}
                                    onChange={onSelect}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                      onChange: onSelect,
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    value={
                                      (dataType === 'deal' && {
                                        ...deal,
                                        title: deal?.name,
                                      }) ||
                                      (dataType === 'organization' && {
                                        ...organization,
                                        title: organization?.name,
                                      }) ||
                                      (dataType === 'contact' && {
                                        ...contactInfo,
                                        title: `${contactInfo?.first_name} ${contactInfo?.last_name}`,
                                      })
                                    }
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {((!feedId && key === 'Repeat' && btnType === 'task') ||
                          (!feedId &&
                            btnType === 'event' &&
                            key === 'Repeat')) && (
                          <FormGroup
                            row
                            className="py-1 align-items-center flex-wrap"
                          >
                            <Col md={3}></Col>
                            <Col md={9} className="pl-0 d-block">
                              <SelectRepeats
                                label={key}
                                activityForm={activityForm}
                                setActivityForm={setActivityForm}
                                startDate={activityForm?.start_date}
                              />
                            </Col>
                          </FormGroup>
                        )}
                      </>
                    );
                  })}
              </div>
            );
          })}
        </Form>
      </CardBody>
      <ModalFooter>
        <ButtonIcon
          label="Cancel"
          type="button"
          color="white"
          classnames="btn-white mx-1 btn-sm"
          onclick={isModal ? closeModal : resetForm}
        />
        <ButtonIcon
          classnames="btn-sm"
          type="button"
          onClick={
            feedId ? handleSubmit(updateAndSend) : handleSubmit(saveAndSend)
          }
          label={feedId ? 'Update' : 'Save'}
          color={`primary`}
          loading={loading}
        />
      </ModalFooter>
    </>
  );
};

export default AddActivity;
