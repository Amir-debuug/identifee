import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { CardBody, CardFooter, Form, FormGroup, Label } from 'reactstrap';
import { find, toString } from 'lodash';

import organizationService from '../../services/organization.service';
import contactService from '../../services/contact.service';
import {
  currencies,
  PIPELINE,
  SEARCH_FOR_CONTACT,
  SEARCH_FOR_COMPANY,
  OWNER,
} from '../../utils/constants';
import {
  onGetOwners,
  onInputChange,
  onInputSearch,
} from '../../views/Deals/contacts/utils';
import DropdownSelect from '../DropdownSelect';
import userService from '../../services/user.service';
import productService from '../../services/product.service';
import {
  DATE_FORMAT,
  DATE_FORMAT_EJS,
  valueNumberValidator,
} from '../../utils/Utils';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDatepicker from '../inputs/ReactDatpicker';
import AutoComplete from '../AutoComplete';
import ButtonIcon from '../commons/ButtonIcon';
import { renderComponent } from '../peoples/constantsPeople';
import { CheckboxInput } from '../layouts/CardLayout';
import Loading from '../Loading';
import ControllerValidation from '../commons/ControllerValidation';
import DealProductsV2 from '../../views/Deals/pipelines/DealProductsV2';

const maxPrice = 99999999.0;

const DealForm = ({
  dispatch,
  dealFormData,
  profileInfo,
  searchValue,
  toggleModalSize,
  initialDeals = {},
  selectedStage,
  handleSubmit,
  setValue,
  errors,
  loading,
  getFieldState,
  isLoading,
  register,
  control,
  onClose,
  selectOrganization,
  setSelectOrganization,
  selectContactPerson,
  setSelectContactPerson,
  fields,
  pipelines,
  pipeline,
  selectedPipeline,
  setSearchOrg,
  setSearchContact,
  setSelectedPipeline,
  pipelineStages,
  setPipelineStages,
  searchOrg,
  searchContact,
  selectTitle,
  setSelectTitle,
  fromNavbar,
  setContainerWidth,
  getPipelineStages,
  ...props
}) => {
  const [data, setData] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [allContacts, setAllContact] = useState([]);
  const [, setSelectCurrency] = useState(currencies[0].value);
  const [closingDate, setClosingDate] = useState(new Date());
  const [selectOwner, setSelectOwner] = useState('');
  const [charactersRequire, setCharactersRequire] = useState('');
  const [, setProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [productsTotalAmount, setProductsTotalAmount] = useState(0);
  const [addProductsClicked, setAddProductsClicked] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const getProductsList = async () => {
    const resp = await productService
      .getProducts(null, { limit: 10 })
      .catch((err) => console.log(err));
    setProducts(resp?.data?.products);
  };

  async function onGetOrganzations() {
    if (searchOrg?.search) {
      setLoadingOrg(true);
      const response = await organizationService
        .getOrganizations(searchOrg, { limit: 10 })
        .catch((err) => err);

      setLoadingOrg(false);
      const { organizations } = response?.data;
      setAllOrganizations(organizations?.filter((o) => !!o.name));
    }
  }

  async function onGetContacts() {
    if (searchContact?.search) {
      setLoadingContact(true);
      const response = await contactService
        .getContact(searchContact, { limit: 10 })
        .catch((err) => err);

      setLoadingContact(false);
      const { contacts } = response?.data;
      setAllContact(
        contacts?.map((c) => ({ ...c, name: `${c.first_name} ${c.last_name}` }))
      );
    }
  }

  useEffect(() => {
    getProductsList();
    setDealProducts([
      {
        description: {},
        price: 0,
        quantity: 1,
      },
    ]);
  }, []);

  useEffect(() => {
    const newDealProducts = dealProducts?.map((product) => ({
      id: product.id,
      product_id: product.description.id,
      quantity: parseFloat(product.quantity),
      price: parseFloat(product.price),
    }));

    dispatch({
      ...dealFormData,
      products: newDealProducts,
    });

    dispatch({
      ...dealFormData,
      amount: toString(productsTotalAmount),
    });
  }, [productsTotalAmount]);

  useEffect(() => {
    const currencySelected = find(currencies, { id: dealFormData?.currency });

    setSelectCurrency(currencySelected?.title);
  }, [dealFormData?.currency]);

  useEffect(() => {
    onGetOwners(null, setData);
  }, []);

  useEffect(() => {
    onGetOrganzations();
  }, [searchOrg]);

  useEffect(() => {
    (async () => {
      if (!profileInfo && !dealFormData?.contact_organization_id) {
        return await onGetContacts();
      }
      await getOrganizationContacts();
    })();
  }, [searchContact, dealFormData?.contact_organization_id]);

  useEffect(() => {
    if (dealFormData.contact_organization_id && profileInfo) {
      setSelectOrganization(profileInfo);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const me = await getCurrentUser().catch((err) => console.log(err));

      dispatch({
        ...dealFormData,
        assigned_user_id: me?.id,
      });

      setSelectOwner(me);

      document
        .querySelector('.prevent-scroll')
        ?.addEventListener('wheel', (e) => {
          e.preventDefault();
        });
    })();
  }, []);

  useEffect(() => {
    const ownerSelected = find(data, { id: dealFormData.assigned_user_id });

    if (ownerSelected) {
      setSelectOwner(ownerSelected);
    }
  }, [dealFormData.owner]);

  useEffect(() => {
    if (dealFormData.contact_person_id && !profileInfo) {
      getOrganizationContacts();
    }
  }, [dealFormData?.contact_organization_id]);

  useEffect(() => {
    dispatch({
      ...dealFormData,
      lead_source: PIPELINE.toLowerCase(),
    });
    dispatch({
      ...dealFormData,
      date_closed: new Date().toISOString().split('T')[0],
    });
  }, []);

  const getOrganizationContacts = async () => {
    if (searchOrg?.search && dealFormData?.contact_organization_id) {
      const organizationContacts = await contactService
        .getContactsByorganizationId(
          {
            organizationId: dealFormData.contact_organization_id,
            ...searchContact,
          },
          {
            page: 1,
            limit: 10,
          }
        )
        .catch((err) => {
          console.log(err);
        });

      const { contacts } = organizationContacts || {};
      setAllContact(
        contacts?.map((c) => ({ ...c, name: `${c.first_name} ${c.last_name}` }))
      );
    }
  };

  const getCurrentUser = async () => {
    const user = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    return user;
  };

  const amountHandler = (e) => {
    let value = e.target.value <= 0 ? 0 : e.target.value;

    value = valueNumberValidator(value, 2, maxPrice);

    e.target.value = value;
    onInputChange(e, dispatch);
  };

  const onChangeClosingDate = (date) => {
    setClosingDate(date);
    dispatch({
      ...dealFormData,
      date_closed: new Date(date).toISOString().split('T')[0],
    });
  };

  const toggleAddProducts = (e) => {
    e?.preventDefault();
    if (addProductsClicked) {
      setProductsTotalAmount(0);
      setDealProducts([
        {
          description: {},
          price: 0,
          quantity: 1,
        },
      ]);
    }
    setContainerWidth(addProductsClicked ? 540 : 840);
    setAddProductsClicked(!addProductsClicked);
    // toggleModalSize(!addProductsClicked);
  };

  const handlePipelineStageSelect = (item) => {
    setSelectTitle(item?.name);
    dispatch({
      ...dealFormData,
      tenant_deal_stage_id: item?.id,
    });
  };

  const handlePipelineSelect = (item) => {
    setSelectedPipeline(item);
    setSelectTitle('');
  };

  useEffect(() => {
    if (selectedPipeline?.id) {
      getPipelineStages();
    }
  }, [selectedPipeline]);
  const onChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      ...dealFormData,
      [name]: value,
    });
  };
  const loader = () => {
    if (isLoading) return <Loading />;
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
      {isLoading ? (
        loader()
      ) : (
        <>
          <CardBody className="right-bar-vh h-100 overflow-y-auto">
            <Form onSubmit={handleSubmit}>
              {Object.keys(fields).map((key, index) => {
                return (
                  <div key={`fields-${index}`}>
                    <h5 className="pb-0">{key}</h5>
                    <div style={{ maxWidth: 540 }}>
                      {fields[key]?.length > 0 &&
                        fields[key]?.map((item) => {
                          const fieldName =
                            item?.columnName !== ''
                              ? item?.columnName
                              : item?.key?.toLowerCase().replace(/\s+/g, '');
                          setValue(fieldName, dealFormData[fieldName]);
                          return (
                            <>
                              {item?.key !== 'Company' &&
                              item?.key !== 'Pipeline & Stage' &&
                              item?.key !== 'Contact Person' &&
                              item?.key !== 'Closing Date' ? (
                                <div key={item?.id}>
                                  {renderComponent(item?.field_type, {
                                    value:
                                      item?.field_type === 'NUMBER'
                                        ? dealFormData.amount === '0'
                                          ? ''
                                          : dealFormData.amount
                                        : dealFormData,
                                    className: 'text-capitalize',
                                    label: item?.key,
                                    inputClass: item?.mandatory
                                      ? 'border-left-4 border-left-danger'
                                      : '',
                                    validationConfig: {
                                      required: item.mandatory,
                                      inline: false,
                                      onChange:
                                        item?.field_type === 'NUMBER'
                                          ? amountHandler
                                          : onChange,
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
                                    disabled:
                                      item?.field_type === 'NUMBER'
                                        ? addProductsClicked === true
                                        : '',
                                    name:
                                      item?.field_type === 'NUMBER'
                                        ? 'amount'
                                        : fieldName,
                                    placeholder:
                                      item?.field_type === 'NUMBER'
                                        ? '0'
                                        : item?.key,
                                  })}
                                </div>
                              ) : (
                                ''
                              )}
                              {item?.field_type === 'CHECKBOX' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  >
                                    {/* {item?.key} */}
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
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <CheckboxInput
                                          id={fieldName}
                                          onChange={onChange}
                                          label={item?.key}
                                          name={fieldName}
                                          validationConfig={{
                                            required: item?.mandatory
                                              ? `${item?.key} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          checked={
                                            dealFormData[fieldName] ===
                                            fieldName
                                          }
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {item?.key === 'Company' && (
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
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <AutoComplete
                                          id="contact_organization_id"
                                          placeholder={SEARCH_FOR_COMPANY}
                                          name="contact_organization_id"
                                          onChange={(e) => stateChange(e)}
                                          charactersRequire={charactersRequire}
                                          data={allOrganizations}
                                          loading={loadingOrg}
                                          type="company"
                                          onHandleSelect={(item) => {
                                            dispatch({
                                              ...dealFormData,
                                              contact_organization_id: item?.id,
                                              contact_organization_new: null,
                                            });

                                            setSelectOrganization(item);
                                          }}
                                          validationConfig={{
                                            required: item?.mandatory
                                              ? `${item?.key} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          customKey="name"
                                          selected={
                                            selectOrganization?.name || ''
                                          }
                                          search={searchOrg.search}
                                          createItem={(data) => {
                                            dispatch({
                                              ...dealFormData,
                                              contact_organization_new: data,
                                            });
                                          }}
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {item?.key === 'Pipeline & Stage' && (
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
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <Row>
                                          <FormGroup className="col w-50">
                                            <DropdownSelect
                                              data={pipelines}
                                              customTitle="name"
                                              name={fieldName}
                                              hideIcon={true}
                                              allOption={false}
                                              validationConfig={{
                                                required: item?.mandatory
                                                  ? `${item?.key} is required.`
                                                  : '',
                                              }}
                                              fieldState={getFieldState(
                                                fieldName
                                              )}
                                              customClasses="w-100"
                                              placeholder="Select Pipeline"
                                              toggleButtonClasses="rounded-right-0"
                                              onHandleSelect={(item) =>
                                                handlePipelineSelect(item)
                                              }
                                              select={
                                                selectedPipeline?.name ||
                                                pipeline?.name
                                              }
                                            />
                                          </FormGroup>
                                          <FormGroup className="col w-50 pl-0">
                                            <DropdownSelect
                                              data={pipelineStages}
                                              customTitle="title"
                                              hideIcon={true}
                                              validationConfig={{
                                                required: item?.mandatory
                                                  ? `${item?.key} is required.`
                                                  : '',
                                              }}
                                              fieldState={getFieldState(
                                                'stage'
                                              )}
                                              allOption={false}
                                              customClasses="w-100"
                                              toggleButtonClasses="rounded-left-0"
                                              placeholder="Select Pipeline Stage"
                                              onHandleSelect={(item) =>
                                                handlePipelineStageSelect(item)
                                              }
                                              select={selectTitle}
                                            />
                                          </FormGroup>
                                        </Row>
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {item?.key === 'Contact Person' && (
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
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <AutoComplete
                                          id="contact_person_id"
                                          placeholder={SEARCH_FOR_CONTACT}
                                          loading={loadingContact}
                                          name="contact_person_id"
                                          type="contact"
                                          showAvatar={true}
                                          customKey="name"
                                          onChange={(e) =>
                                            onInputSearch(
                                              e,
                                              searchContact,
                                              setSearchContact
                                            )
                                          }
                                          validationConfig={{
                                            required: item?.mandatory
                                              ? `${item?.key} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          data={allContacts}
                                          onHandleSelect={(item) => {
                                            dispatch({
                                              ...dealFormData,
                                              contact_person_new: null,
                                              contact_person_id: item?.id,
                                            });
                                            setSelectContactPerson(item);
                                          }}
                                          search={searchContact.search}
                                          selected={
                                            selectContactPerson
                                              ? `${selectContactPerson.first_name} ${selectContactPerson.last_name}`
                                              : ''
                                          }
                                          createItem={(data) => {
                                            dispatch({
                                              ...dealFormData,
                                              contact_person_new: data,
                                            });
                                          }}
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {item?.key === 'Closing Date' && (
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
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <ReactDatepicker
                                          id="date_closed"
                                          name="date_closed"
                                          format={DATE_FORMAT_EJS}
                                          minDate={new Date()}
                                          todayButton="Today"
                                          value={closingDate}
                                          validationConfig={{
                                            required: item?.mandatory
                                              ? `${item?.key} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          className="form-control mx-0 mb-0"
                                          placeholder={DATE_FORMAT}
                                          onChange={(date) =>
                                            onChangeClosingDate(date)
                                          }
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
                    {!addProductsClicked && (
                      <div className="py-2">
                        <ButtonIcon
                          color="link"
                          icon="add"
                          type="button"
                          onclick={(e) => toggleAddProducts(e)}
                          label={'Products'}
                          classnames={`border-0 px-2 btn-block font-weight-semi-bold text-left bg-gray-5 rounded text-primary`}
                        />
                      </div>
                    )}
                    {addProductsClicked && (
                      <div className="mt-3">
                        <DealProductsV2
                          heading="Associated Products"
                          mode={2}
                          toggle={toggleAddProducts}
                          dealFormData={dealFormData}
                          dispatch={dispatch}
                        />
                      </div>
                    )}
                    <FormGroup className="mb-2">
                      <Label>{OWNER}</Label>
                      <IdfOwnersHeader
                        id="assigned_user_id"
                        name="assigned_user_id"
                        showAvatar={true}
                        isClickable={false}
                        mainOwner={selectOwner}
                        addBtnStyles={'bg-gray-5 add-icon'}
                        allowDelete
                        {...props}
                      />
                    </FormGroup>
                  </div>
                );
              })}
            </Form>
          </CardBody>
          <CardFooter className="bg-gray-5">
            <div className="d-flex gap-2 justify-content-end align-items-center">
              <button
                type="button"
                className="btn btn-sm btn-white"
                data-dismiss="modal"
                onClick={() => onClose()}
              >
                Cancel
              </button>
              <ButtonIcon
                type="button"
                onclick={handleSubmit}
                classnames="btn-sm"
                label={'Save'}
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

export default DealForm;
