import React, { useEffect, useState } from 'react';
import { CardBody, CardFooter, Form, FormGroup, Label } from 'reactstrap';
import { Col } from 'react-bootstrap';

import organizationService from '../../services/organization.service';
import userService from '../../services/user.service';
import { OWNER, SEARCH_FOR_COMPANY } from '../../utils/constants';
import {
  onHandleSelect,
  onInputChange,
  onInputSearch,
} from '../../views/Deals/contacts/utils';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import IdfSelectLabel from '../idfComponents/idfDropdown/IdfSelectLabel';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import AutoComplete from '../AutoComplete';
import { renderComponent } from './constantsPeople';
import { CheckboxInput } from '../layouts/CardLayout';
import ButtonIcon from '../commons/ButtonIcon';
import { emailRegex } from '../../utils/Utils';
const PeopleForm = ({
  dispatch,
  peopleFormData,
  refresh,
  fields,
  onClose,
  loading,
  register,
  handleSubmit,
  setValue,
  getFieldState,
  control,
  errors,
  onHandleSubmit,
  searchValue,
  ...props
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchOrg, setSearchOrg] = useState({
    search: '',
  });
  const [selectOwner, setSelectOwner] = useState('');
  const [loadingOrg, setLoadingOrg] = useState(false);
  async function onGetOrganzations() {
    if (searchOrg?.search) {
      setLoadingOrg(true);
      const response = await organizationService
        .getOrganizations(searchOrg, { limit: 10 })
        .catch((err) => err);

      setLoadingOrg(false);

      const { organizations } = response?.data;
      setAllOrganizations(organizations.filter((o) => !!o.name));
    }
  }

  useEffect(() => {
    onGetOrganzations();
  }, [searchOrg?.search]);

  useEffect(() => {
    (async () => {
      const me = await getCurrentUser().catch((err) => console.log(err));
      dispatch({
        type: 'set',
        input: 'assigned_user_id',
        payload: me?.id,
      });

      setSelectOwner(me);
    })();
  }, []);
  const getCurrentUser = async () => {
    const user = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    return user;
  };

  const onChange = (e) => {
    onInputChange(e, dispatch);
  };
  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      onInputSearch(e, searchOrg, setSearchOrg);
    } else {
      return setCharactersRequire(match?.length);
    }
  };
  return (
    <>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <CardBody className="right-bar-vh h-100 overflow-y-auto">
        <Form onSubmit={handleSubmit(onHandleSubmit)}>
          {Object.keys(fields).map((key, index) => {
            return (
              <div key={`fields-${index}`}>
                <h5 className="pb-0">{key}</h5>
                <>
                  {fields[key]?.length > 0 &&
                    fields[key]?.map((item) => {
                      const fieldName =
                        item?.columnName !== ''
                          ? item?.columnName
                          : item?.key?.toLowerCase().replace(/\s+/g, '');
                      return (
                        <>
                          {item?.key !== 'Company' &&
                            item?.key !== 'Label' &&
                            item?.field_type !== 'CHECKBOX' &&
                            renderComponent(item?.field_type, {
                              value: peopleFormData,
                              label: item?.key,
                              className: 'text-capitalize',
                              inputClass: item?.mandatory
                                ? 'border-left-4 border-left-danger'
                                : '',
                              name: fieldName,
                              refresh,
                              placeholder: item.key,
                              validationConfig: {
                                required: item.mandatory,
                                inline: false,
                                onChange,
                                pattern:
                                  item?.field_type === 'EMAIL'
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
                          {item?.field_type === 'CHECKBOX' && (
                            <FormGroup row className="py-1">
                              <Label md={3} className="text-right font-size-sm">
                                {/* {item?.key} */}
                              </Label>
                              <Col md={9} className="pl-0">
                                <CheckboxInput
                                  id={fieldName}
                                  onChange={onChange}
                                  label={item?.key}
                                  name={fieldName}
                                  checked={
                                    peopleFormData[fieldName] === fieldName
                                  }
                                />
                              </Col>
                            </FormGroup>
                          )}
                          {item?.key === 'Company' && (
                            <FormGroup row className="py-1">
                              <Label md={3} className="text-right font-size-sm">
                                {item?.key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <AutoComplete
                                  id="organization_id"
                                  placeholder={SEARCH_FOR_COMPANY}
                                  name="organization_id"
                                  loading={loadingOrg}
                                  type="company"
                                  charactersRequire={charactersRequire}
                                  onChange={(e) => stateChange(e)}
                                  data={allOrganizations}
                                  onHandleSelect={(item) => {
                                    onHandleSelect(
                                      item,
                                      'organization_id',
                                      dispatch
                                    );
                                    dispatch({
                                      type: 'set',
                                      input: 'contact_organization_new',
                                      payload: null,
                                    });
                                  }}
                                  customKey="name"
                                  extraTitles={[
                                    'address_city',
                                    'address_state',
                                  ]}
                                  selected=""
                                  search={searchOrg.search}
                                  createItem={(data) => {
                                    dispatch({
                                      type: 'set',
                                      input: 'contact_organization_new',
                                      payload: data,
                                    });
                                  }}
                                />
                              </Col>
                            </FormGroup>
                          )}
                          {item?.key === 'Label' && (
                            <FormGroup row className="py-1">
                              <Label md={3} className="text-right font-size-sm">
                                {item?.key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <IdfSelectLabel
                                  type="contact"
                                  onChange={(item) =>
                                    onHandleSelect(item, 'label_id', dispatch)
                                  }
                                  refresh={refresh}
                                />
                              </Col>
                            </FormGroup>
                          )}
                        </>
                      );
                    })}
                </>
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
                showAvatar={true}
                mainOwner={selectOwner}
                isClickable={false}
                {...props}
              />
            </Col>
          </FormGroup>
        </Form>
      </CardBody>
      <CardFooter className="bg-gray-5">
        <div className="d-flex gap-2 justify-content-end align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-white"
            data-dismiss="modal"
            onClick={onClose}
          >
            Cancel
          </button>
          <ButtonIcon
            type="button"
            onClick={handleSubmit(onHandleSubmit)}
            classnames="btn-sm"
            label={'Save'}
            loading={loading}
            color="primary"
          />
        </div>
      </CardFooter>
    </>
  );
};

export default PeopleForm;
