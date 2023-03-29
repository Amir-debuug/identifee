import moment from 'moment';

import {
  generateGetField,
  generateGetFields,
  generateRemoveField,
  generateUpsertField,
  operationMiddleware,
  ParentResourceType,
} from 'lib/middlewares/openapi';
import { fieldFactory } from 'lib/services';

export enum FieldType {
  // string
  CHAR = 'CHAR',
  TEXT = 'TEXT',
  CURRENCY = 'CURRENCY',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  URL = 'URL',

  // number
  NUMBER = 'NUMBER',

  // boolean
  CHECKBOX = 'CHECKBOX',

  // date
  DATE = 'DATE',
  TIME = 'TIME',
}

export type FieldMapping = {
  name: string;
  description: string;
  db_field:
    | 'value_char'
    | 'value_text'
    | 'value_number'
    | 'value_boolean'
    | 'value_date';
  field_type: FieldType;
  value_type: 'date' | 'number' | 'object' | 'string' | 'boolean';
  isValid: (value: string | number | boolean | object) => boolean;
};

export const fieldMappings: { [T in keyof typeof FieldType]: FieldMapping } = {
  // String types
  [FieldType.CHAR]: {
    name: 'Text',
    description: 'Text field is used to store texts up to 255 characters',
    db_field: 'value_char',
    field_type: FieldType.CHAR,
    value_type: 'string',
    isValid: function (value: string | number | boolean | object) {
      return !!value && typeof value === 'string' && value.length <= 255;
    },
  },
  [FieldType.TEXT]: {
    name: 'Text Long',
    description: 'Long text field is used to store texts longer than usual.',
    db_field: 'value_text',
    field_type: FieldType.TEXT,
    value_type: 'string',
    isValid: function (value: string | number | boolean | object) {
      return !!value && typeof value === 'string';
    },
  },

  [FieldType.CURRENCY]: {
    name: 'Currency',
    description: 'Currency field is used to store currency symbol',
    db_field: 'value_text',
    field_type: FieldType.CURRENCY,
    value_type: 'string',
    isValid: function (value: string | number | boolean | object) {
      if (typeof value !== 'string') {
        return false;
      }

      const emailRegex = /[$£]/g;
      return emailRegex.test(value);
    },
  },

  [FieldType.EMAIL]: {
    name: 'Email',
    description: 'Email field is used to store email address',
    db_field: 'value_text',
    field_type: FieldType.EMAIL,
    value_type: 'string',
    isValid: function (value: string | number | boolean | object) {
      if (typeof value !== 'string') {
        return false;
      }

      const currencyRegex = /\S+@\S+\.\S+/g;
      return currencyRegex.test(value);
    },
  },

  [FieldType.PHONE]: {
    name: 'Phone',
    description: 'Phone field is used to store phone number',
    db_field: 'value_text',
    field_type: FieldType.PHONE,
    value_type: 'string',
    isValid: function (value: string | number | boolean | object) {
      if (typeof value !== 'string') {
        return false;
      }

      const phoneRegex = /\d{3}-\d{3}-\d{4}/g;
      return phoneRegex.test(value);
    },
  },

  [FieldType.URL]: {
    name: 'Url',
    description: 'Url field is used to store urls',
    db_field: 'value_text',
    field_type: FieldType.URL,
    value_type: 'string',
    isValid: function (value: string | number | boolean | object) {
      if (typeof value !== 'string') {
        return false;
      }

      const urlRegex =
        /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g;
      return urlRegex.test(value);
    },
  },

  [FieldType.CHECKBOX]: {
    name: 'Checkbox',
    description: 'Checkbox field is used to checkbox boolean',
    db_field: 'value_boolean',
    field_type: FieldType.CHECKBOX,
    value_type: 'boolean',
    isValid: function (value: string | number | boolean | object) {
      if (typeof value !== 'boolean') {
        return false;
      }

      const boolean = [false, true];
      return boolean.includes(value);
    },
  },

  // Number types
  [FieldType.NUMBER]: {
    name: 'Numeric',
    description:
      'Number field is used to store data such as amount of commission or other custom numerical data.',
    db_field: 'value_number',
    field_type: FieldType.NUMBER,
    value_type: 'number',
    isValid: function (value: string | number | boolean | object) {
      return !!value && typeof value === 'number';
    },
  },

  // Date types
  [FieldType.TIME]: {
    name: 'Time',
    description: 'Time field is used to store times.',
    db_field: 'value_text',
    field_type: FieldType.TIME,
    value_type: 'string', // HH:mm:ss (AM/PM)
    isValid: function (value: string | number | boolean | object) {
      if (typeof value !== 'string') {
        return false;
      }

      const timeRegex = /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/g;
      const timeRegexWithMeridiem =
        /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9] ([AaPp][Mm])/g;

      const hasMeridiem = value.length > 8;
      return hasMeridiem
        ? timeRegexWithMeridiem.test(value)
        : timeRegex.test(value);
    },
  },
  [FieldType.DATE]: {
    name: 'Date',
    description: 'Date field is used to store valid ISO-8601 dates.',
    db_field: 'value_date',
    field_type: FieldType.DATE,
    value_type: 'date',
    isValid: function (value: string | number | boolean | object) {
      return (
        typeof value === 'string' && moment(value, moment.ISO_8601).isValid()
      );
    },
  },
};

type FieldParentResourceType = Exclude<ParentResourceType, 'Deal'>;

export const getAllFields = (type: FieldParentResourceType) => {
  const opId = `get${type}sFields` as const;
  const op = operationMiddleware(
    opId,
    generateGetFields(type),

    async (req, res) => {
      const {
        query: { ...pagination },
        user,
      } = req;

      const fieldService = fieldFactory(
        user,
        type.toLowerCase() as Lowercase<FieldParentResourceType>
      );

      const fields = await fieldService.get(pagination);

      return res.success(fields);
    }
  );

  return op;
};

export const getField = (type: FieldParentResourceType) => {
  const opId = `get${type}sField` as const;
  const op = operationMiddleware(
    opId,
    generateGetField(type),

    async (req, res) => {
      const {
        params: { field_id },
        user,
      } = req;

      const fieldService = fieldFactory(
        user,
        type.toLowerCase() as Lowercase<FieldParentResourceType>
      );

      const field = await fieldService.getOne(field_id);
      if (!field) {
        return res.error(404, { error: 'Field not found' });
      }

      return res.success(field);
    }
  );

  return op;
};

export const upsertField = (type: FieldParentResourceType) => {
  const opId = `upsert${type}sField` as const;
  const op = operationMiddleware(
    opId,
    generateUpsertField(type),

    async (req, res) => {
      const { user, body } = req;

      const fieldService = fieldFactory(
        user,
        type.toLowerCase() as Lowercase<FieldParentResourceType>
      );

      try {
        const field = await fieldService.upsert({
          ...body,
          value_type: fieldMappings[body.field_type].value_type,
        });
        return res.success(field);
      } catch (error: any) {
        if (error.status === 400) {
          return res.error(400, {
            error: 'Unable to update field type when its in use',
          });
        }
        throw error;
      }
    }
  );

  return op;
};

export const removeField = (type: FieldParentResourceType) => {
  const opId = `remove${type}sField` as const;
  const op = operationMiddleware(
    opId,
    generateRemoveField(type),

    async (req, res) => {
      const {
        params: { field_id },
        user,
      } = req;

      const fieldService = fieldFactory(
        user,
        type.toLowerCase() as Lowercase<FieldParentResourceType>
      );

      const field = await fieldService.getOne(field_id);
      if (!field) {
        return res.error(404, { error: 'Field not found' });
      }
      await fieldService.remove(field_id);

      return res.success({});
    }
  );

  return op;
};
