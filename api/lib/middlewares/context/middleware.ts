import { NextFunction, Response } from 'express';
import {
  ActivityBiz,
  ActivityOwnerBiz,
  ActivityRequestBiz,
  AnalyticBiz,
  ArticleBiz,
  AuditBiz,
  AuditNotificationBiz,
  AuthBiz,
  BadgeBiz,
  CategoryBiz,
  CategoryCourseBiz,
  ComponentBiz,
  ContactBiz,
  CourseBiz,
  CourseContentBiz,
  CoursePreferenceBiz,
  CourseProgressBiz,
  CourseProgressQuizSubmissionBiz,
  DashboardBiz,
  DealBiz,
  DealProductBiz,
  feedResourceBizFactory,
  FieldBiz,
  FileBiz,
  GroupBiz,
  insightBizFactory,
  LabelBiz,
  LessonBiz,
  LessonPageBiz,
  LessonPreferenceBiz,
  LessonProgressBiz,
  NaicsBiz,
  NotificationBiz,
  OrganizationBiz,
  ownerBizFactory,
  PermissionBiz,
  PipelineBiz,
  PipelineTeamBiz,
  ProductBiz,
  QuizBiz,
  QuizQuestionBiz,
  QuizSubmissionBiz,
  ReportBiz,
  RoleBiz,
  SearchBiz,
  TeamBiz,
  TeamMemberBiz,
  TenantConfigBiz,
  TenantBiz,
  TenantDealStageBiz,
  TenantIntegrationBiz,
  UserBiz,
  UserCredentialBiz,
  VideoBiz,
} from 'lib/biz';
import {
  ActivityDAO,
  ActivityOwnerDAO,
  ActivityRequestDAO,
  AnalyticDAO,
  ArticleDAO,
  AuditDAO,
  AuditNotificationDAO,
  BadgeDAO,
  CategoryDAO,
  CategoryCourseDAO,
  ComponentDAO,
  ComponentTextDAO,
  ContactDAO,
  CourseContentDAO,
  CourseDAO,
  CoursePreferenceDAO,
  CourseProgressDAO,
  CourseProgressQuizSubmissionDAO,
  DashboardComponentDAO,
  DashboardDAO,
  DealDAO,
  DealProductDAO,
  DefaultFieldDAO,
  feedResourceDAOFactory,
  FieldDAO,
  FileDAO,
  GroupDAO,
  LabelDAO,
  LessonDAO,
  LessonPageDAO,
  LessonPreferenceDAO,
  LessonProgressDAO,
  LessonProgressQuizSubmissionDAO,
  NaicsDAO,
  OrganizationDAO,
  ownerDAOFactory,
  PermissionDAO,
  PipelineDAO,
  PipelineTeamDAO,
  ProductDAO,
  QuizDAO,
  QuizQuestionDAO,
  QuizQuestionSubmissionDAO,
  QuizSubmissionDAO,
  ReportDAO,
  RoleDAO,
  RpmgDAO,
  SearchDAO,
  SessionDAO,
  SpDAO,
  TeamDAO,
  TeamMemberDAO,
  TenantConfigDAO,
  TenantDAO,
  TenantDealStageDAO,
  TenantIntegrationDAO,
  UserCredentialDAO,
  UserDAO,
  VideoDAO,
} from 'lib/dao';
import { Email, Fiserv, Mux } from 'lib/providers';
import {
  activityServiceFactory,
  contactServiceFactory,
  dealServiceFactory,
  feedCommentServiceFactory,
  feedFileServiceFactory,
  feedLogServiceFactory,
  feedServiceFactory,
  FilesService,
  organizationServiceFactory,
  reportServiceFactory,
  userCredentialFactory,
  userServiceFactory,
} from 'lib/services';
import { JWT } from 'lib/util';
import { AuthMiddleware, defaultUsers } from '../auth';
import { EmitterMiddleware } from '../emitter';
import { ExceptionMiddleware } from '../exception';
import { OtelMiddleware } from '../opentelemetry';
import { SequelizeMiddleware } from '../sequelize';
import { ContextServices } from './types';

const {
  EMAIL_FROM = '',
  PROVIDER_FISERV_HOST_NAME,
  PROVIDER_FISERV_KEY = '',
  PROVIDER_FISERV_SECRET = '',
  PROVIDER_MUX_KEY = '',
  PROVIDER_MUX_SECRET = '',
  SECRET = '',
} = process.env;

export type ContextMiddleware = {
  services: ContextServices;
};

export async function servicesMiddleware(
  req: AuthMiddleware &
    ContextMiddleware &
    SequelizeMiddleware &
    EmitterMiddleware &
    ExceptionMiddleware &
    OtelMiddleware,
  res: Response,
  next: NextFunction
) {
  req.services = await createServiceMiddleware(req);

  return next();
}

export async function createServiceMiddleware(
  req: AuthMiddleware &
    SequelizeMiddleware &
    EmitterMiddleware &
    ExceptionMiddleware &
    OtelMiddleware
) {
  const user = req.user ? req.user : defaultUsers.admin;

  const email = await Email.bypassInit(req, { from: EMAIL_FROM });

  const services: ContextServices = {
    biz: {
      insight: {} as any,
    } as any,
    dao: {} as any,
    providers: {
      email,
      fiserv: new Fiserv(
        req,
        {
          apiKey: PROVIDER_FISERV_KEY,
          apiSecret: PROVIDER_FISERV_SECRET,
        },
        {
          host: `https://${PROVIDER_FISERV_HOST_NAME}`,
        }
      ),
      mux: new Mux(req, {
        apiKey: PROVIDER_MUX_KEY,
        apiSecret: PROVIDER_MUX_SECRET,
      }),
    },
    util: {
      jwt: new JWT(SECRET),
    },

    // deprecated
    data: {
      activity: activityServiceFactory(user),
      contact: contactServiceFactory(user),
      deal: dealServiceFactory(user),
      feed: feedServiceFactory(user),
      feedComment: feedCommentServiceFactory(user),
      feedFile: feedFileServiceFactory(user),
      feedLog: feedLogServiceFactory(user),
      file: new FilesService(),
      organization: organizationServiceFactory(user),
      report: reportServiceFactory(user),
      user: userServiceFactory(user),
      userCredential: userCredentialFactory(user),
    },
  };

  const db = req.db;
  const bizOpts = {
    db,
    emitter: req.emitter,
    exception: req.exception,
    otel: req.otel,
    services: services, // post assignment through reference
    user,
  };
  const contactBizOpts = {
    ...bizOpts,
    type: 'contact' as const,
  };
  const dealBizOpts = {
    ...bizOpts,
    type: 'deal' as const,
  };
  const organizationBizOpts = {
    ...bizOpts,
    type: 'organization' as const,
  };

  services.dao.activity = new ActivityDAO(db.ActivityDB, bizOpts);
  services.dao.activityOwner = new ActivityOwnerDAO(
    db.ActivityOwnerDB,
    bizOpts
  );
  services.dao.activityRequest = new ActivityRequestDAO(
    db.ActivityRequestDB,
    bizOpts
  );
  services.dao.analytic = new AnalyticDAO(db.AnalyticDB, bizOpts);
  services.dao.article = new ArticleDAO(db.ArticleDB, bizOpts);
  services.dao.audit = new AuditDAO(db.AuditDB, bizOpts);
  services.dao.auditNotification = new AuditNotificationDAO(
    db.AuditNotificationDB,
    bizOpts
  );
  services.dao.badge = new BadgeDAO(db.BadgeDB, bizOpts);
  services.dao.category = new CategoryDAO(db.CategoryDB, bizOpts);
  services.dao.categoryCourse = new CategoryCourseDAO(
    db.CategoryCourseDB,
    bizOpts
  );
  services.dao.component = new ComponentDAO(db.ComponentDB, bizOpts);
  services.dao.componentText = new ComponentTextDAO(
    db.ComponentTextDB,
    bizOpts
  );
  services.dao.contact = new ContactDAO(db.ContactDB, bizOpts);
  services.dao.course = new CourseDAO(db.CourseDB, bizOpts);
  services.dao.courseContent = new CourseContentDAO(
    db.CourseContentDB,
    bizOpts
  );
  services.dao.coursePreference = new CoursePreferenceDAO(
    db.CoursePreferenceDB,
    bizOpts
  );
  services.dao.courseProgress = new CourseProgressDAO(
    db.CourseProgressDB,
    bizOpts
  );
  services.dao.courseProgressQuizSubmission =
    new CourseProgressQuizSubmissionDAO(
      db.CourseProgressQuizSubmissionDB,
      bizOpts
    );
  services.dao.dashboard = new DashboardDAO(db.DashboardDB, bizOpts);
  services.dao.dashboardComponent = new DashboardComponentDAO(
    db.DashboardComponentDB,
    bizOpts
  );
  services.dao.deal = new DealDAO(db.DealDB, bizOpts);
  services.dao.dealProduct = new DealProductDAO(db.DealProductDB, bizOpts);
  services.dao.defaultField = new DefaultFieldDAO(db.DefaultFieldDB, bizOpts);
  services.dao.file = new FileDAO(db.FileDB, bizOpts);
  services.dao.field = new FieldDAO(db.FieldDB, bizOpts);
  services.dao.group = new GroupDAO(db.GroupDB, bizOpts);
  services.dao.label = new LabelDAO(db.LabelDB, bizOpts);
  services.dao.lesson = new LessonDAO(db.LessonDB, bizOpts);
  services.dao.lessonPage = new LessonPageDAO(db.LessonPageDB, bizOpts);
  services.dao.lessonPreference = new LessonPreferenceDAO(
    db.LessonPreferenceDB,
    bizOpts
  );
  services.dao.lessonProgress = new LessonProgressDAO(
    db.LessonProgressDB,
    bizOpts
  );
  services.dao.lessonProgressQuizSubmission =
    new LessonProgressQuizSubmissionDAO(
      db.LessonProgressQuizSubmissionDB,
      bizOpts
    );
  services.dao.naics = new NaicsDAO(db.NaicsDB, bizOpts);
  services.dao.organization = new OrganizationDAO(db.OrganizationDB, bizOpts);
  services.dao.permission = new PermissionDAO(db.PermissionDB, bizOpts);
  services.dao.pipeline = new PipelineDAO(db.PipelineDB, bizOpts);
  services.dao.pipelineTeam = new PipelineTeamDAO(db.PipelineTeamDB, bizOpts);
  services.dao.product = new ProductDAO(db.ProductDB, bizOpts);
  services.dao.quiz = new QuizDAO(db.QuizDB, bizOpts);
  services.dao.quizQuestion = new QuizQuestionDAO(db.QuizQuestionDB, bizOpts);
  services.dao.quizQuestionSubmission = new QuizQuestionSubmissionDAO(
    db.QuizQuestionSubmissionDB,
    bizOpts
  );
  services.dao.quizSubmission = new QuizSubmissionDAO(
    db.QuizSubmissionDB,
    bizOpts
  );
  services.dao.report = new ReportDAO(db.ReportDB, bizOpts);
  services.dao.role = new RoleDAO(db.RoleDB, bizOpts);
  services.dao.rpmg = new RpmgDAO(db.RpmgVerticalDB, bizOpts);
  services.dao.search = new SearchDAO(db.SearchDB, bizOpts);
  services.dao.session = new SessionDAO(db.SessionDB, bizOpts);
  services.dao.sp = new SpDAO(db.SpSummaryDB, bizOpts);
  services.dao.team = new TeamDAO(db.TeamDB, bizOpts);
  services.dao.teamMember = new TeamMemberDAO(db.TeamMemberDB, bizOpts);
  services.dao.tenantConfig = new TenantConfigDAO(db.TenantConfigDB, bizOpts);
  services.dao.tenant = new TenantDAO(db.TenantDB, bizOpts);
  services.dao.tenantDealStage = new TenantDealStageDAO(
    db.TenantDealStageDB,
    bizOpts
  );
  services.dao.tenantIntegration = new TenantIntegrationDAO(
    db.TenantIntegrationDB,
    bizOpts
  );
  services.dao.user = new UserDAO(db.UserDB, bizOpts);
  services.dao.userCredential = new UserCredentialDAO(
    db.UserCredentialDB,
    bizOpts
  );
  services.dao.video = new VideoDAO(db.VideoDB, bizOpts);

  /**
   * DAO factories
   */
  services.dao.contactFeed = feedResourceDAOFactory(
    'contact',
    db.FeedDB,
    bizOpts
  );
  services.dao.dealFeed = feedResourceDAOFactory('deal', db.FeedDB, bizOpts);
  services.dao.organizationFeed = feedResourceDAOFactory(
    'organization',
    db.FeedDB,
    bizOpts
  );

  services.dao.contactOwner = ownerDAOFactory(
    'contact',
    db.ContactOwnerDB,
    bizOpts
  );
  services.dao.dealOwner = ownerDAOFactory('deal', db.DealOwnerDB, bizOpts);
  services.dao.organizationOwner = ownerDAOFactory(
    'organization',
    db.OrganizationOwnerDB,
    bizOpts
  );

  services.biz.activity = new ActivityBiz(bizOpts);
  services.biz.activityOwner = new ActivityOwnerBiz(bizOpts);
  services.biz.activityRequest = new ActivityRequestBiz(bizOpts);
  services.biz.analytic = new AnalyticBiz(bizOpts);
  services.biz.article = new ArticleBiz(bizOpts);
  services.biz.audit = new AuditBiz(bizOpts);
  services.biz.auditNotification = new AuditNotificationBiz(bizOpts);
  services.biz.auth = new AuthBiz(bizOpts);
  services.biz.badge = new BadgeBiz(bizOpts);
  services.biz.category = new CategoryBiz(bizOpts);
  services.biz.categoryCourse = new CategoryCourseBiz(bizOpts);
  services.biz.component = new ComponentBiz(bizOpts);
  services.biz.contact = new ContactBiz(bizOpts);
  services.biz.course = new CourseBiz(bizOpts);
  services.biz.courseContent = new CourseContentBiz(bizOpts);
  services.biz.coursePreference = new CoursePreferenceBiz(bizOpts);
  services.biz.courseProgress = new CourseProgressBiz(bizOpts);
  services.biz.courseProgressQuizSubmission =
    new CourseProgressQuizSubmissionBiz(bizOpts);
  services.biz.dashboard = new DashboardBiz(bizOpts);
  services.biz.deal = new DealBiz(bizOpts);
  services.biz.dealProduct = new DealProductBiz(bizOpts);
  services.biz.field = new FieldBiz(bizOpts);
  services.biz.file = new FileBiz(bizOpts);
  services.biz.group = new GroupBiz(bizOpts);
  services.biz.label = new LabelBiz(bizOpts);
  services.biz.lesson = new LessonBiz(bizOpts);
  services.biz.lessonPage = new LessonPageBiz(bizOpts);
  services.biz.lessonPreference = new LessonPreferenceBiz(bizOpts);
  services.biz.lessonProgress = new LessonProgressBiz(bizOpts);
  services.biz.naics = new NaicsBiz(bizOpts);
  services.biz.notification = new NotificationBiz(bizOpts);
  services.biz.organization = new OrganizationBiz(bizOpts);
  services.biz.permission = new PermissionBiz(bizOpts);
  services.biz.pipeline = new PipelineBiz(bizOpts);
  services.biz.pipelineTeam = new PipelineTeamBiz(bizOpts);
  services.biz.product = new ProductBiz(bizOpts);
  services.biz.quiz = new QuizBiz(bizOpts);
  services.biz.quizQuestion = new QuizQuestionBiz(bizOpts);
  services.biz.quizSubmission = new QuizSubmissionBiz(bizOpts);
  services.biz.report = new ReportBiz(bizOpts);
  services.biz.role = new RoleBiz(bizOpts);
  services.biz.search = new SearchBiz(bizOpts);
  services.biz.team = new TeamBiz(bizOpts);
  services.biz.teamMember = new TeamMemberBiz(bizOpts);
  services.biz.tenantConfig = new TenantConfigBiz(bizOpts);
  services.biz.tenant = new TenantBiz(bizOpts);
  services.biz.tenantDealStage = new TenantDealStageBiz(bizOpts);
  services.biz.tenantIntegration = new TenantIntegrationBiz(bizOpts);
  services.biz.user = new UserBiz(bizOpts);
  services.biz.userCredential = new UserCredentialBiz(bizOpts);
  services.biz.video = new VideoBiz(bizOpts);

  /**
   * Biz factories
   */
  services.biz.insight.rpmg = insightBizFactory('rpmg', bizOpts);
  services.biz.insight.sp = insightBizFactory('sp', bizOpts);

  services.biz.contactFeed = feedResourceBizFactory('contact', contactBizOpts);
  services.biz.dealFeed = feedResourceBizFactory('deal', dealBizOpts);
  services.biz.organizationFeed = feedResourceBizFactory(
    'organization',
    organizationBizOpts
  );

  services.biz.contactOwner = ownerBizFactory('contact', contactBizOpts);
  services.biz.dealOwner = ownerBizFactory('deal', dealBizOpts);
  services.biz.organizationOwner = ownerBizFactory(
    'organization',
    organizationBizOpts
  );

  return services;
}
