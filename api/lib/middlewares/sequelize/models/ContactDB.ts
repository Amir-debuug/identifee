import { Expand, ExpandRecursively, RequireKeys } from 'lib/utils';
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
import {
  defaultModelOptions,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { FeedDB } from './FeedDB';
import { LabelDB } from './LabelDB';
import { OrganizationDB, OrganizationImportBiz } from './OrganizationDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export type ContactAttr = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format uuid
   */
  tenant_id: string;
  date_entered: Date; // TODO is this ever null?
  date_modified: Date; // TODO is this ever null?
  /**
   * @format uuid
   */
  modified_user_id?: string; // TODO is this ever null?
  /**
   * @format uuid
   */
  created_by: string; // TODO is this ever null?
  description?: string;
  deleted: boolean;
  /**
   * @format uuid
   */
  assigned_user_id?: string;
  /**
   * @maxLength 255
   */
  salutation?: string; // TODO is this used?
  /**
   * @maxLength 100
   */
  first_name?: string;
  /**
   * @maxLength 100
   */
  last_name?: string;

  /**
   * @string
   */
  name?: string | null; // this is a virtual column

  /**
   * @maxLength 255
   */
  title?: string;
  /**
   * @maxLength 255
   */
  department?: string;
  do_not_call?: boolean;
  /**
   * @maxLength 255
   */
  email_home?: string;
  /**
   * @maxLength 255
   */
  email_mobile?: string;
  /**
   * @maxLength 255
   */
  email_work?: string;
  /**
   * @maxLength 255
   */
  email_other?: string;
  /**
   * @maxLength 255
   */
  email_fax?: string;
  /**
   * @maxLength 100
   */
  phone_home?: string;
  /**
   * @maxLength 100
   */
  phone_mobile?: string;
  /**
   * @maxLength 100
   */
  phone_work?: string;
  /**
   * @maxLength 100
   */
  phone_other?: string;
  /**
   * @maxLength 100
   */
  phone_fax?: string;
  /**
   * @maxLength 100
   */
  primary_address_street?: string;
  /**
   * @maxLength 100
   */
  primary_address_city?: string;
  /**
   * @maxLength 100
   */
  primary_address_state?: string;
  /**
   * @maxLength 20
   */
  primary_address_postalcode?: string;
  /**
   * @maxLength 255
   */
  primary_address_country?: string;
  /**
   * @maxLength 100
   */
  alt_address_street?: string;
  /**
   * @maxLength 100
   */
  alt_address_city?: string;
  /**
   * @maxLength 100
   */
  alt_address_state?: string;
  /**
   * @maxLength 20
   */
  alt_address_postalcode?: string;
  /**
   * @maxLength 255
   */
  alt_address_country?: string;
  /**
   * @maxLength 75
   */
  assistant?: string;
  /**
   * @maxLength 100
   */
  assistant_phone?: string;
  /**
   * @maxLength 255
   */
  lead_source?: string;
  /**
   * @maxLength 255
   */
  avatar?: string;
  /**
   * @maxLength 75
   */
  status?: string; // TODO should be an enum
  /**
   * @format uuid
   */
  organization_id?: string | null;
  is_customer?: boolean;
  /**
   * @maxLength 50
   */
  cif?: string;
  /**
   * @maxLength 64
   */
  external_id?: string;
  /**
   * @format uuid
   */
  label_id?: string | null;
};

export type ContactCreateDAO = Expand<
  ToCreateType<
    ContactAttr,
    'id' | 'name',
    'deleted' | 'date_entered' | 'date_modified'
  >
>;
export type ContactModifyDAO = ToModifyType<
  ContactCreateDAO,
  'tenant_id' | 'created_by'
>;

export type ContactImportQuery = {
  updateExisting: boolean;
};
export type ContactImportDAO = Expand<
  RequireKeys<
    Pick<
      ContactCreateDAO,
      | 'first_name'
      | 'last_name'
      | 'email_work'
      | 'title'
      | 'email_other'
      | 'phone_work'
      | 'phone_mobile'
      | 'phone_home'
      | 'phone_other'
      | 'organization_id'
      | 'external_id'

      // user properties
      | 'tenant_id'
      | 'assigned_user_id'
      | 'created_by'
      | 'modified_user_id'
    >,
    'first_name' | 'last_name' | 'email_work'
  >
>;
export type ContactImportBiz = ExpandRecursively<
  Omit<
    ContactImportDAO,
    | 'tenant_id'
    | 'assigned_user_id'
    | 'created_by'
    | 'modified_user_id'
    | 'organization_id'
  > & { organization?: OrganizationImportBiz }
>;

@Table({
  ...defaultModelOptions,
  tableName: 'contacts',
  timestamps: false,
})
export class ContactDB extends Model<
  ContactAttr,
  ToSequelizeModel<ContactCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: ContactAttr['id'];

  @HasMany(() => FeedDB, 'contact_id')
  feeds!: FeedDB[];

  // TODO add tenant FK
  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: ContactAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @Column(DataType.DATE)
  date_entered!: ContactAttr['date_entered'];

  @Column(DataType.DATE)
  date_modified!: ContactAttr['date_modified'];

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  modified_user_id!: ContactAttr['modified_user_id'];
  @BelongsTo(() => UserDB, 'modified_user_id')
  modified_user!: UserDB;

  // TODO make this column not null
  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  created_by!: ContactAttr['created_by'];
  @BelongsTo(() => UserDB, 'created_by')
  contact_created_by!: UserDB;

  @Column(DataType.TEXT)
  description!: ContactAttr['description'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  deleted!: ContactAttr['deleted'];

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  assigned_user_id!: ContactAttr['assigned_user_id'];
  @BelongsTo(() => UserDB, 'assigned_user_id')
  assigned_user!: UserDB;

  @Column(DataType.STRING(255))
  salutation!: ContactAttr['salutation'];

  @Column(DataType.STRING(100))
  first_name!: ContactAttr['first_name'];

  @Column(DataType.STRING(100))
  last_name!: ContactAttr['last_name'];

  @Column(DataType.VIRTUAL)
  get name() {
    return `${this.first_name} ${this.last_name}`;
  }

  @Column(DataType.STRING)
  title!: ContactAttr['title'];

  @Column(DataType.STRING(255))
  department!: ContactAttr['department'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  do_not_call!: ContactAttr['do_not_call'];

  @Column(DataType.STRING)
  email_home!: ContactAttr['email_home'];

  @Column(DataType.STRING)
  email_mobile!: ContactAttr['email_mobile'];

  @Column(DataType.STRING)
  email_work!: ContactAttr['email_work'];

  @Column(DataType.STRING)
  email_other!: ContactAttr['email_other'];

  @Column(DataType.STRING)
  email_fax!: ContactAttr['email_fax'];

  @Column(DataType.STRING(100))
  phone_home!: ContactAttr['phone_home'];

  @Column(DataType.STRING(100))
  phone_mobile!: ContactAttr['phone_mobile'];

  @Column(DataType.STRING(100))
  phone_work!: ContactAttr['phone_work'];

  @Column(DataType.STRING(100))
  phone_other!: ContactAttr['phone_other'];

  @Column(DataType.STRING(100))
  phone_fax!: ContactAttr['phone_fax'];

  @Column(DataType.STRING(100))
  primary_address_street!: ContactAttr['primary_address_street'];

  @Column(DataType.STRING(100))
  primary_address_city!: ContactAttr['primary_address_city'];

  @Column(DataType.STRING(100))
  primary_address_state!: ContactAttr['primary_address_state'];

  @Column(DataType.STRING(20))
  primary_address_postalcode!: ContactAttr['primary_address_postalcode'];

  @Column(DataType.STRING(255))
  primary_address_country!: ContactAttr['primary_address_country'];

  @Column(DataType.STRING(150))
  alt_address_street!: ContactAttr['alt_address_street'];

  @Column(DataType.STRING(100))
  alt_address_city!: ContactAttr['alt_address_city'];

  @Column(DataType.STRING(100))
  alt_address_state!: ContactAttr['alt_address_state'];

  @Column(DataType.STRING(20))
  alt_address_postalcode!: ContactAttr['alt_address_postalcode'];

  @Column(DataType.STRING(255))
  alt_address_country!: ContactAttr['alt_address_country'];

  @Column(DataType.STRING(75))
  assistant!: ContactAttr['assistant'];

  @Column(DataType.STRING(100))
  assistant_phone!: ContactAttr['assistant_phone'];

  @Column(DataType.STRING(255))
  lead_source!: ContactAttr['lead_source'];

  @Column(DataType.STRING(255))
  avatar!: ContactAttr['avatar'];

  @Column(DataType.STRING(75))
  status!: ContactAttr['status'];

  @ForeignKey(() => OrganizationDB)
  @Column(DataType.UUID)
  organization_id!: ContactAttr['organization_id'];
  @BelongsTo(() => OrganizationDB, 'organization_id')
  organization!: OrganizationDB;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_customer!: ContactAttr['is_customer'];

  @Column(DataType.STRING(50))
  cif!: ContactAttr['cif'];

  @Column(DataType.STRING(64))
  external_id!: ContactAttr['external_id'];

  @ForeignKey(() => LabelDB)
  @Column(DataType.UUID)
  label_id!: ContactAttr['label_id'];
  @BelongsTo(() => LabelDB, 'label_id')
  label!: LabelDB;
}
