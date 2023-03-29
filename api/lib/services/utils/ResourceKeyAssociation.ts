import { StaticModel } from 'lib/database/helpers';
import { AuthUser } from 'lib/middlewares/auth';
import { Model } from 'sequelize';
import BaseLog from './BaseLog';

export type ResourceKey = 'contact_id' | 'organization_id' | 'deal_id';
export type Resource = 'contact' | 'deal' | 'organization';

/**
 * This class is intended to be the base class for associating a resource by
 * using a resource key as a different pivot key.
 *
 * For example: People who are `Owners` are required for contacts, organizations,
 * and deals but use `Owner` table and corresponding pivot keys to join to the user
 * table. i.e. (contact_id, organization_id, deal_id). Whereas followers use the
 * same keys but `Follower` tables.
 */
export abstract class ResourceKeyAssociation<
  R extends Resource,
  T extends Extract<keyof U['_attributes'], ResourceKey>,
  U extends Model,
  V extends StaticModel<U> = StaticModel<U>
> extends BaseLog<U> {
  public resource: R;
  public resourceKey: T;

  constructor(model: V, user: AuthUser, resource: R, resourceKey: T) {
    super(model, user);
    this.resource = resource;
    this.resourceKey = resourceKey;
  }
}
