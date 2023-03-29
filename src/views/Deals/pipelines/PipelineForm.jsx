import moment from 'moment';
import React, { useEffect, useReducer, useState } from 'react';
import { Col, Form, FormGroup, Input, Label } from 'reactstrap';

import { ALL_LABEL, CANCEL_LABEL } from '../../../utils/constants';
import { labels } from '../contacts/Contacts.constants';
import {
  onGetOwners,
  onHandleSelect,
  onInputChange,
  onInputSearch,
  reducer,
} from '../contacts/utils';
import {
  DATE_FORMAT,
  DATE_FORMAT_EJS,
  valueNumberValidator,
} from '../../../utils/Utils';
import ReactDatepicker from '../../../components/inputs/ReactDatpicker';
// import { InputGroup } from 'react-bootstrap';
// import MaterialIcon from '../../../components/commons/MaterialIcon';
import AutoComplete from '../../../components/AutoComplete';
import { renderComponent } from '../../../components/peoples/constantsPeople';
import { InputGroup } from 'react-bootstrap';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../../../components/commons/ControllerValidation';
import ButtonIcon from '../../../components/commons/ButtonIcon';

const maxPrice = 99999999.0;

const PipelineForm = ({ setEditMode, deal, onHandleSubmit, fields }) => {
  const [data, setData] = useState([]);
  const [, setSelectStage] = useState(ALL_LABEL);
  const [selectOwner, setSelectOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [closingDate, setClosingDate] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: deal,
  });
  const [filter, setFilter] = useState({
    search: '',
    users: [],
  });

  const [dealFormData, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    document.querySelector('.prevent-scroll').addEventListener('wheel', (e) => {
      e.preventDefault();
    });
  }, []);

  useEffect(() => {
    if (deal) {
      dispatch({
        type: 'load',
        payload: deal,
      });

      getStage();
      getOwner();
    }
  }, [deal]);

  useEffect(() => {
    onGetOwners(filter, setData);
  }, [filter]);

  const getStage = () => {
    const stage = labels.find((label) => label.name === deal.deal_type);

    setSelectStage(stage?.title);
  };

  const getOwner = () => {
    setSelectOwner(
      `${deal.assigned_user.first_name} ${deal.assigned_user.last_name}`
    );
  };

  const onSubmit = async () => {
    setLoading(true);
    const newDealFormData = {
      ...dealFormData,
      sales_stage: dealFormData.deal_type,
    };

    onHandleSubmit(newDealFormData);
    reset(newDealFormData);
    setLoading(false);
  };

  const onChangeClosingDate = (selectedDate) => {
    setClosingDate(selectedDate);
    dispatch({
      type: 'set',
      input: 'date_closed',
      payload: moment(selectedDate).format(DATE_FORMAT),
    });
  };

  const amountHandler = (e) => {
    let { value } = e.target;

    value = valueNumberValidator(value, 2, maxPrice);

    e.target.value = value;
    onInputChange(e, dispatch);
  };
  const onChange = (e) => {
    onInputChange(e, dispatch);
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {Object.keys(fields).map((key, index) => {
        return (
          <div className="card-body bg-light" key={`feilds-${index}`}>
            <h5 className="pb-0">{key}</h5>
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
                    item?.key !== 'Closing Date' &&
                    item?.key !== 'Amount' ? (
                      <div key={item?.id}>
                        {renderComponent(item?.field_type, {
                          value: dealFormData,
                          name: fieldName,
                          label: item?.key,
                          className: 'text-capitalize',
                          inputClass: item?.mandatory
                            ? 'border-left-4 border-left-danger'
                            : '',
                          validationConfig: {
                            required: item.mandatory,
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
                          placeholder: item?.key,
                        })}
                      </div>
                    ) : (
                      ''
                    )}
                    {item?.key === 'Amount' && (
                      <FormGroup row className="py-1">
                        <Label
                          md={3}
                          className="text-right font-size-sm"
                          htmlFor="amount"
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
                              <InputGroup>
                                <InputGroup.Prepend>
                                  <InputGroup.Text as={'label'}>
                                    <MaterialIcon
                                      icon="attach_money"
                                      clazz="fs-6"
                                    />
                                  </InputGroup.Text>
                                </InputGroup.Prepend>
                                <Input
                                  type="number"
                                  name="amount"
                                  validationConfig={{
                                    required: item?.mandatory
                                      ? `${item?.key} is required.`
                                      : '',
                                  }}
                                  fieldState={getFieldState(fieldName)}
                                  id="amount"
                                  onChange={amountHandler}
                                  placeholder="Value"
                                  className={`prevent-scroll ${
                                    item?.mandatory
                                      ? 'border-left-4 border-left-danger rounded'
                                      : ''
                                  } ${
                                    getFieldState(fieldName)?.invalid &&
                                    !getFieldState(fieldName)?.error?.ref?.value
                                      ? 'border-danger'
                                      : ''
                                  }`}
                                  value={dealFormData.amount || ''}
                                />
                              </InputGroup>
                            )}
                          />
                        </Col>
                      </FormGroup>
                    )}

                    {item?.key === 'Company' && (
                      <FormGroup row className="py-1 align-items-center">
                        <Label
                          md={3}
                          className="text-right mb-0 font-size-sm"
                          htmlFor={fieldName}
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
                                id={fieldName}
                                placeholder={'Search for owner'}
                                selected={selectOwner}
                                customKey="name"
                                name={fieldName}
                                onChange={(e) =>
                                  onInputSearch(e, filter, setFilter)
                                }
                                data={data}
                                validationConfig={{
                                  required: item?.mandatory
                                    ? `${item?.key} is required.`
                                    : '',
                                }}
                                fieldState={getFieldState(fieldName)}
                                onHandleSelect={(item) =>
                                  onHandleSelect(
                                    item,
                                    fieldName,
                                    dispatch,
                                    setSelectOwner
                                  )
                                }
                              />
                            )}
                          />
                        </Col>
                      </FormGroup>
                    )}
                    {item?.key === 'Closing Date' && (
                      <FormGroup row className="py-1">
                        <Label
                          htmlFor={fieldName}
                          className="text-right font-size-sm"
                          md={3}
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
                                id={fieldName}
                                name={fieldName}
                                format={DATE_FORMAT_EJS}
                                minDate={new Date()}
                                todayButton="Today"
                                validationConfig={{
                                  required: item?.mandatory
                                    ? `${item?.key} is required.`
                                    : '',
                                }}
                                fieldState={getFieldState(fieldName)}
                                className="form-control mx-0 mb-0"
                                placeholder={DATE_FORMAT}
                                value={
                                  closingDate || new Date(deal.date_closed)
                                }
                                onChange={(date) => onChangeClosingDate(date)}
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
      <div className="card-footer text-right">
        <button
          type="button"
          className="btn btn-white btn-sm mr-2"
          onClick={() => {
            setEditMode(false);
          }}
        >
          {CANCEL_LABEL}
        </button>
        <ButtonIcon
          type="submit"
          classnames="btn-sm"
          label={'Save'}
          loading={loading}
          color="primary"
        />
      </div>
    </Form>
  );
};

export default PipelineForm;
