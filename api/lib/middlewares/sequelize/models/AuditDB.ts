import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { camelModelOptions, ToCreateType, ToSequelizeModel } from '../types';

export const auditActions = ['create', 'read', 'update', 'delete'] as const;
export type AuditAction = typeof auditActions[number];

export const auditAssociations = [
  'activityRequest',
  'guest',
  'mention',
  'owner',
] as const;
export type AuditAssociation = typeof auditAssociations[number];

export const auditResourceTypes = [
  'activity',
  'activityRequest',
  'contact',
  'contactOwner',
  'comment',
  'deal',
  'dealOwner',
  'note',
  'organization',
  'organizationOwner',
  'user',
] as const;
export type AuditResourceType = typeof auditResourceTypes[number];

// Represents the type of people that can perform an action upon a resource,
// be mentioned, or be associated to a resource
export const auditUserTypes = ['user', 'contact'] as const;
export type AuditUserType = typeof auditUserTypes[number];

// Resource that was affected by the action
export type AuditResource = {
  resourceId: string;
  resourceIdType: 'string' | 'number'; // uuid or number for pk
  resourceType: AuditResourceType;
  resourceDisplayValue: string; // typically the name
};

export type AuditChangeLogUpdate = {
  displayValue: string; // column display friendly value
  // from values and display values
  from: any;
  fromDisplayValue: any;
  // to values and display values
  to: any;
  toDisplayValue: any;
};

export type AuditChangeLog = {
  // who was added as a guest or owner, or mentioned
  // the resource points to the parent object
  association?: {
    type: AuditAssociation;
    parent: AuditResource;
    // who was associated
    associations: {
      displayValue: string;
      id: string;
      type: AuditUserType;
    }[];
  };
  // what was changed with from and to values
  update?: {
    [key: string]: AuditChangeLogUpdate;
  };
};

export type AuditAttr = AuditResource & {
  auditId: number;

  // who did the action
  actorId: string; // fk
  actorType: AuditUserType;
  actorDisplayValue: string;

  // what was affected
  action: AuditAction;

  // should have "| null" but generators fail...
  changeLog?: AuditChangeLog;
};

export type AuditCreateDAO = ToCreateType<AuditAttr, 'auditId', never>;

@Table({
  ...camelModelOptions,
  tableName: 'audit',
})
export class AuditDB extends Model<
  AuditAttr,
  ToSequelizeModel<AuditCreateDAO>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  auditId!: AuditAttr['auditId'];

  @AllowNull(false)
  @Column(DataType.STRING)
  actorId!: AuditAttr['actorId'];

  @AllowNull(false)
  @Column(DataType.ENUM(...auditUserTypes))
  actorType!: AuditAttr['actorType'];

  @AllowNull(false)
  @Column(DataType.STRING)
  actorDisplayValue!: AuditAttr['actorDisplayValue'];

  @AllowNull(false)
  @Column(DataType.ENUM(...auditActions))
  action!: AuditAttr['action'];

  @AllowNull(false)
  @Column(DataType.STRING)
  resourceId!: AuditAttr['resourceId'];

  @AllowNull(false)
  @Column(DataType.ENUM('string', 'number'))
  resourceIdType!: AuditAttr['resourceIdType'];

  @AllowNull(false)
  @Column(DataType.ENUM(...auditResourceTypes))
  resourceType!: AuditAttr['resourceType'];

  @AllowNull(false)
  @Column(DataType.STRING)
  resourceDisplayValue!: AuditAttr['resourceDisplayValue'];

  @AllowNull(true)
  @Column(DataType.JSON)
  changeLog!: AuditAttr['changeLog'];
}
