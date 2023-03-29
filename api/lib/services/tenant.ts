import { Op } from 'sequelize';

import ParseSequelizeResponse from 'lib/utils/parseSequelizeResponse';
import { v4 as uuidv4 } from 'uuid';

import { Groups, Role, Tenant } from '../database';
import { storage } from 'lib/storage';
import { FilesService } from './files';
import { userServiceFactory } from './user';
import { AuthUser } from 'lib/middlewares/auth';
import { exception } from 'lib/middlewares/exception';
import { PermissionBiz } from 'lib/biz';

export class TenantService {
  static async getTenantById(id: string) {
    const result = await Tenant.findByPk(id);
    return ParseSequelizeResponse(result);
  }

  static async getByLogo(logo: string) {
    const result = await Tenant.findOne({
      where: {
        [Op.or]: [
          {
            logo,
          },
          {
            icon: logo,
          },
        ],
      },
    });
    return result?.toJSON();
  }

  static async getTenantBySubdomain(domain: string) {
    const result = await Tenant.findOne({
      where: {
        domain,
      },
    });
    return result?.toJSON();
  }

  static async createTenant(
    user: AuthUser,
    Permission: PermissionBiz,
    tenantData: any,
    userData: any
  ) {
    const id = uuidv4();

    const tenantBody = {
      id,
      ...tenantData,
    };

    const service = userServiceFactory(user);

    const tenant = await Tenant.findOne({
      where: { domain: tenantBody.domain },
    });

    if (tenant) {
      throw new exception.Conflict(
        'tenant with this domain name already exist'
      );
    }

    const result = await Tenant.create(tenantBody);

    if (!result) {
      throw new exception.InvalidPayload('invalid payload');
    }

    // default group

    const ceoGroup = {
      name: 'CEO',
      parent_id: null,
      tenant_id: result.id as string,
      has_sibling_access: false,
    };
    const ceo = await Groups.create(ceoGroup);

    const managerGroup = {
      name: 'Manager',
      parent_id: ceo.id,
      tenant_id: result.id as string,
      has_sibling_access: false,
    };

    await Groups.create(managerGroup);

    // default role

    const administrationRolePayload = {
      id: uuidv4(),
      name: 'Administrator',
      icon: 'supervised_user_circle',
      description: '',
      admin_access: false,
      app_access: true,
      tenant_id: result.id as string,
      owner_access: true,
      enforce_tfa: false,
    };

    const standardRolePayload = {
      id: uuidv4(),
      name: 'Application User',
      icon: 'supervised_user_circle',
      description: '',
      admin_access: false,
      app_access: true,
      tenant_id: result.id as string,
      owner_access: false,
      enforce_tfa: false,
    };

    const [administrationRole] = await Role.bulkCreate([
      administrationRolePayload,
      standardRolePayload,
    ]);

    // invite user

    try {
      await service.inviteUser(
        result.id as string,
        userData,
        administrationRole.id as string,
        ceo.id
      );
    } catch (error: any) {
      throw new exception.InvalidPayload('invalid invite');
    }

    return result.toJSON();
  }

  static async getMailThemeData(tenantId: string) {
    let logoUrl = '';
    const result = await Tenant.findByPk(tenantId);

    const tenant = ParseSequelizeResponse(result);
    const fileService = new FilesService();
    if (tenant?.logo && tenant?.icon) {
      const avatar = tenant?.use_logo
        ? tenant?.logo
          ? tenant?.logo
          : tenant?.icon
        : tenant?.icon;
      const file = await fileService.readOne(avatar);
      const disk = storage.disk(file.storage);
      const { signedUrl } = await disk.getSignedUrl(file?.filename_disk || '');
      logoUrl = signedUrl;
    }
    return {
      projectName: tenant?.name as string | undefined,
      projectUrl: `https://${tenant?.domain}`,
      projectLogo: logoUrl,
      projectColor: tenant?.colors?.primaryColor as string | undefined,
    };
  }
}
