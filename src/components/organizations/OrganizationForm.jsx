import React, { useEffect, useState } from 'react';
import { Col, Label, FormGroup, CardFooter, Form, CardBody } from 'reactstrap';
import { OWNER } from '../../utils/constants';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import IdfSearchDirections from '../idfComponents/idfSearch/IdfSearchDirections';
import IdfSelectLabel from '../idfComponents/idfDropdown/IdfSelectLabel';
import { renderComponent, VIEW_CARD } from '../peoples/constantsPeople';
import stringConstants from '../../utils/stringConstants.json';
import organizationService from '../../services/organization.service';
import ButtonIcon from '../commons/ButtonIcon';
import Loading from '../Loading';
import ControllerValidation from '../commons/ControllerValidation';
const constants = stringConstants.deals.organizations.profile;
const OrganizationForm = ({
  fields,
  data,
  setEditMode,
  getProfileInfo,
  setProfileInfo,
  setSuccessMessage,
  editMode,
  labelType,
  onHandleSubmit,
  handleSubmit,
  me,
  fromNavBar,
  control,
  setErrorMessage,
  getFieldState,
  onClose,
  loading,
  customFields,
  isFieldsObj,
  updateLabel,
  setOrganizationFields,
  refresh,
  register,
  setValue,
  errors,
  isLoading,
  setIsFieldsObj,
  ...props
}) => {
  const [ownerData, setOwnerData] = useState('');
  const onChange = (e) => {
    const target = e.target;
    if (target.name === 'employees') {
      const employees = e.target.value <= 0 ? 0 : e.target.value;
      e.target.value = employees;
      const dataSet = {
        ...isFieldsObj,
        employees,
      };
      setIsFieldsObj(dataSet);
    } else {
      const dataSet = {
        ...isFieldsObj,
        [target.name]: target?.value,
      };
      setIsFieldsObj(dataSet);
    }
    setValue(target.name, target.value);
  };
  const onAddressChange = (e) => {
    const target = e.target;
    const dataSet = {
      ...isFieldsObj,
      [target.name]: target?.value,
    };
    setIsFieldsObj(dataSet);
    setValue(target.name, target.value);
  };
  const labelSelect = (item) => {
    const dataSet = {
      ...isFieldsObj,
      label: item?.item,
      label_id: item?.item?.id,
    };
    setIsFieldsObj(dataSet);
    setValue('label', item?.item);
  };
  const handleSetData = (data) => {
    const dataSet = {
      ...isFieldsObj,
      ...data,
    };
    setIsFieldsObj(dataSet);
  };
  useEffect(() => {
    if (data !== {}) {
      handleSetData(data);
    }
  }, [data]);
  const handleUpdate = async () => {
    try {
      await organizationService.updateOrganization(data.id, isFieldsObj);
      setSuccessMessage(constants.profileForm.updated);
      setEditMode(VIEW_CARD);
      getProfileInfo();
    } catch (error) {
      setErrorMessage(constants.profileForm.updateError);
    }
  };
  const loader = () => {
    if (isLoading) return <Loading />;
  };
  console.log(ownerData);
  useEffect(() => {
    if (ownerData) {
      const fieldObj = {
        ...isFieldsObj,
        OWNER: ownerData,
      };
      setIsFieldsObj(fieldObj);
    }
  }, [ownerData]);
  return (
    <>
      {isLoading ? (
        loader()
      ) : (
        <>
          <CardBody
            className={editMode ? '' : 'right-bar-vh h-100 overflow-y-auto'}
          >
            <Form
              onSubmit={
                editMode
                  ? handleSubmit(handleUpdate)
                  : handleSubmit(onHandleSubmit)
              }
            >
              {Object.keys(fields).map((key, index) => {
                return (
                  <div key={`fields-${index}`}>
                    <h5 className="pb-0">{key}</h5>
                    {fields[key]?.length > 0 &&
                      fields[key]?.map((item) => {
                        const fieldName =
                          item?.columnName !== ''
                            ? item?.columnName
                            : item?.key?.toLowerCase().replace(/\s+/g, '');
                        setValue(fieldName, isFieldsObj[fieldName]);
                        return (
                          <>
                            {item.columnName !== 'address_city' &&
                              item.columnName !== 'label_id' &&
                              item.columnName !== 'address_street' &&
                              item.columnName !== 'address_state' &&
                              item.columnName !== 'address_country' && (
                                <>
                                  {renderComponent(item?.field_type, {
                                    id: fieldName,
                                    value: isFieldsObj,
                                    label: item?.key,
                                    name: fieldName,
                                    placeholder: item?.key,
                                    className: 'text-capitalize',
                                    inputClass: item?.mandatory
                                      ? 'border-left-4 border-left-danger'
                                      : '',
                                    validationConfig: {
                                      required: item?.mandatory,
                                      inline: false,
                                      onChange,
                                    },
                                    errors,
                                    register,
                                    errorDisplay: 'mb-0',
                                    type:
                                      item?.field_type === 'CHAR' ||
                                      item?.field_type === 'NUMBER' ||
                                      item?.field_type === 'EMAIL' ||
                                      item?.field_type === 'URL' ||
                                      item?.field_type === 'PHONE'
                                        ? 'input'
                                        : item?.field_type === 'TEXT'
                                        ? 'textarea'
                                        : '',
                                  })}
                                </>
                              )}
                            {item.columnName === 'address_city' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    value={isFieldsObj?.address_city}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    name={fieldName}
                                    validationConfig={{
                                      required: item?.mandatory
                                        ? `${item?.key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {item.columnName === 'address_street' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    value={isFieldsObj?.address_street}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    name={fieldName}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {item.columnName === 'address_country' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    value={isFieldsObj?.address_country}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    name={fieldName}
                                    validationConfig={{
                                      required: item?.mandatory
                                        ? `${item?.key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {item.columnName === 'address_state' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    value={isFieldsObj?.address_state}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    name={fieldName}
                                    validationConfig={{
                                      required: item?.mandatory
                                        ? `${item?.key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {item.columnName === 'label_id' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <ControllerValidation
                                    name={fieldName}
                                    validationConfig={{
                                      required: item?.mandatory
                                        ? `${item?.key} is required.`
                                        : '',
                                    }}
                                    errors={errors}
                                    form={isFieldsObj}
                                    errorDisplay="mb-0"
                                    control={control}
                                    renderer={({ field }) => (
                                      <IdfSelectLabel
                                        fromNavBar
                                        value={isFieldsObj?.label}
                                        onChange={(label) => labelSelect(label)}
                                        name={fieldName}
                                        type={labelType}
                                        validationConfig={{
                                          required: item?.mandatory
                                            ? `${item?.key} is required.`
                                            : '',
                                        }}
                                        fieldState={getFieldState(fieldName)}
                                        placeholder={item?.key}
                                        {...props}
                                      />
                                    )}
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
              <FormGroup row className="py-1">
                <Label md={3} className="text-right font-size-sm">
                  {OWNER}
                </Label>
                <Col md={9} className="pl-0">
                  <IdfOwnersHeader
                    id="assigned_user_id"
                    name="assigned_user_id"
                    setOwnerData={setOwnerData}
                    ownerData={ownerData}
                    ownerOption={true}
                    showAvatar={true}
                    addBtnStyles={'bg-gray-5 add-icon'}
                    isClickable={false}
                    mainOwner={isFieldsObj?.user}
                    allowDelete
                    {...props}
                  />
                </Col>
              </FormGroup>
            </Form>
          </CardBody>
          <CardFooter className="bg-gray-5">
            <div className="d-flex gap-2 justify-content-end align-items-center">
              {editMode ? (
                <button
                  type="button"
                  className="btn btn-white btn-sm mr-2"
                  onClick={() => {
                    setEditMode(VIEW_CARD);
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-white"
                  data-dismiss="modal"
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}

              <ButtonIcon
                type="button"
                onClick={
                  editMode
                    ? handleSubmit(handleUpdate)
                    : handleSubmit(onHandleSubmit)
                }
                classnames="btn-sm"
                label={editMode ? 'Update' : 'Save'}
                loading={loading}
                color="primary"
              />
            </div>
          </CardFooter>
        </>
      )}
    </>
  );
};

export default OrganizationForm;
