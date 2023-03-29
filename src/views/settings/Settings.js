import React, { useContext } from 'react';
import SettingCardItem from '../../components/commons/SettingCardItem';
import { BRANDING_LABEL } from '../../utils/constants';
import { TenantContext } from '../../contexts/TenantContext';
import {
  isMatchInCommaSeperated,
  isPermissionAllowed,
} from '../../utils/Utils';
import { useProfileContext } from '../../contexts/profileContext';

const settingsValues = [
  {
    id: 1,
    title: 'Profile',
    label: 'profile',
    icon: 'account_circle',
    path: '/profile',
    requiredOwnerAccess: true,
    requiredAdminAccess: true,
    requiredAppAccess: true,
  },
  {
    id: 8,
    title: BRANDING_LABEL,
    icon: 'palette',
    label: 'branding',
    path: '/branding',
    requiredAdminAccess: true,
    requiredOwnerAccess: true,
  },

  {
    id: 5,
    title: 'Users And Controls',
    icon: 'group_add',
    label: 'manage_users',
    path: '/users',
    requiredAdminAccess: true,
    requiredOwnerAccess: true,
  },
  {
    id: 4,
    title: 'Notifications',
    icon: 'notifications',
    label: 'notifications',
    path: '/notifications',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
    requiredAppAccess: true,
  },
  {
    id: 9,
    title: 'Products',
    icon: 'app_registration',
    label: 'products',
    path: '/products',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 7,
    title: 'Training',
    icon: 'school',
    path: '/training',
    label: 'training',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 12,
    title: 'Pipelines and Stages',
    icon: 'view_carousel',
    path: '/pipelines-and-stages',
    label: 'pipeline_stages',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 13,
    title: 'Fields',
    icon: 'edit_note',
    path: '/fields',
    label: 'fields',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 11,
    title: 'Integrations',
    icon: 'view_comfy_alt',
    path: '/integrations',
    label: 'integrations',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    id: 10,
    title: 'Bulk Import',
    icon: 'upload',
    path: '/bulk-import',
    label: 'bulk_import',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
];
const Settings = () => {
  const { tenant } = useContext(TenantContext);
  const settingFiltered = settingsValues.filter((setting) => {
    const settingsInput = 'setting_' + setting.label;
    return (
      !tenant.modules ||
      tenant.modules === '*' ||
      isMatchInCommaSeperated(tenant.modules, settingsInput)
    );
  });
  const { profileInfo } = useProfileContext();
  return (
    <>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 font-weight-medium">
        {settingFiltered.map((item) => (
          <>
            {item.permissions ? (
              isPermissionAllowed(
                item.permissions.collection,
                item.permissions.action
              ) && (
                <>
                  <div className="col mb-5">
                    <SettingCardItem
                      item={item}
                      url={`/settings${item.path}`}
                    />
                  </div>
                </>
              )
            ) : (
              <>
                {!profileInfo?.role?.admin_access &&
                profileInfo?.role?.owner_access ? (
                  <div className="col mb-5">
                    <SettingCardItem
                      item={item}
                      url={`/settings${item.path}`}
                    />
                  </div>
                ) : (
                  ''
                )}
                {profileInfo?.role?.admin_access &&
                item.requiredAdminAccess === true ? (
                  <div className="col mb-5">
                    <SettingCardItem
                      item={item}
                      url={`/settings${item.path}`}
                    />
                  </div>
                ) : (
                  ''
                )}
                {profileInfo?.role?.app_access &&
                !profileInfo?.role?.owner_access &&
                !profileInfo?.role?.admin_access &&
                item.requiredAppAccess === true ? (
                  <div className="col mb-5">
                    <SettingCardItem
                      item={item}
                      url={`/settings${item.path}`}
                    />
                  </div>
                ) : (
                  ''
                )}
              </>
            )}
          </>
        ))}
      </div>
    </>
  );
};

export default Settings;
