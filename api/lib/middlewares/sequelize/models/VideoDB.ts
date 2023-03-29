import { Expand } from 'lib/utils';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { camelModelOptions, ToCreateType, ToSequelizeModel } from '../types';
import { LessonPageDB } from './LessonPageDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

/**
 * Either externalUrl or Mux values must be set
 */
export type VideoAttr = {
  /**
   * @format uuid
   */
  videoId: string;

  externalUrl: string | null; // this is the external URL where front end must render from

  muxUploadId: string | null;
  muxUploadUrl: string | null; // this is the URL where front end must upload to

  /**
   * @format uuid
   */
  createdById: string;
  /**
   * @format uuid
   */
  tenantId: string;
};

export type VideoCreateDAO =
  | Expand<
      Pick<
        ToCreateType<VideoAttr, 'videoId', never>,
        'createdById' | 'tenantId'
      > & { externalUrl: string }
    >
  | Expand<
      Pick<
        ToCreateType<VideoAttr, 'videoId', never>,
        'createdById' | 'tenantId'
      > & {
        muxUploadId: string;
        muxUploadUrl: string;
      }
    >;

export type VideoCreateBiz = {
  /**
   * @description Whether video is publicly accessible.
   */
  externalUrl?: string;
};

@Table({
  ...camelModelOptions,
  tableName: 'video',
})
export class VideoDB extends Model<
  VideoAttr,
  ToSequelizeModel<VideoCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  videoId!: VideoAttr['videoId'];

  @Column(DataType.TEXT)
  externalUrl!: VideoAttr['externalUrl'];

  @Column(DataType.STRING)
  muxUploadId!: VideoAttr['muxUploadId'];

  @Column(DataType.TEXT)
  muxUploadUrl!: VideoAttr['muxUploadUrl'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenantId!: VideoAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  createdById!: VideoAttr['createdById'];
  @BelongsTo(() => UserDB, 'createdById')
  createdBy!: UserDB;

  // TODO revisit this relationship
  @HasMany(() => LessonPageDB, 'videoId')
  lessonPages!: LessonPageDB[];
}
