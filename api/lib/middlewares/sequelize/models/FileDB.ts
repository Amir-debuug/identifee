import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { defaultModelOptions } from '../types';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export type FileAttr = {
  /**
   * @format uuid
   */
  id: string;
  storage: string;
  filename_disk?: string;
  filename_download: string;
  title?: string;
  type?: string;
  folder?: string;
  uploaded_by?: string;
  uploaded_on: Date;
  modified_by?: string;
  modified_on: Date;
  charset?: string;
  filesize?: number;
  width?: number;
  height?: number;
  duration?: number;
  embed?: string;
  description?: string;
  location?: string;
  tags?: string;
  metadata?: any;
  tenant_id: string;
  is_public: boolean;
};

@Table({
  ...defaultModelOptions,
  timestamps: false,
  tableName: 'files',
})
export class FileDB extends Model<FileDB> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: FileAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING)
  storage!: FileAttr['storage'];

  @Column(DataType.STRING)
  filename_disk!: FileAttr['filename_disk'];

  @AllowNull(false)
  @Column(DataType.STRING)
  filename_download!: FileAttr['filename_download'];

  @Column(DataType.STRING)
  title!: FileAttr['title'];

  @Column(DataType.STRING)
  type!: FileAttr['type'];

  @Column(DataType.UUID)
  folder!: FileAttr['folder'];

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  uploaded_by!: FileAttr['uploaded_by'];

  @AllowNull(false)
  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column(DataType.DATE)
  uploaded_on!: FileAttr['uploaded_on'];

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  modified_by!: FileAttr['modified_by'];

  @AllowNull(false)
  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column(DataType.DATE)
  modified_on!: FileAttr['modified_on'];

  @Column(DataType.STRING(50))
  charset!: FileAttr['charset'];

  @Column(DataType.INTEGER)
  filesize!: FileAttr['filesize'];

  @Column(DataType.INTEGER)
  width!: FileAttr['width'];

  @Column(DataType.INTEGER)
  height!: FileAttr['height'];

  @Column(DataType.INTEGER)
  duration!: FileAttr['duration'];

  @Column(DataType.STRING(200))
  embed!: FileAttr['embed'];

  @Column(DataType.TEXT)
  description!: FileAttr['description'];

  @Column(DataType.TEXT)
  location!: FileAttr['location'];

  @Column(DataType.TEXT)
  tags!: FileAttr['tags'];

  @Column(DataType.JSON)
  metadata!: FileAttr['metadata'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: FileAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_public!: FileAttr['is_public'];
}
