import { Expand, RequireKeys } from 'lib/utils';
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { defaultModelOptions, ToCreateType, ToSequelizeModel } from '../types';
import { ContactDB } from './ContactDB';
import { FeedDB } from './FeedDB';
import { LabelDB } from './LabelDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export type OrganizationAttr = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format uuid
   */
  tenant_id: string;
  /**
   * @maxLength 255
   */
  name?: string;
  date_entered?: Date; // TODO is this ever null?
  date_modified?: Date; // TODO is this ever null?
  /**
   * @format uuid
   */
  modified_user_id?: string; // TODO is this ever null?
  /**
   * @format uuid
   */
  created_by: string; // TODO is this ever null?
  deleted: boolean; // TODO should be required type
  /**
   * @format uuid
   */
  assigned_user_id: string; // TODO investigate whether this can be null...
  /**
   * @maxLength 100
   */
  industry?: string;
  /**
   * @maxLength 100
   */
  annual_revenue?: string;
  /**
   * @maxLength 100
   */
  annual_revenue_merchant?: string;
  /**
   * @maxLength 100
   */
  annual_revenue_treasury?: string;
  /**
   * @maxLength 100
   */
  annual_revenue_business_card?: string;
  /**
   * @maxLength 100
   */
  total_revenue?: string;
  /**
   * @maxLength 100
   */
  phone_fax?: string;
  /**
   * @maxLength 155
   */
  billing_address_street?: string;
  /**
   * @maxLength 100
   */
  billing_address_city?: string;
  /**
   * @maxLength 100
   */
  billing_address_state?: string;
  /**
   * @maxLength 20
   */
  billing_address_postalcode?: string;
  /**
   * @maxLength 255
   */
  billing_address_country?: string;
  /**
   * @maxLength 100
   */
  rating?: string;
  /**
   * @maxLength 100
   */
  phone_office?: string;
  /**
   * @maxLength 100
   */
  phone_alternate?: string;
  /**
   * @maxLength 255
   */
  website?: string;

  // ownership?: string; // TODO drop this column

  employees?: number;
  /**
   * @maxLength 10
   */
  ticker_symbol?: string;
  /**
   * @maxLength 150
   */
  address_street?: string;
  /**
   * @maxLength 150
   */
  address_suite?: string;
  /**
   * @maxLength 100
   */
  address_city?: string;
  /**
   * @maxLength 100
   */
  address_state?: string;
  /**
   * @maxLength 20
   */
  address_postalcode?: string;
  /**
   * @maxLength 255
   */
  address_country?: string;
  /**
   * @maxLength 10
   */
  sic_code?: string;
  /**
   * @maxLength 150
   */
  status?: string; // TODO make this an enum
  /**
   * @maxLength 10
   * @pattern ^\d+$
   */
  naics_code?: string;
  is_customer?: boolean;
  /**
   * @maxLength 50
   */
  cif?: string;
  /**
   * @maxLength 10
   */
  branch?: string;
  /**
   * @maxLength 64
   */
  external_id?: string;
  /**
   * @maxLength 255
   */
  avatar?: string;
  /**
   * @format uuid
   */
  label_id?: string | null;
};

export type OrganizationCreateDAO = ToCreateType<
  OrganizationAttr,
  'id',
  'deleted'
>;
export type OrganizationModifyDAO = Partial<
  Omit<OrganizationCreateDAO, 'tenant_id'>
>;

export type OrganizationImportQuery = {
  updateExisting: boolean;
};
export type OrganizationImportDAO = Expand<
  RequireKeys<
    Pick<
      OrganizationCreateDAO,
      | 'name'
      | 'naics_code'
      | 'industry'
      | 'address_street'
      | 'address_city'
      | 'address_state'
      | 'address_postalcode'
      | 'address_country'
      | 'branch'
      | 'employees'
      | 'total_revenue'

      // user properties
      | 'tenant_id'
      | 'assigned_user_id'
      | 'created_by'
      | 'modified_user_id'
    >,
    'name'
  >
>;
export type OrganizationImportBiz = Omit<
  OrganizationImportDAO,
  'tenant_id' | 'assigned_user_id' | 'created_by' | 'modified_user_id'
>;

@Table({
  ...defaultModelOptions,
  tableName: 'organizations',
  timestamps: false,
})
export class OrganizationDB extends Model<
  OrganizationAttr,
  ToSequelizeModel<OrganizationCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: OrganizationAttr['id'];

  @HasMany(() => FeedDB, 'organization_id')
  feeds!: FeedDB[];

  // TODO add tenant FK
  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: OrganizationAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @Column(DataType.STRING)
  name!: OrganizationAttr['name'];

  @Column(DataType.DATE)
  date_entered!: OrganizationAttr['date_entered'];

  @Column(DataType.DATE)
  date_modified!: OrganizationAttr['date_modified'];

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  modified_user_id!: OrganizationAttr['modified_user_id'];
  @BelongsTo(() => UserDB, 'modified_user_id')
  modified_user!: UserDB;

  // TODO make this not null
  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  created_by!: OrganizationAttr['created_by'];
  @BelongsTo(() => UserDB, 'created_by')
  organization_created_by!: UserDB;

  @Default(false)
  @Column(DataType.BOOLEAN)
  deleted!: OrganizationAttr['deleted'];

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  assigned_user_id!: OrganizationAttr['assigned_user_id'];
  @BelongsTo(() => UserDB, 'assigned_user_id')
  assigned_user!: UserDB;

  @Column(DataType.STRING(100))
  industry!: OrganizationAttr['industry'];

  @Column(DataType.STRING(100))
  annual_revenue!: OrganizationAttr['annual_revenue'];

  @Column(DataType.STRING(100))
  annual_revenue_merchant!: OrganizationAttr['annual_revenue_merchant'];

  @Column(DataType.STRING(100))
  annual_revenue_treasury!: OrganizationAttr['annual_revenue_treasury'];

  @Column(DataType.STRING(100))
  annual_revenue_business_card!: OrganizationAttr['annual_revenue_business_card'];

  @Column(DataType.STRING(100))
  total_revenue!: OrganizationAttr['total_revenue'];

  @Column(DataType.STRING(100))
  phone_fax!: OrganizationAttr['phone_fax'];

  @Column(DataType.STRING(155))
  billing_address_street!: OrganizationAttr['billing_address_street'];

  @Column(DataType.STRING(100))
  billing_address_city!: OrganizationAttr['billing_address_city'];

  @Column(DataType.STRING(100))
  billing_address_state!: OrganizationAttr['billing_address_state'];

  @Column(DataType.STRING(20))
  billing_address_postalcode!: OrganizationAttr['billing_address_postalcode'];

  @Column(DataType.STRING(255))
  billing_address_country!: OrganizationAttr['billing_address_country'];

  @Column(DataType.STRING(100))
  rating!: OrganizationAttr['rating'];

  @Column(DataType.STRING(100))
  phone_office!: OrganizationAttr['phone_office'];

  @Column(DataType.STRING(100))
  phone_alternate!: OrganizationAttr['phone_alternate'];

  @Column(DataType.STRING(255))
  website!: OrganizationAttr['website'];

  @Column(DataType.INTEGER)
  employees!: OrganizationAttr['employees'];

  @Column(DataType.STRING(10))
  ticker_symbol!: OrganizationAttr['ticker_symbol'];

  @Column(DataType.STRING(150))
  address_street!: OrganizationAttr['address_street'];

  @Column(DataType.STRING(150))
  address_suite!: OrganizationAttr['address_suite'];

  @Column(DataType.STRING(100))
  address_city!: OrganizationAttr['address_city'];

  @Column(DataType.STRING(100))
  address_state!: OrganizationAttr['address_state'];

  @Column(DataType.STRING(20))
  address_postalcode!: OrganizationAttr['address_postalcode'];

  @Column(DataType.STRING(255))
  address_country!: OrganizationAttr['address_country'];

  @Column(DataType.STRING(10))
  sic_code!: OrganizationAttr['sic_code'];

  @Column(DataType.STRING(150))
  status!: OrganizationAttr['status'];

  @Column(DataType.STRING(10))
  naics_code!: OrganizationAttr['naics_code'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_customer!: OrganizationAttr['is_customer'];

  @Column(DataType.STRING(50))
  cif!: OrganizationAttr['cif'];

  @Column(DataType.STRING(10))
  branch!: OrganizationAttr['branch'];

  @Column(DataType.STRING(64))
  external_id!: OrganizationAttr['external_id'];

  @Column(DataType.STRING(255))
  avatar!: OrganizationAttr['avatar'];

  @ForeignKey(() => LabelDB)
  @Column(DataType.UUID)
  label_id!: OrganizationAttr['label_id'];
  @BelongsTo(() => LabelDB, 'label_id')
  label!: LabelDB;

  @HasMany(() => ContactDB, 'organization_id')
  contacts!: ContactDB[];
}
