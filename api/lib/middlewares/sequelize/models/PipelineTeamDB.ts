import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  PrimaryKey,
} from 'sequelize-typescript';
import { PipelineDB } from './PipelineDB';
import { TeamDB } from './TeamDB';

export type PipelineTeamAttr = {
  teamId: string;
  pipelineId: string;
};

export type PipelineTeamCreateDAO = PipelineTeamAttr;
export type PipelineTeamCreateBiz = PipelineTeamCreateDAO;

@Table({
  tableName: 'pipelineTeam',
})
export class PipelineTeamDB extends Model<PipelineTeamAttr> {
  @PrimaryKey
  @ForeignKey(() => TeamDB)
  @Column(DataType.UUID)
  teamId!: PipelineTeamAttr['teamId'];
  @BelongsTo(() => TeamDB, 'teamId')
  team!: TeamDB;

  @PrimaryKey
  @ForeignKey(() => PipelineDB)
  @Column(DataType.UUID)
  pipelineId!: PipelineTeamAttr['pipelineId'];
  @BelongsTo(() => PipelineDB, 'pipelineId')
  pipeline!: PipelineDB;
}
