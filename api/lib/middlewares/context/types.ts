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
  FeedResourceBizFactory,
  FieldBiz,
  FileBiz,
  GroupBiz,
  InsightRpmgBiz,
  InsightSpBiz,
  LabelBiz,
  LessonBiz,
  LessonPageBiz,
  LessonPreferenceBiz,
  LessonProgressBiz,
  NaicsBiz,
  NotificationBiz,
  OrganizationBiz,
  OwnerBizFactory,
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
  FeedResourceDAOFactory,
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
  OwnerDAOFactory,
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
import { JWT } from 'lib/util';
import {
  contactServiceFactory,
  dealServiceFactory,
  FilesService,
  organizationServiceFactory,
  reportServiceFactory,
  userServiceFactory,
  userCredentialFactory,
  feedServiceFactory,
  feedLogServiceFactory,
  feedCommentServiceFactory,
  activityServiceFactory,
  feedFileServiceFactory,
} from 'lib/services';

export type ContextServices = {
  biz: {
    activity: ActivityBiz;
    activityOwner: ActivityOwnerBiz;
    activityRequest: ActivityRequestBiz;
    analytic: AnalyticBiz;
    article: ArticleBiz;
    audit: AuditBiz;
    auditNotification: AuditNotificationBiz;
    auth: AuthBiz;
    badge: BadgeBiz;
    category: CategoryBiz;
    categoryCourse: CategoryCourseBiz;
    component: ComponentBiz;
    contact: ContactBiz;
    contactFeed: FeedResourceBizFactory<'contact'>;
    contactOwner: OwnerBizFactory<'contact'>;
    course: CourseBiz;
    courseContent: CourseContentBiz;
    coursePreference: CoursePreferenceBiz;
    courseProgress: CourseProgressBiz;
    courseProgressQuizSubmission: CourseProgressQuizSubmissionBiz;
    dashboard: DashboardBiz;
    deal: DealBiz;
    dealFeed: FeedResourceBizFactory<'deal'>;
    dealOwner: OwnerBizFactory<'deal'>;
    dealProduct: DealProductBiz;
    field: FieldBiz;
    file: FileBiz;
    group: GroupBiz;
    insight: {
      rpmg: InsightRpmgBiz;
      sp: InsightSpBiz;
    };
    label: LabelBiz;
    lesson: LessonBiz;
    lessonPage: LessonPageBiz;
    lessonPreference: LessonPreferenceBiz;
    lessonProgress: LessonProgressBiz;
    naics: NaicsBiz;
    notification: NotificationBiz;
    organization: OrganizationBiz;
    organizationFeed: FeedResourceBizFactory<'organization'>;
    organizationOwner: OwnerBizFactory<'organization'>;
    permission: PermissionBiz;
    pipeline: PipelineBiz;
    pipelineTeam: PipelineTeamBiz;
    product: ProductBiz;
    quiz: QuizBiz;
    quizQuestion: QuizQuestionBiz;
    quizSubmission: QuizSubmissionBiz;
    report: ReportBiz;
    role: RoleBiz;
    search: SearchBiz;
    team: TeamBiz;
    teamMember: TeamMemberBiz;
    tenantConfig: TenantConfigBiz;
    tenant: TenantBiz;
    tenantDealStage: TenantDealStageBiz;
    tenantIntegration: TenantIntegrationBiz;
    user: UserBiz;
    userCredential: UserCredentialBiz;
    video: VideoBiz;
  };
  dao: {
    activity: ActivityDAO;
    activityOwner: ActivityOwnerDAO;
    activityRequest: ActivityRequestDAO;
    analytic: AnalyticDAO;
    article: ArticleDAO;
    audit: AuditDAO;
    auditNotification: AuditNotificationDAO;
    badge: BadgeDAO;
    category: CategoryDAO;
    categoryCourse: CategoryCourseDAO;
    component: ComponentDAO;
    componentText: ComponentTextDAO;
    contact: ContactDAO;
    contactFeed: FeedResourceDAOFactory<'contact'>['dao'];
    contactOwner: OwnerDAOFactory<'contact'>['dao'];
    course: CourseDAO;
    courseContent: CourseContentDAO;
    coursePreference: CoursePreferenceDAO;
    courseProgress: CourseProgressDAO;
    courseProgressQuizSubmission: CourseProgressQuizSubmissionDAO;
    dashboard: DashboardDAO;
    dashboardComponent: DashboardComponentDAO;
    deal: DealDAO;
    dealFeed: FeedResourceDAOFactory<'deal'>['dao'];
    dealOwner: OwnerDAOFactory<'deal'>['dao'];
    dealProduct: DealProductDAO;
    defaultField: DefaultFieldDAO;
    field: FieldDAO;
    file: FileDAO;
    group: GroupDAO;
    label: LabelDAO;
    lesson: LessonDAO;
    lessonPage: LessonPageDAO;
    lessonPreference: LessonPreferenceDAO;
    lessonProgress: LessonProgressDAO;
    lessonProgressQuizSubmission: LessonProgressQuizSubmissionDAO;
    naics: NaicsDAO;
    organization: OrganizationDAO;
    organizationFeed: FeedResourceDAOFactory<'organization'>['dao'];
    organizationOwner: OwnerDAOFactory<'organization'>['dao'];
    permission: PermissionDAO;
    pipeline: PipelineDAO;
    pipelineTeam: PipelineTeamDAO;
    product: ProductDAO;
    quiz: QuizDAO;
    quizQuestion: QuizQuestionDAO;
    quizQuestionSubmission: QuizQuestionSubmissionDAO;
    quizSubmission: QuizSubmissionDAO;
    report: ReportDAO;
    role: RoleDAO;
    rpmg: RpmgDAO;
    search: SearchDAO;
    sp: SpDAO;
    session: SessionDAO;
    team: TeamDAO;
    teamMember: TeamMemberDAO;
    tenantConfig: TenantConfigDAO;
    tenant: TenantDAO;
    tenantDealStage: TenantDealStageDAO;
    tenantIntegration: TenantIntegrationDAO;
    user: UserDAO;
    userCredential: UserCredentialDAO;
    video: VideoDAO;
  };
  providers: {
    email: Email;
    fiserv: Fiserv;
    mux: Mux;
  };
  util: {
    jwt: JWT;
  };

  /**
   * @deprecated
   */
  data: {
    activity: ReturnType<typeof activityServiceFactory>;
    contact: ReturnType<typeof contactServiceFactory>;
    deal: ReturnType<typeof dealServiceFactory>;
    feed: ReturnType<typeof feedServiceFactory>;
    feedComment: ReturnType<typeof feedCommentServiceFactory>;
    feedFile: ReturnType<typeof feedFileServiceFactory>;
    feedLog: ReturnType<typeof feedLogServiceFactory>;
    file: FilesService;
    organization: ReturnType<typeof organizationServiceFactory>;
    report: ReturnType<typeof reportServiceFactory>;
    user: ReturnType<typeof userServiceFactory>;
    userCredential: ReturnType<typeof userCredentialFactory>;
  };
};
