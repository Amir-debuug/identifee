export const items = [
  {
    id: 'edit',
    name: 'Rename',
    icon: 'edit',
    permission: {
      collection: 'contacts',
      action: 'edit',
    },
  },
  {
    id: 'remove',
    icon: 'delete',
    name: 'Remove',
    permission: {
      collection: 'contacts',
      action: 'delete',
    },
  },
  {
    id: 'download',
    icon: 'download',
    name: 'Download',
  },
];

export const DEAL_REOPENED = 'Deal Reopened';

export const ERROR_UPDATE_STATUS = "You don't have permission to update status";

export const ERROR_CONTACT_UPDATE_CUSTOMER = 'Contact cant be updated';

export const ERROR_ORGANIZATION_UPDATE_CUSTOMER = 'Contact cant be updated';

export const CONTACT_ADDED_CUSTOMER = 'Contact added as customer';

export const CONTACT_REMOVED_CUSTOMER = 'Contact was removed for customers';

export const WON = 'won';

export const LOST = 'lost';

export const REOPEN = 'Reopen';

export const PIPELINE_LABEL = 'Pipeline';

export const ADD_PRODUCTS = 'Add Products';

export const NO_CONTACT_PERSON = 'No Contact';

export const NO_ORGANIZATION = 'No Organization';

export const CONTACT_NOT_FOUND = 'Contact not found';
