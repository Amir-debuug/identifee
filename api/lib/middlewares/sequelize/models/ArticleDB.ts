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
  Order,
  Search,
  Timestamp,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export type ArticleAttr = {
  /**
   * @format string / md5 hash
   */
  id: string;
  /**
   * @format uuid
   */
  tenant_id?: string;
  /**
   * @format uuid
   */
  user_id?: string;
  title: string | null;
  blurb?: string;
  author?: string;
  body?: string;
  published: Date;
  url: string;
  image?: string;
  source?: string;
} & Timestamp;

export type ArticleQueryDAO = {
  search?: Search;
  order?: Order;
};
// `id` and timestamps are created by sequelize
// OptionalNullable will make null values as optional
export type ArticleCreateDAO = ToCreateType<ArticleAttr, 'id', never>;
// `tenant_id` should not be modified after creation
export type ArticleModifyDAO = ToModifyType<
  ArticleCreateDAO,
  'tenant_id' | 'user_id'
>;

export type ArticleQueryBiz = {
  search?: Search;
  order?: any;
};

export type ArticleModifyBiz = Omit<ArticleCreateDAO, 'tenantId' | 'userId'>;

@Table({
  ...camelModelOptions,
  tableName: 'article',
})
export class ArticleDB extends Model<
  ArticleAttr,
  ToSequelizeModel<ArticleCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: ArticleAttr['id'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: ArticleAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  user_id!: ArticleAttr['user_id'];
  @BelongsTo(() => UserDB, 'user_id')
  user!: UserDB;

  @Column(DataType.TEXT)
  title!: ArticleAttr['title'];

  @Column(DataType.TEXT)
  blurb!: ArticleAttr['blurb'];

  @Column(DataType.STRING)
  author!: ArticleAttr['author'];

  @Column(DataType.TEXT)
  body!: ArticleAttr['body'];

  @Column(DataType.DATE)
  published!: ArticleAttr['published'];

  @Column(DataType.STRING)
  url!: ArticleAttr['url'];

  @Column(DataType.STRING)
  image!: ArticleAttr['image'];

  @Column(DataType.STRING)
  source!: ArticleAttr['source'];
}
