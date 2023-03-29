import { Sequelize } from 'sequelize';
import { SpanKind } from '@opentelemetry/api';

// @TODO There gotta be another way to import modules dynamically
import { CategoryRepository } from './models/category';
import { LessonRepository } from './models/lesson';
import { LessonPageRepository } from './models/lesson-page';
import { LessonTrackingRepository } from './models/lesson-tracking';
import { SessionRepository } from './models/session';
import { FileRepository } from './models/file';
import { RolesRepository } from './models/role';
import { ContactRepository } from './models/contacts';
import { ContactFollowersRepository } from './models/contactsFollowers';
import { OrganizationRepository } from './models/organizations';
import { OrganizationFollowersRepository } from './models/organizationsFollowers';
import { OrganizationOwnersRepository } from './models/organizationsOwners';
import { FeedRepository } from './models/feed';
import { NoteRepository } from './models/note';
import { NotificationSettingsRepository } from './models/notification-settings';
import { BadgeRepository } from './models/badge';
import { CourseRepository } from './models/course';
import { CourseLessonRepository } from './models/course-lesson';
import { ProductsRepository } from './models/products';
import { CommentsRepository } from './models/comments';
import { ActivityFileRepository } from './models/activityFile';
import { ActivitiesRepository } from './models/activities';
import { ReportRepository } from './models/report';
import { ContactOwnersRepository } from './models/contactsOwners';
import { LabelsRepository } from './models/labels';
import { GroupsRepository } from './models/groups';
import { FieldRepository } from './models/field';
import { ContactFieldRepository } from './models/contactsField';
import { OrganizationFieldRepository } from './models/organizationsField';
import { TenantRepository } from './models/tenant';
import { UserRepository, UserCredentialRepository } from './models/user';
import {
  DealsRepository,
  DealFollowersRepository,
  DealOwnersRepository,
  DealProductsRepository,
  TenantDealStageRepository,
} from './models/deal';
import { RelatedOrganizationRepository } from './models/relatedOrganization';
import { ActivityContactRepository } from './models/activity-contacts';
import { PipelineRepository } from './models/pipeline';
import { ProspectRepository } from './models/prospect';
import { CategoryCourseRepository } from './models/categoryCourse';
import { OtelMiddleware } from 'lib/middlewares/opentelemetry';

const {
  DB_HOST = 'localhost',
  DB_DATABASE = 'idf',
  DB_USERNAME = 'postgres',
  DB_PASSWORD = '',
  DB_SYNC_DB,
} = process.env;

const dbConfig = {
  host: DB_HOST,
  db: DB_DATABASE,
  user: DB_USERNAME,
  pass: DB_PASSWORD,
};

const sqlz = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.pass, {
  dialect: 'postgres',
  host: dbConfig.host,
  logging: false, // enable tracing instead
});

export const sequelize = sqlz;

// @TODO There gotta be another way to export modules dynamically
// init models
export const User = UserRepository(sqlz);
export const UserCredential = UserCredentialRepository(sqlz);
export const Session = SessionRepository(sqlz);
export const Category = CategoryRepository(sqlz);
export const Lesson = LessonRepository(sqlz);
export const LessonPage = LessonPageRepository(sqlz);
export const LessonTracking = LessonTrackingRepository(sqlz);
export const FileModel = FileRepository(sqlz);
export const Role = RolesRepository(sqlz);
export const Contact = ContactRepository(sqlz);
export const ContactField = ContactFieldRepository(sqlz);
export const ContactFollowers = ContactFollowersRepository(sqlz);
export const ContactOwners = ContactOwnersRepository(sqlz);
export const Organization = OrganizationRepository(sqlz);
export const OrganizationField = OrganizationFieldRepository(sqlz);
export const OrganizationFollowers = OrganizationFollowersRepository(sqlz);
export const OrganizationOwners = OrganizationOwnersRepository(sqlz);
export const Feed = FeedRepository(sqlz);
export const Note = NoteRepository(sqlz);
export const NotificationSettings = NotificationSettingsRepository(sqlz);
export const Badge = BadgeRepository(sqlz);
export const Course = CourseRepository(sqlz);
export const CourseLesson = CourseLessonRepository(sqlz);
export const Deal = DealsRepository(sqlz);
export const DealOwners = DealOwnersRepository(sqlz);
export const DealFollowers = DealFollowersRepository(sqlz);
export const Product = ProductsRepository(sqlz);
export const DealProduct = DealProductsRepository(sqlz);
export const ActivityFile = ActivityFileRepository(sqlz);
export const Comment = CommentsRepository(sqlz);
export const Activities = ActivitiesRepository(sqlz);
export const ActivityContacts = ActivityContactRepository(sqlz);
export const Report = ReportRepository(sqlz);
export const Labels = LabelsRepository(sqlz);
export const Groups = GroupsRepository(sqlz);
export const Field = FieldRepository(sqlz);
export const Tenant = TenantRepository(sqlz);
export const TenantDealStage = TenantDealStageRepository(sqlz);
export const RelatedOrganization = RelatedOrganizationRepository(sqlz);
export const Pipeline = PipelineRepository(sqlz);
export const Prospect = ProspectRepository(sqlz);
export const CategoryCourse = CategoryCourseRepository(sqlz);
// @TODO Perhaps relations should be inside model factory?
// or maybe we should have repo and modal factories

Lesson.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});
Course.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

Lesson.hasMany(LessonPage, {
  foreignKey: 'lesson_id',
  as: 'pages',
});

Lesson.hasMany(LessonTracking, {
  foreignKey: 'lesson_id',
  as: 'progress',
});

LessonTracking.belongsTo(Lesson, {
  foreignKey: 'lesson_id',
});

LessonPage.belongsTo(Lesson, {
  foreignKey: 'lesson_id',
});

User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role',
});

User.belongsTo(Groups, {
  foreignKey: 'groupId',
  as: 'group',
});

User.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant',
});

User.hasOne(UserCredential, {
  foreignKey: 'user_id',
  as: 'credential',
});

UserCredential.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

NotificationSettings.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Contact.belongsTo(User, {
  foreignKey: 'assigned_user_id',
  as: 'assigned_user',
});

Contact.belongsTo(User, {
  foreignKey: 'modified_user_id',
  as: 'modified_user',
});

Contact.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'contact_created_by',
});

Contact.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

ContactField.belongsTo(Contact, {
  foreignKey: 'contact_id',
  as: 'contact',
});
ContactField.belongsTo(Field, {
  foreignKey: 'field_id',
  as: 'field',
  onDelete: 'CASCADE',
});
ContactField.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'user',
});

ContactFollowers.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

ContactFollowers.belongsTo(Contact, {
  foreignKey: 'contact_id',
  as: 'contact',
});

ContactOwners.belongsTo(Contact, {
  foreignKey: 'contact_id',
  as: 'contact',
});

ContactOwners.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Organization.belongsTo(User, {
  foreignKey: 'assigned_user_id',
  as: 'assigned_user',
});

Organization.belongsTo(User, {
  foreignKey: 'modified_user_id',
  as: 'modified_user',
});

Organization.belongsTo(User, {
  foreignKey: 'created_by', // TODO rename to created_by_user_id?
  as: 'organization_created_by', // TODO rename this to organization_created?
});

OrganizationField.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

OrganizationField.belongsTo(Field, {
  foreignKey: 'field_id',
  as: 'field',
  onDelete: 'CASCADE',
});
OrganizationField.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'user',
});

OrganizationFollowers.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

OrganizationFollowers.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

OrganizationOwners.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

OrganizationOwners.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

DealOwners.belongsTo(Deal, {
  foreignKey: 'deal_id',
  as: 'deal',
});

DealOwners.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Feed.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'created_by_info',
});

Feed.belongsTo(User, {
  foreignKey: 'updated_by',
  as: 'updated_by_info',
});

Feed.belongsTo(Deal, {
  foreignKey: 'deal_id',
  as: 'deal',
});

Feed.belongsTo(Contact, {
  foreignKey: 'contact_id',
  as: 'contact',
});

Feed.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});
Feed.hasMany(Activities, { foreignKey: 'feed_id' });

Course.belongsToMany(Lesson, {
  foreignKey: 'course_id',
  through: { model: CourseLesson },
  as: 'lessons',
  uniqueKey: 'id',
});

Course.belongsTo(Badge, {
  foreignKey: 'badge_id',
  as: 'badge',
});

Lesson.belongsToMany(Course, {
  foreignKey: 'lesson_id',
  through: { model: CourseLesson },
  as: 'courses',
});

CourseLesson.belongsTo(Course, {
  foreignKey: 'course_id',
});

CourseLesson.belongsTo(Lesson, {
  foreignKey: 'lesson_id',
});
Deal.belongsTo(User, {
  foreignKey: 'assigned_user_id',
  as: 'assigned_user',
});

Deal.belongsTo(User, {
  foreignKey: 'modified_user_id',
  as: 'modified_user',
});

Deal.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'deal_created_by',
});

Deal.belongsTo(Contact, {
  foreignKey: 'contact_person_id', // TODO rename to contact_id
  as: 'contact',
});

Deal.belongsTo(Organization, {
  foreignKey: 'contact_organization_id',
  as: 'organization',
});

DealFollowers.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

DealFollowers.belongsTo(Deal, {
  foreignKey: 'deal_id',
  as: 'deal',
});

Product.belongsToMany(Deal, {
  through: { model: DealProduct, unique: false },
  as: 'deals',
  foreignKey: 'product_id',
});

Deal.belongsToMany(Product, {
  through: { model: DealProduct, unique: false },
  as: 'products',
  foreignKey: 'deal_id',
  uniqueKey: 'id',
});

Product.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant',
});

ActivityFile.belongsTo(FileModel, {
  foreignKey: 'file_id',
  as: 'file',
});

Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Comment.belongsTo(Feed, {
  foreignKey: 'feed_id',
  as: 'feed',
});

Activities.belongsTo(Feed, {
  foreignKey: 'feed_id',
  as: 'feed',
});

Activities.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'user',
});

Report.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});
Report.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'user',
});
Report.belongsTo(FileModel, {
  foreignKey: 'file_id',
});

Labels.belongsTo(User, {
  foreignKey: 'assigned_user_id',
  as: 'user', // TODO rename to assigned_user
});

Organization.belongsTo(Labels, {
  foreignKey: 'label_id',
  as: 'label',
});

Contact.belongsTo(Labels, {
  foreignKey: 'label_id',
  as: 'label',
});

Groups.belongsTo(Groups, {
  foreignKey: 'parent_id',
  as: 'parent',
});

Field.hasMany(ContactField, {
  foreignKey: 'field_id',
  as: 'contact_field',
  onDelete: 'CASCADE',
});
Field.hasMany(OrganizationField, {
  foreignKey: 'field_id',
  as: 'organization_field',
  onDelete: 'CASCADE',
});

TenantDealStage.belongsTo(Pipeline, {
  foreignKey: 'pipelineId',
  as: 'pipeline',
});

Pipeline.belongsTo(Tenant, {
  foreignKey: 'tenantId',
  as: 'tenant',
});

Pipeline.belongsTo(User, {
  foreignKey: 'createdById',
  as: 'createdBy',
});

Deal.belongsTo(TenantDealStage, {
  foreignKey: 'tenant_deal_stage_id',
  as: 'tenant_deal_stage',
});

RelatedOrganization.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

RelatedOrganization.belongsTo(Organization, {
  foreignKey: 'related_id',
  as: 'related',
});

Activities.hasMany(ActivityContacts, {
  foreignKey: 'activity_id',
  as: 'contacts',
});

ActivityContacts.belongsTo(Contact, {
  foreignKey: 'contact_id',
  as: 'contact',
});

Course.hasMany(CategoryCourse, {
  foreignKey: 'courseId',
  as: 'categoryCourses',
});

CategoryCourse.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

export async function init(context: OtelMiddleware) {
  return context.otel.telemetry
    .getTracer()
    .startActiveSpan(
      'bootup database',
      { kind: SpanKind.INTERNAL },
      async (span) => {
        try {
          await sqlz.authenticate();
          if (DB_SYNC_DB === 'true') {
            await sqlz.sync();
          }

          context.otel.telemetry.setOK(span);
          span.addEvent('database connected');
        } catch (err) {
          span.addEvent('database connection error');
          context.otel.telemetry.setError(span, err);
          throw err;
        } finally {
          span.end();
        }
      }
    );
}
