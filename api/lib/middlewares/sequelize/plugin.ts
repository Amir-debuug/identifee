import { SpanKind } from '@opentelemetry/api';
import { GenericRepository } from 'lib/dao';
import { Sequelize } from 'sequelize-typescript';
import { OtelMiddleware } from '../opentelemetry';
import * as models from './models';

export let sequelize: DB;

export type TableNames = keyof Tables;

type ToAssociation<Model extends {}, T extends {} = {}> = {
  model: Model;
  repo: { associations: T };
};

export type Tables = {
  ActivityDB: ToAssociation<models.ActivityDB>;
  ActivityOwnerDB: ToAssociation<models.ActivityOwnerDB>;
  ActivityRequestDB: ToAssociation<models.ActivityRequestDB>;
  AnalyticDB: ToAssociation<models.AnalyticDB>;
  ArticleDB: ToAssociation<models.ArticleDB>;
  AuditDB: ToAssociation<models.AuditDB>;
  AuditNotificationDB: ToAssociation<models.AuditNotificationDB>;
  BadgeDB: ToAssociation<models.BadgeDB>;
  CategoryDB: ToAssociation<models.CategoryDB>;
  CategoryCourseDB: ToAssociation<models.CategoryCourseDB>;
  ComponentDB: ToAssociation<models.ComponentDB>;
  ComponentTextDB: ToAssociation<models.ComponentTextDB>;
  ContactDB: ToAssociation<models.ContactDB>;
  ContactOwnerDB: ToAssociation<
    models.ContactOwnerDB,
    {
      contact: ToTarget<'ContactDB'>;
      user: ToTarget<'UserDB'>;
    }
  >;
  CourseContentDB: ToAssociation<models.CourseContentDB>;
  CourseDB: ToAssociation<
    models.CourseDB,
    {
      progress: ToTarget<'CourseProgressDB'>;
      preference: ToTarget<'CoursePreferenceDB'>;
    }
  >;
  CourseLessonDB: ToAssociation<models.CourseLessonDB>;
  CourseProgressDB: ToAssociation<models.CourseProgressDB>;
  CourseProgressQuizSubmissionDB: ToAssociation<models.CourseProgressQuizSubmissionDB>;
  CoursePreferenceDB: ToAssociation<models.CoursePreferenceDB>;
  DashboardComponentDB: ToAssociation<
    models.DashboardComponentDB,
    {
      dashboard: ToTarget<'DashboardDB'>;
      component: ToTarget<'ComponentDB'>;
    }
  >;
  DashboardDB: ToAssociation<models.DashboardDB>;
  DealDB: ToAssociation<
    models.DealDB,
    {
      organization: ToTarget<'OrganizationDB'>;
    }
  >;
  DealOwnerDB: ToAssociation<
    models.DealOwnerDB,
    {
      deal: ToTarget<'DealDB'>;
      user: ToTarget<'UserDB'>;
    }
  >;
  DealProductDB: ToAssociation<models.DealProductDB>;
  DefaultFieldDB: ToAssociation<models.DefaultFieldDB>;
  FeedDB: ToAssociation<
    models.FeedDB,
    {
      contact: ToTarget<'ContactDB'>;
      deal: ToTarget<'DealDB'>;
      organization: ToTarget<'OrganizationDB'>;
    }
  >;
  FieldDB: ToAssociation<models.FieldDB>;
  FileDB: ToAssociation<models.FileDB>;
  GroupDB: ToAssociation<models.GroupDB>;
  LabelDB: ToAssociation<models.LabelDB>;
  LessonDB: ToAssociation<
    models.LessonDB,
    {
      preference: ToTarget<'LessonPreferenceDB'>;
      progress: ToTarget<'LessonProgressDB'>;
    }
  >;
  LessonPageDB: ToAssociation<models.LessonPageDB>;
  LessonPreferenceDB: ToAssociation<models.LessonPreferenceDB>;
  LessonProgressDB: ToAssociation<models.LessonProgressDB>;
  LessonProgressQuizSubmissionDB: ToAssociation<models.LessonProgressQuizSubmissionDB>;
  NaicsCrossReferenceDB: ToAssociation<models.NaicsCrossReferenceDB>;
  NaicsDB: ToAssociation<models.NaicsDB>;
  NaicsSpDB: ToAssociation<models.NaicsSpDB>;
  OrganizationDB: ToAssociation<models.OrganizationDB>;
  OrganizationOwnerDB: ToAssociation<
    models.OrganizationOwnerDB,
    {
      organization: ToTarget<'OrganizationDB'>;
      user: ToTarget<'UserDB'>;
    }
  >;
  PermissionDB: ToAssociation<models.PermissionDB>;
  PipelineDB: ToAssociation<models.PipelineDB>;
  PipelineTeamDB: ToAssociation<models.PipelineTeamDB>;
  ProductDB: ToAssociation<models.ProductDB>;
  QuizDB: ToAssociation<models.QuizDB>;
  QuizQuestionDB: ToAssociation<models.QuizQuestionDB>;
  QuizSubmissionDB: ToAssociation<models.QuizSubmissionDB>;
  QuizQuestionSubmissionDB: ToAssociation<models.QuizQuestionSubmissionDB>;
  ReportDB: ToAssociation<models.ReportDB>;
  RoleDB: ToAssociation<models.RoleDB>;
  RpmgSummaryDB: ToAssociation<models.RpmgSummaryDB>;
  RpmgTransactionDB: ToAssociation<models.RpmgTransactionDB>;
  RpmgTransactionSummaryDB: ToAssociation<models.RpmgTransactionSummaryDB>;
  RpmgVerticalDB: ToAssociation<
    models.RpmgVerticalDB,
    {
      naics: ToTarget<'NaicsDB'> & {
        // Need to remap N:M to 1:M...
        isMultiAssociation: boolean;
        isSingleAssociation: boolean;
      };
    }
  >;
  SearchDB: ToAssociation<models.SearchDB>;
  SessionDB: ToAssociation<models.SessionDB>;
  SpSummaryDB: ToAssociation<
    models.SpSummaryDB,
    {
      naics_sp: ToTarget<'NaicsSpDB'>;
    }
  >;
  TeamDB: ToAssociation<models.TeamDB>;
  TeamMemberDB: ToAssociation<models.TeamMemberDB>;
  TenantConfigDB: ToAssociation<models.TenantConfigDB>;
  TenantDB: ToAssociation<
    models.TenantDB,
    {
      users: ToTarget<'UserDB'>;
    }
  >;
  TenantDealStageDB: ToAssociation<models.TenantDealStageDB>;
  TenantIntegrationDB: ToAssociation<models.TenantIntegrationDB>;
  UserCredentialDB: ToAssociation<models.UserCredentialDB>;
  UserDB: ToAssociation<
    models.UserDB,
    {
      role: ToTarget<'RoleDB'>;
    }
  >;
  VideoDB: ToAssociation<models.VideoDB>;
};

export type ToTarget<T extends TableNames> = {
  target: ToGenericRepository<T>;
};

export type ToGenericRepository<T extends TableNames> = {
  [K in T]: GenericRepository<K> & Tables[K]['repo'];
}[T];

export type DB = Sequelize & {
  models: {
    [K in keyof Tables]: ToGenericRepository<K>;
  };
};

export async function sequelizeInit(
  context: OtelMiddleware,
  opts: {
    host: string;
    port: number;
    database: string;
    schema?: string;
    username: string;
    password: string;
    sync: boolean;
  }
) {
  return context.otel.telemetry
    .getTracer()
    .startActiveSpan(
      'bootup sequelize mw',
      { kind: SpanKind.INTERNAL },
      async (span) => {
        sequelize = new Sequelize({
          dialect: 'postgres',
          host: opts.host,
          port: opts.port,
          database: opts.database,
          dialectOptions: {
            schema: opts.schema,
          },
          username: opts.username,
          password: opts.password,
          models: [__dirname + '/models/**/*DB.{ts,js}'],
          logging: false, // enable tracing instead
        }) as DB;

        try {
          await sequelize.authenticate();
          if (opts.sync) {
            await sequelize.sync();
          }

          // Need to remap N:M to 1:M...
          sequelize.models.RpmgVerticalDB.associations.naics.isMultiAssociation =
            false;
          sequelize.models.RpmgVerticalDB.associations.naics.isSingleAssociation =
            true;

          span.addEvent('database connected');
          context.otel.telemetry.setOK(span);

          return sequelize;
        } catch (error) {
          span.addEvent('database connection error');
          context.otel.telemetry.setError(span, error);
          throw error;
        } finally {
          span.end();
        }
      }
    );
}
