import { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';

import mapService from '../../../services/map.service';
import { splitAddress } from '../../../utils/Utils';
import AutoComplete from '../../AutoComplete';

const IdfSearchDirections = ({
  label,
  value,
  onChange,
  validationConfig,
  fieldState,
  isFieldsObj,
  setIsFieldsObj,
  addActivity,
  fromNavBar = false,
  ...restProps
}) => {
  const [dataLocations, setDataLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value?.address_street || value) {
      onDirections(value?.address_street || value);
    }
  }, [value?.address_street || value]);

  const onDirections = async (value) => {
    setLoading(true);
    const response = await mapService
      .getGoogleAddress(value)
      .catch((err) => console.log(err));

    const { data } = response || {};

    setLoading(false);
    setDataLocations(data);
  };

  const fieldInFields = (e, item) => {
    const { city, state, country } = splitAddress(item);

    if (fromNavBar) {
      // just handling add organization popup flow where we need to show full address on selection
      onChange({
        item,
        target: {
          name: 'address_full',
          value: item,
        },
      });
      onChange({
        target: {
          name: 'address_street',
          value: item.name,
        },
      });
    } else {
      onChange({
        target: {
          name: 'address_street',
          value: item.name,
        },
      });
    }
    onChange({
      target: {
        name: 'address_country',
        value: country,
      },
    });
    onChange({
      target: {
        name: 'address_city',
        value: city,
      },
    });

    onChange({
      target: {
        name: 'address_state',
        value: state.name || '',
      },
    });
    const addressData = {
      ...isFieldsObj,
      address_street: item?.main_text,
      address_country: item?.structured_formatting?.secondary_text,
      address_city: city,
      address_state: state.name,
    };
    setIsFieldsObj(addressData);
  };

  return (
    <FormGroup>
      {label && <Label className="mb-0 form-label">{label}</Label>}
      <AutoComplete
        id="search_directions_dropdown"
        placeholder="Search Address"
        name="search_directions_dropdown"
        customKey="name"
        loading={loading}
        validationConfig={validationConfig}
        fieldState={fieldState}
        showAvatar={false}
        onChange={(e) => onDirections(e.target.value)}
        data={dataLocations}
        onHandleSelect={(item) => {
          fieldInFields({}, item);
        }}
        selected={!addActivity ? value?.address_street : value?.address_city}
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSearchDirections;
