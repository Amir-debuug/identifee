import { Expand } from 'lib/utils';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  camelModelOptions,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { ContactDB } from './ContactDB';
import { OrganizationDB } from './OrganizationDB';
import { TenantDB } from './TenantDB';

export type ActivityRequestAvailability = {
  days: (
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  )[];
  timePeriods: ('morning' | 'afternoon' | 'evening')[];
};

export type ActivityRequestAttr = {
  /**
   * @format uuid
   */
  activityRequestId: string;
  /**
   * @format uuid
   */
  organizationId: string;

  /**
   * This is the available time of the contact, not the owner. Availability can
   * span across multiple days and multiple friendly time ranges. i.e. a MWF with
   * morning and afternoon.
   */
  availability: Expand<ActivityRequestAvailability>;

  notes?: string | null;

  /**
   * @format uuid
   */
  createdByContactId: string;
  /**
   * @format uuid
   */
  tenantId: string;
};

export type ActivityRequestCreateDAO = ToCreateType<
  ActivityRequestAttr,
  'activityRequestId',
  never
>;
export type ActivityRequestModifyDAO = ToModifyType<
  ActivityRequestCreateDAO,
  'createdByContactId' | 'tenantId'
>;

export type ActivityRequestCreateBiz = Omit<
  ActivityRequestCreateDAO,
  'createdByContactId' | 'tenantId' | 'organizationId'
>;
export type ActivityRequestModifyBiz = Partial<ActivityRequestCreateBiz>;

@Table({
  ...camelModelOptions,
  tableName: 'activityRequest',
})
export class ActivityRequestDB extends Model<
  ActivityRequestAttr,
  ToSequelizeModel<ActivityRequestCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  activityRequestId!: ActivityRequestAttr['activityRequestId'];

  @ForeignKey(() => OrganizationDB)
  @Column(DataType.UUID)
  organizationId!: ActivityRequestAttr['organizationId'];
  @BelongsTo(() => OrganizationDB, 'organizationId')
  organization!: OrganizationDB;

  @AllowNull(false)
  @Column(DataType.JSON)
  availability!: ActivityRequestAttr['availability'];

  @AllowNull(true)
  @Column(DataType.TEXT)
  notes!: ActivityRequestAttr['notes'];

  @ForeignKey(() => ContactDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  createdByContactId!: ActivityRequestAttr['createdByContactId'];
  @BelongsTo(() => ContactDB, 'createdByContactId')
  createdByContact!: ContactDB;

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenantId!: ActivityRequestAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;
}
