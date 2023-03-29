import React, { useState, useEffect } from 'react';

import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
// import Inputgroup from '../Inputgroup';
import { DATE_FORMAT_TIME, emailRegex } from '../../../utils/Utils';
import contactService from '../../../services/contact.service';
import stringConstants from '../../../utils/stringConstants.json';
import { renderComponent, VIEW_CARD } from '../../peoples/constantsPeople';
import AutoComplete from '../../AutoComplete';
import { SEARCH_FOR_COMPANY } from '../../../utils/constants';
import organizationService from '../../../services/organization.service';
import { onInputSearch } from '../../../views/Deals/contacts/utils';
import IdfSelectLabel from '../../idfComponents/idfDropdown/IdfSelectLabel';
import { CardBody, CardFooter, Col, Form, FormGroup, Label } from 'reactstrap';
import ButtonIcon from '../../commons/ButtonIcon';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../../commons/ControllerValidation';

const OverviewForm = ({
  overviewData,
  setEditMode,
  getProfileInfo,
  isFieldsData,
  fieldData,
  breakLoop,
  labelType,
  ...props
}) => {
  const constants = stringConstants.deals.contacts.profile;
  const [errorMessage, setErrorMessage] = useState('');
  const [formValue, setFormValue] = useState(overviewData);
  const [loading, setLoading] = useState(false);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [searchOrg, setSearchOrg] = useState({
    search: '',
  });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: formValue,
  });
  const [loadingOrg, setLoadingOrg] = useState(false);
  async function onGetOrganzations() {
    setLoadingOrg(true);
    const response = await organizationService
      .getOrganizations(searchOrg, { limit: 10 })
      .catch((err) => err);

    setLoadingOrg(false);

    const { organizations } = response?.data;
    setAllOrganizations(organizations.filter((o) => !!o.name));
  }
  useEffect(() => {
    onGetOrganzations();
  }, [searchOrg]);
  useEffect(() => {
    setFormValue({ ...overviewData, ...formValue });
  }, [overviewData, isFieldsData]);
  const onHandleSubmit = async () => {
    setLoading(true);
    try {
      const promises = [
        contactService.updateContact(overviewData.id, {
          ...formValue,
        }),
      ];

      await Promise.all(promises);
      setEditMode(VIEW_CARD);
      getProfileInfo(constants.contactUpdated);
      reset(formValue);
    } catch (error) {
      getProfileInfo(constants.errorContactUpdated);
    }
    setLoading(false);
  };
  const handleChange = (e) => {
    const target = e.target;
    const overViewFormData = {
      ...formValue,
      [target.name]: target.value,
    };
    setFormValue(overViewFormData);
  };
  const handleOrganizationSelected = (item) => {
    const selectOrg = {
      ...formValue,
      organization_id: item?.organization_id,
    };
    setFormValue(selectOrg);
  };
  const handleOrganizationCreating = (item) => {
    const selectOrg = {
      ...formValue,
      contact_organization_new: item?.organization_id,
    };
    setFormValue(selectOrg);
  };
  return (
    <>
      <CardBody>
        {Object.keys(isFieldsData).map((NameKey, index) => {
          return (
            <div key={`fields-${index}`}>
              <AlertWrapper>
                <Alert
                  message={errorMessage}
                  setMessage={setErrorMessage}
                  color="danger"
                />
              </AlertWrapper>
              <Form onSubmit={handleSubmit(onHandleSubmit)}>
                <h5 className="pb-0">{NameKey}</h5>
                {isFieldsData[NameKey]?.length > 0 &&
                  isFieldsData[NameKey]?.slice(0, breakLoop).map((field) => {
                    const { field_type, columnName, key, mandatory } = field;
                    const fieldName =
                      field?.columnName !== ''
                        ? field?.columnName
                        : field?.key?.toLowerCase().replace(/\s+/g, '');
                    setValue(fieldName, formValue[fieldName]);
                    return (
                      <>
                        {key !== 'Company' &&
                          key !== 'Label' &&
                          renderComponent(field_type, {
                            value: formValue,
                            onChange: handleChange,
                            name: fieldName,
                            label: key,
                            className: 'text-capitalize',
                            inputClass: mandatory
                              ? 'border-left-4 border-left-danger'
                              : '',
                            validationConfig: {
                              required: mandatory,
                              inline: false,
                              onChange: handleChange,
                              pattern:
                                field_type === 'EMAIL'
                                  ? {
                                      value: emailRegex,
                                      message: 'Please enter a valid email.',
                                    }
                                  : '',
                            },
                            errors,
                            register,
                            errorDisplay: 'mb-0',
                            type:
                              field_type === 'CHAR' ||
                              field_type === 'NUMBER' ||
                              field_type === 'EMAIL' ||
                              field_type === 'URL' ||
                              field_type === 'PHONE'
                                ? 'input'
                                : field_type === 'TEXT'
                                ? 'textarea'
                                : '',
                            key: columnName,
                            placeholder: key,
                            format: ['TIME'].includes(field_type)
                              ? DATE_FORMAT_TIME
                              : null,
                          })}
                        {key === 'Company' && (
                          <FormGroup row className="py-1">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                errors={errors}
                                form={formValue}
                                errorDisplay="mb-0"
                                control={control}
                                renderer={({ field }) => (
                                  <AutoComplete
                                    id="organization_id"
                                    placeholder={SEARCH_FOR_COMPANY}
                                    name="organization_id"
                                    loading={loadingOrg}
                                    type="comapny"
                                    onChange={(e) =>
                                      onInputSearch(e, searchOrg, setSearchOrg)
                                    }
                                    data={allOrganizations}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    selected={formValue?.organization?.name}
                                    onHandleSelect={(item) =>
                                      handleOrganizationSelected(item)
                                    }
                                    customKey="name"
                                    extraTitles={[
                                      'address_city',
                                      'address_state',
                                    ]}
                                    search={searchOrg.search}
                                    createItem={(data) =>
                                      handleOrganizationCreating(data)
                                    }
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {key === 'Label' && (
                          <FormGroup row className="py-1">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                errors={errors}
                                form={formValue}
                                errorDisplay="mb-0"
                                control={control}
                                renderer={({ field }) => (
                                  <IdfSelectLabel
                                    fromNavBar
                                    value={formValue?.label}
                                    onChange={handleChange}
                                    name="label_id"
                                    type={labelType}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    placeholder={field?.key}
                                    {...props}
                                    required={field?.mandatory}
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                      </>
                    );
                  })}
              </Form>
            </div>
          );
        })}
      </CardBody>
      <CardFooter className="bg-gray-5">
        <div className="d-flex gap-2 justify-content-end align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-white"
            data-dismiss="modal"
            onClick={() => {
              setEditMode(VIEW_CARD);
            }}
          >
            Cancel
          </button>
          <ButtonIcon
            type="button"
            classnames="btn-sm"
            label={'Save'}
            loading={loading}
            color="primary"
            onClick={handleSubmit(onHandleSubmit)}
          />
        </div>
      </CardFooter>
    </>
  );
};

export default OverviewForm;
