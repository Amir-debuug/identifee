import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import React from 'react';
import { FormGroup, Label } from 'reactstrap';
import { DATE_FORMAT, DATE_FORMAT_EJS } from '../../../utils/Utils';

const IdfDatePicker = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  inputClass,
  format = DATE_FORMAT,
}) => {
  const onHandleChange = (e) => {
    if (e?.value) {
      onChange({
        target: {
          value: moment(e.value).format(format),
          name,
          id: name,
        },
      });
    }
  };

  return (
    <FormGroup>
      <Label>{label}</Label>
      <DatePickerComponent
        id={name}
        name={name}
        format={DATE_FORMAT_EJS}
        className={`calendar-activity form-control ${inputClass}`}
        placeholder={placeholder}
        openOnFocus={true}
        value={value[name] || ''}
        onChange={onHandleChange}
      />
    </FormGroup>
  );
};

export default IdfDatePicker;
