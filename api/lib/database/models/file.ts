import { FileAttr } from 'lib/middlewares/sequelize';
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { StaticModel } from '../helpers';

export type FileAttributes = FileAttr;

export type FileCreateAttributes = Optional<FileAttributes, 'id'>;

export type FileModel = Model<FileAttributes, FileCreateAttributes>;

type FileStatic = StaticModel<FileModel>;

export function FileRepository(sqlz: Sequelize) {
  return sqlz.define(
    'files',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      storage: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      filename_disk: {
        type: DataTypes.STRING(255),
      },
      filename_download: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
      },
      type: {
        type: DataTypes.STRING(255),
      },
      folder: {
        type: DataTypes.UUID,
      },
      uploaded_by: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      uploaded_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      modified_by: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      modified_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      charset: {
        type: DataTypes.STRING(50),
      },
      filesize: {
        type: DataTypes.INTEGER,
      },
      width: {
        type: DataTypes.INTEGER,
      },
      height: {
        type: DataTypes.INTEGER,
      },
      duration: {
        type: DataTypes.INTEGER,
      },
      embed: {
        type: DataTypes.STRING(200),
      },
      description: {
        type: DataTypes.TEXT,
      },
      location: {
        type: DataTypes.TEXT,
      },
      tags: {
        type: DataTypes.TEXT,
      },
      metadata: {
        type: DataTypes.JSON,
      },
      tenant_id: { type: DataTypes.UUID, allowNull: false },
      is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'files',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: 'file_pkey',
          unique: true,
          fields: [{ name: 'id' }],
        },
      ],
    }
  ) as FileStatic;
}
