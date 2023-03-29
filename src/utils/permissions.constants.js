import { isMatchInCommaSeperated } from './Utils';

// will add more permissions over the time, currently handling Resources view and its import/export actions based on tenant modules list
export const PermissionsConstants = {
  Resources: {
    import: 'Resources-Import',
    export: 'Resources-Export',
    import_: 'resources_import',
    export_: 'resources_export',
  },
};

export const checkPermission = (modules, permissions) => {
  return permissions.filter((key) => {
    return isMatchInCommaSeperated(modules, key);
  });
};
