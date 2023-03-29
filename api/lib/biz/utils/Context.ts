import {
  Admin,
  AdminTenant,
  TenantQuery,
  ContextQueryHandler,
  Tenant,
  RequiredTenantQuery,
  Ownable,
  OwnableQuery,
  User,
  OwnerTenant,
  OrganizationGuest,
  OrganizationGuestQuery,
} from './ContextQuery';
import { BizOpts } from './types';

/**
 * Allows restrictions based on the user context.
 *
 * We want to restrict this on the Biz layer level, not the DAO layer
 * as DAO should be free to query however we wish.
 */
export class Context {
  protected services: BizOpts['services'];
  protected user: BizOpts['user'];

  /**
   * This is for querying only with tenantId as OPTIONAL. This is mostly
   * for super admins who would like to query data across all tenants.
   */
  public query: ContextQueryHandler<TenantQuery>;

  /**
   * This is for querying only with tenantId as REQUIRED. This is mainly
   * used to query resources that are owned by the tenant and not a single
   * user.
   * And this also allows a super admin to provide a tenantId value of their
   * choosing.
   */
  public tenantQuery: ContextQueryHandler<RequiredTenantQuery>;

  /**
   * This is for querying by tenant, user id, and/or ownable ids. All of which
   * are OPTIONAL. Main purpose of this is to query resources by restricting it
   * to the context of the user.
   * This is mainly for locked down resources such as "organizations", "deals", etc.
   * A "lesson" is an example where this does not apply as a "lesson" belongs to the
   * tenant, not a single user.
   */
  public userQuery: ContextQueryHandler<OrganizationGuestQuery>;

  /**
   * Similar to userQuery but these will also include the owned ids for relevant
   * resource type.
   *
   * For example, owned `Deals` depends whether user has been added as a dealOwner.
   */
  public userContactQuery: ContextQueryHandler<OwnableQuery>;
  public userDealQuery: ContextQueryHandler<OwnableQuery>;
  public userOrganizationQuery: ContextQueryHandler<OwnableQuery>;
  public userOwnableQuery: ContextQueryHandler<OwnableQuery>;

  constructor(biz: Omit<BizOpts, 'emitter'>) {
    this.services = biz.services;
    this.user = biz.user;

    const noRestrictionBuilder = new Admin(biz);
    noRestrictionBuilder.setNext(new AdminTenant(biz)).setNext(new Tenant(biz));
    this.query = noRestrictionBuilder;

    const tenantBuilder = new AdminTenant(biz);
    tenantBuilder.setNext(new Tenant(biz));
    this.tenantQuery = tenantBuilder;

    const userBuilder = new Admin(biz);
    userBuilder
      .setNext(new AdminTenant(biz))
      .setNext(new OwnerTenant(biz))
      .setNext(new User(biz))
      .setNext(new OrganizationGuest(biz));
    this.userQuery = userBuilder;

    const userContactBuilder = new Admin(biz);
    userContactBuilder
      .setNext(new AdminTenant(biz))
      .setNext(new OwnerTenant(biz))
      .setNext(new Ownable('contact', biz));
    this.userContactQuery = userContactBuilder;

    const userDealBuilder = new Admin(biz);
    userDealBuilder
      .setNext(new AdminTenant(biz))
      .setNext(new OwnerTenant(biz))
      .setNext(new Ownable('deal', biz));
    this.userDealQuery = userDealBuilder;

    const userOrganizationBuilder = new Admin(biz);
    userOrganizationBuilder
      .setNext(new AdminTenant(biz))
      .setNext(new OwnerTenant(biz))
      .setNext(new Ownable('deal', biz));
    this.userOrganizationQuery = userOrganizationBuilder;

    let userOwnableQuery: ContextQueryHandler<OwnableQuery>;
    if (biz.type === 'contact') {
      userOwnableQuery = new Ownable('contact', biz);
    } else if (biz.type === 'deal') {
      userOwnableQuery = new Ownable('deal', biz);
    } else if (biz.type === 'organization') {
      userOwnableQuery = new Ownable('organization', biz);
    } else {
      userOwnableQuery = new User(biz);
    }
    const userOwnableBuilder = new Admin(biz);
    userOwnableBuilder
      .setNext(new AdminTenant(biz))
      .setNext(new OwnerTenant(biz))
      .setNext(userOwnableQuery);
    this.userOwnableQuery = userOwnableBuilder;
  }
}
