import React, { useEffect } from 'react';
import TenantLogo from '../commons/TenantLogo';
import avatarService from '../../services/avatar.service';
import { changeFavIcon } from '../../utils/Utils';

export default function BrandLogoIcon({ tenant }) {
  useEffect(() => {
    const setFavIcon = async () => {
      const logo = await avatarService.getAvatarMemo(tenant.icon, true);
      if (logo) {
        changeFavIcon(logo.url);
      }
    };

    setFavIcon();
  }, [tenant]);

  return (
    <>
      {tenant?.logo && tenant?.use_logo ? (
        <TenantLogo
          alt={`${tenant.name} Logo`}
          tenant={tenant}
          imageStyle="size-logo-login"
        />
      ) : tenant?.icon && !tenant?.use_logo ? (
        <TenantLogo
          alt={`${tenant.name} Logo`}
          tenant={{ ...tenant, logo: tenant.icon }}
          imageStyle="size-logo-login"
        />
      ) : (
        <img
          className="z-index-2 size-logo-login"
          src={'/img/logo.svg'}
          alt={`${tenant.name} Logo`}
        />
      )}
    </>
  );
}
