export type ActivityAttrs = { id: string; name: string; type: string; assigned_user_id: string; modified_user_id: string; created_by: string; organization_id?: string | undefined; deal_id?: string | undefined; contact_id?: string | undefined; start_date: Date; end_date: Date; guests: string; location?: string | undefined; conference_link?: string | undefined; description?: string | undefined; free_busy: string; notes?: string | undefined; rich_note?: { [key: string]: any; } | undefined; owner?: string | undefined; lead?: string | undefined; done: boolean; priority: boolean; online_meet: boolean; feed_id: string; tenant_id: string; deleted_on?: Date | undefined; canceledOn?: Date | undefined; };
export type ActivityAttr = {
/**
 * @format uuid
 */
id: string;
name: string;
type: string;
/**
 * @format uuid
 */
assigned_user_id: string;
/**
 * @format uuid
 */
modified_user_id: string;
/**
 * @format uuid
 */
created_by: string;
/**
 * @format uuid
 */
organization_id?: string ;
/**
 * @format uuid
 */
deal_id?: string ;
contact_id?: string ;
start_date: Date;
end_date: Date;
guests: string;
location?: string ;
conference_link?: string ;
description?: string ;
free_busy: string;
notes?: string ;
rich_note?: { [key: string]: any; } ;
owner?: string ;
lead?: string ;
done: boolean;
priority: boolean;
online_meet: boolean;
/**
 * @format uuid
 */
feed_id: string;
/**
 * @format uuid
 */
tenant_id: string;
deleted_on?: Date ;
canceledOn?: Date ;
created_at: Date;
updated_at: Date;
};
export type ActivityModifyBiz = {
name?: string ;
type?: string ;
/**
 * @format uuid
 */
assigned_user_id?: string ;
/**
 * @format uuid
 */
modified_user_id?: string ;
/**
 * @format uuid
 */
created_by?: string ;
/**
 * @format uuid
 */
organization_id?: string ;
/**
 * @format uuid
 */
deal_id?: string ;
contact_id?: string ;
start_date?: Date ;
end_date?: Date ;
guests?: string ;
location?: string ;
conference_link?: string ;
description?: string ;
free_busy?: string ;
notes?: string ;
rich_note?: { [key: string]: any; } ;
lead?: string ;
done?: boolean ;
priority?: boolean ;
online_meet?: boolean ;
};
export type ActivityQueryBiz = {
organizationId?: string ;
contactId?: string ;
dealId?: string ;
order?: Order ;
type?: string ;
done?: boolean ;
startDate?: Date ;
endDate?: Date ;
self?: boolean ;
};
export type ActivityOwnerAttr = {
/**
 * @format uuid
 */
userId: string;
/**
 * @format uuid
 */
activityId: string;
};
export type ActivityOwnerCreateBiz = {
/**
 * @format uuid
 */
userId: string;
};
export type ActivityRequestAvailability = { days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]; timePeriods: ('morning' | 'afternoon' | 'evening')[]; };
export type ActivityRequestAttr = {
/**
 * @format uuid
 */
activityRequestId: string;
/**
 * @format uuid
 */
organizationId: string;
/**
 * This is the available time of the contact, not the owner. Availability can
 * span across multiple days and multiple friendly time ranges. i.e. a MWF with
 * morning and afternoon.
 */
availability: { days: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[]; timePeriods: ("morning" | "afternoon" | "evening")[]; };
notes?: string | null ;
/**
 * @format uuid
 */
createdByContactId: string;
/**
 * @format uuid
 */
tenantId: string;
};
export type ActivityRequestCreateBiz = {
notes?: string | null ;
/**
 * This is the available time of the contact, not the owner. Availability can
 * span across multiple days and multiple friendly time ranges. i.e. a MWF with
 * morning and afternoon.
 */
availability: { days: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[]; timePeriods: ("morning" | "afternoon" | "evening")[]; };
};
export type ActivityRequestModifyBiz = {
notes?: string | null ;
/**
 * This is the available time of the contact, not the owner. Availability can
 * span across multiple days and multiple friendly time ranges. i.e. a MWF with
 * morning and afternoon.
 */
availability?: { days: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[]; timePeriods: ("morning" | "afternoon" | "evening")[]; } ;
};
export type AnalyticDisplayType = "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat";
export type AnalyticType = "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product";
export type AnalyticGranularity = "day" | "week" | "month" | "year";
export type AnalyticRelativeTimeRange = "this week" | "this month" | "this year" | "today" | "yesterday" | "last week" | "last month" | "last year" | `last ${number} day` | `last ${number} week` | `last ${number} month` | `last ${number} year` | `from ${number} day ago to now` | `from ${number} week ago to now` | `from ${number} month ago to now` | `from ${number} year ago to now`;
export type AnalyticFilterOperator = "set" | "notSet" | "equals" | "notEquals" | "contains" | "notContains" | "startsWith" | "endsWith" | "gt" | "gte" | "lt" | "lte" | "beforeDate" | "afterDate";
export type AnalyticOrder = [string, "asc" | "desc"][];
export type AnalyticDateRange = AnalyticRelativeTimeRange | [string, string];
export type AnalyticCompareDateRange = [AnalyticDateRange] | [AnalyticDateRange, AnalyticDateRange];
export type AnalyticTimeDimension = [] | [{ dateRange: AnalyticDateRange; dimension: string; granularity?: AnalyticGranularity | undefined; }] | [{ compareDateRange: AnalyticCompareDateRange; dimension: string; granularity?: AnalyticGranularity | undefined; }];
export type AnalyticAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @maxLength 255
 */
name: string;
type: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product";
relatedTypes: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[];
displayType: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat";
/**
 * @maxLength 255
 */
icon: string;
/**
 * @format uuid
 */
createdById: string;
/**
 * @format uuid
 */
tenantId: string;
isMulti: boolean;
dimensions: string[];
limit: number;
measures: string[];
order: [string, "asc" | "desc"][];
segments: string[];
timeDimensions: [] | [{ dateRange: AnalyticDateRange; dimension: string; granularity?: AnalyticGranularity | undefined; }] | [{ compareDateRange: AnalyticCompareDateRange; dimension: string; granularity?: AnalyticGranularity | undefined; }];
filters: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[];
createdAt: Date;
updatedAt: Date;
};
export type AnalyticQueryKeys = "filters" | "isMulti" | "dimensions" | "limit" | "measures" | "order" | "segments" | "timeDimensions";
export type AnalyticCreateBiz = {
/**
 * @maxLength 255
 */
name: string;
type: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product";
filters?: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[] ;
isMulti?: boolean ;
dimensions?: string[] ;
limit?: number ;
measures?: string[] ;
order?: AnalyticOrder ;
segments?: string[] ;
timeDimensions?: AnalyticTimeDimension ;
relatedTypes: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[];
displayType: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat";
/**
 * @maxLength 255
 */
icon: string;
};
export type AnalyticModifyBiz = {
/**
 * @maxLength 255
 */
name?: string ;
type?: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product" ;
filters?: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[] ;
isMulti?: boolean ;
dimensions?: string[] ;
limit?: number ;
measures?: string[] ;
order?: AnalyticOrder ;
segments?: string[] ;
timeDimensions?: AnalyticTimeDimension ;
relatedTypes?: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[] ;
displayType?: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat" ;
/**
 * @maxLength 255
 */
icon?: string ;
};
export type ArticleAttr = {
/**
 * @format string / md5 hash
 */
id: string;
/**
 * @format uuid
 */
tenant_id?: string ;
/**
 * @format uuid
 */
user_id?: string ;
title: string | null;
blurb?: string ;
author?: string ;
body?: string ;
published: Date;
url: string;
image?: string ;
source?: string ;
createdAt: Date;
updatedAt: Date;
};
export type ArticleQueryBiz = {
search?: string ;
order: any;
};
export type ArticleModifyBiz = {
/**
 * @format uuid
 */
tenant_id?: string ;
/**
 * @format uuid
 */
user_id?: string ;
title?: string | null ;
blurb?: string ;
author?: string ;
body?: string ;
published: Date;
url: string;
image?: string ;
source?: string ;
};
export type AuditAction = "create" | "read" | "update" | "delete";
export type AuditAssociation = "owner" | "activityRequest" | "guest" | "mention";
export type AuditResourceType = "activityRequest" | "activity" | "contact" | "contactOwner" | "comment" | "deal" | "dealOwner" | "note" | "organization" | "organizationOwner" | "user";
export type AuditUserType = "contact" | "user";
export type AuditResource = { resourceId: string; resourceIdType: 'string' | 'number'; resourceType: AuditResourceType; resourceDisplayValue: string; };
export type AuditChangeLogUpdate = { displayValue: string; from: any; fromDisplayValue: any; to: any; toDisplayValue: any; };
export type AuditChangeLog = { association?: { type: AuditAssociation; parent: AuditResource; associations: {    displayValue: string;    id: string;    type: AuditUserType;}[]; } | undefined; update?: { [key: string]: AuditChangeLogUpdate; } | undefined; };
export type AuditAttr = {
resourceId: string;
resourceIdType: "string" | "number";
resourceType: "activityRequest" | "activity" | "contact" | "contactOwner" | "comment" | "deal" | "dealOwner" | "note" | "organization" | "organizationOwner" | "user";
resourceDisplayValue: string;
auditId: number;
actorId: string;
actorType: "contact" | "user";
actorDisplayValue: string;
action: "create" | "read" | "update" | "delete";
changeLog?: AuditChangeLog ;
};
export type AuditNotificationAttr = {
auditNotificationId: number;
auditId: number;
userId: string;
userDisplayValue: string;
acknowledged: boolean;
};
export type BadgeAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
tenant_id: string;
/**
 * @maxLength 255
 */
name?: string | null ;
/**
 * @maxLength 255
 */
description?: string | null ;
/**
 * @maxLength 255
 */
status?: string | null ;
/**
 * @maxLength 255
 */
badge_url?: string | null ;
deleted: boolean;
created_at: Date;
updated_at: Date;
};
export type BadgeQueryBiz = {
search?: string ;
order: any;
};
export type BadgeModifyBiz = {
/**
 * @maxLength 255
 */
name?: string | null ;
/**
 * @maxLength 255
 */
description?: string | null ;
/**
 * @maxLength 255
 */
status?: string | null ;
/**
 * @maxLength 255
 */
badge_url?: string | null ;
};
export type CategoryCourseAttr = {
courseId: string;
categoryId: number;
};
export type CategoryCourseCreateBiz = {
courseId: string;
categoryId: number;
};
export type CategoryAttr = {
id: number;
/**
 * @format uuid
 */
tenant_id: string;
/**
 * @maxLength 255
 */
title?: string | null ;
/**
 * @maxLength 255
 */
description?: string | null ;
/**
 * @maxLength 255
 */
status?: string | null ;
/**
 * @maxLength 255
 */
logo?: string | null ;
/**
 * @maxLength 255
 */
icon?: string | null ;
position?: number | null ;
created_at: Date;
updated_at: Date;
};
export type GetCategoryTrainingQuery = { categoryIds?: number[] | undefined; favorites?: AssociationRestriction | undefined; order?: Order[] | undefined; progress?: AssociationRestriction | undefined; search?: string | undefined; };
export type GetCategoryCoursesQuery = { categoryIds?: number[] | undefined; favorites?: AssociationRestriction | undefined; order?: Order[] | undefined; progress?: AssociationRestriction | undefined; search?: string | undefined; };
export type GetCategoryLessonsQuery = GetCategoryTrainingQuery & { random?: boolean | undefined; };
export type GetCategoriesQuery = { extraData?: string[] | undefined; order?: Order | undefined; search?: string | undefined; };
export type CategoryCreateBiz = {
/**
 * @maxLength 255
 */
title: string;
/**
 * @maxLength 255
 */
logo?: string | null ;
/**
 * @maxLength 255
 */
icon?: string | null ;
/**
 * @maxLength 255
 */
description?: string | null ;
};
export type CategoryModifyBiz = {
/**
 * @maxLength 255
 */
title: string;
/**
 * @maxLength 255
 */
logo?: string | null ;
/**
 * @maxLength 255
 */
icon?: string | null ;
/**
 * @maxLength 255
 */
description?: string | null ;
};
export type ComponentAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @maxLength 255
 */
name: string;
enabled: boolean;
/**
 * @format uuid
 */
analyticId?: string | null ;
/**
 * @format uuid
 */
componentTextId?: string | null ;
/**
 * @format uuid
 */
createdById: string;
/**
 * @format uuid
 */
tenantId: string;
createdAt: Date;
updatedAt: Date;
};
export type ComponentQueryBiz = {
enabled?: boolean ;
};
export type ComponentCreateBiz = {
/**
 * @maxLength 255
 */
name: string;
enabled?: boolean ;
/**
 * @format uuid
 */
analyticId?: string | null ;
/**
 * @format uuid
 */
componentTextId?: string | null ;
};
export type ComponentModifyBiz = {
/**
 * @maxLength 255
 */
name: string;
enabled: boolean;
};
export type ComponentCreateWithAssociationBizHelper = { component: { name: string; enabled?: boolean | undefined; analyticId?: string | undefined; componentTextId?: string | undefined; }; };
export type ComponentCreateWithAssociationBiz = {
analytic?: AnalyticCreateBiz ;
componentText?: { icon?: string | null ; source?: "rpmg" | "spGlobal" | "fasterPayments" | "custom" | null | undefined; position?: "left" | "right" | "center" | "top" | "bottom" | null | undefined; iconLabel?: string | null | undefined; type: "donut" | "calendar" | "percentText" | "iconText" | "donutSelection" | "bar"; text: string; request?: ComponentTextRequest | undefined; } | undefined;
component: { name: string; enabled?: boolean | undefined; analyticId?: string | undefined; componentTextId?: string | undefined; };
};
export type ComponentTextSource = "rpmg" | "spGlobal" | "fasterPayments" | "custom";
export type ComponentTextType = "donut" | "calendar" | "percentText" | "iconText" | "donutSelection" | "bar";
export type ComponentTextPosition = "left" | "right" | "center" | "top" | "bottom";
export type ComponentTextRequest = { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; query?: { [key: string]: string | number | boolean; } | undefined; responseOptionKey?: string | undefined; };
export type ComponentTextAttr = {
/**
 * @format uuid
 */
id: string;
text: string;
position?: "left" | "right" | "center" | "top" | "bottom" | null ;
icon?: string | null ;
iconLabel?: string | null ;
request?: ComponentTextRequest ;
source?: "rpmg" | "spGlobal" | "fasterPayments" | "custom" | null ;
type: "donut" | "calendar" | "percentText" | "iconText" | "donutSelection" | "bar";
createdAt: Date;
updatedAt: Date;
};
export type ComponentTextQueryBiz = {
source?: "rpmg" | "spGlobal" | "fasterPayments" | "custom" ;
};
export type ComponentTextCreateBiz = {
icon?: string | null ;
source?: "rpmg" | "spGlobal" | "fasterPayments" | "custom" | null ;
position?: "left" | "right" | "center" | "top" | "bottom" | null ;
iconLabel?: string | null ;
type: "donut" | "calendar" | "percentText" | "iconText" | "donutSelection" | "bar";
text: string;
request?: ComponentTextRequest ;
};
export type ComponentTextModifyBiz = {
icon?: string | null ;
source?: "rpmg" | "spGlobal" | "fasterPayments" | "custom" | null ;
position?: "left" | "right" | "center" | "top" | "bottom" | null ;
iconLabel?: string | null ;
type?: "donut" | "calendar" | "percentText" | "iconText" | "donutSelection" | "bar" ;
text?: string ;
request?: ComponentTextRequest ;
};
export type ContactAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
tenant_id: string;
date_entered: Date;
date_modified: Date;
/**
 * @format uuid
 */
modified_user_id?: string ;
/**
 * @format uuid
 */
created_by: string;
description?: string ;
deleted: boolean;
/**
 * @format uuid
 */
assigned_user_id?: string ;
/**
 * @maxLength 255
 */
salutation?: string ;
/**
 * @maxLength 100
 */
first_name?: string ;
/**
 * @maxLength 100
 */
last_name?: string ;
/**
 * @string 
 */
name?: string | null ;
/**
 * @maxLength 255
 */
title?: string ;
/**
 * @maxLength 255
 */
department?: string ;
do_not_call?: boolean ;
/**
 * @maxLength 255
 */
email_home?: string ;
/**
 * @maxLength 255
 */
email_mobile?: string ;
/**
 * @maxLength 255
 */
email_work?: string ;
/**
 * @maxLength 255
 */
email_other?: string ;
/**
 * @maxLength 255
 */
email_fax?: string ;
/**
 * @maxLength 100
 */
phone_home?: string ;
/**
 * @maxLength 100
 */
phone_mobile?: string ;
/**
 * @maxLength 100
 */
phone_work?: string ;
/**
 * @maxLength 100
 */
phone_other?: string ;
/**
 * @maxLength 100
 */
phone_fax?: string ;
/**
 * @maxLength 100
 */
primary_address_street?: string ;
/**
 * @maxLength 100
 */
primary_address_city?: string ;
/**
 * @maxLength 100
 */
primary_address_state?: string ;
/**
 * @maxLength 20
 */
primary_address_postalcode?: string ;
/**
 * @maxLength 255
 */
primary_address_country?: string ;
/**
 * @maxLength 100
 */
alt_address_street?: string ;
/**
 * @maxLength 100
 */
alt_address_city?: string ;
/**
 * @maxLength 100
 */
alt_address_state?: string ;
/**
 * @maxLength 20
 */
alt_address_postalcode?: string ;
/**
 * @maxLength 255
 */
alt_address_country?: string ;
/**
 * @maxLength 75
 */
assistant?: string ;
/**
 * @maxLength 100
 */
assistant_phone?: string ;
/**
 * @maxLength 255
 */
lead_source?: string ;
/**
 * @maxLength 255
 */
avatar?: string ;
/**
 * @maxLength 75
 */
status?: string ;
/**
 * @format uuid
 */
organization_id?: string | null ;
is_customer?: boolean ;
/**
 * @maxLength 50
 */
cif?: string ;
/**
 * @maxLength 64
 */
external_id?: string ;
/**
 * @format uuid
 */
label_id?: string | null ;
};
export type ContactImportQuery = { updateExisting: boolean; };
export type ContactImportBiz = {
/**
 * @maxLength 255
 */
title?: string ;
/**
 * @maxLength 100
 */
first_name: string;
/**
 * @maxLength 100
 */
last_name: string;
/**
 * @maxLength 255
 */
email_work: string;
/**
 * @maxLength 255
 */
email_other?: string ;
/**
 * @maxLength 100
 */
phone_home?: string ;
/**
 * @maxLength 100
 */
phone_mobile?: string ;
/**
 * @maxLength 100
 */
phone_work?: string ;
/**
 * @maxLength 100
 */
phone_other?: string ;
/**
 * @maxLength 64
 */
external_id?: string ;
organization?: { name: string; industry?: string ; total_revenue?: string | undefined; employees?: number | undefined; address_street?: string | undefined; address_city?: string | undefined; address_state?: string | undefined; address_postalcode?: string | undefined; address_country?: string | undefined; naics_code?: string | undefined; branch?: string | undefined; } | undefined;
};
export type ContactOwnerAttr = {
/**
 * @format uuid
 */
user_id: string;
/**
 * @format uuid
 */
contact_id: string;
};
export type CourseContentAttr = {
/**
 * @format uuid
 */
courseContentId: string;
/**
 * @format uuid
 */
courseId: string;
/**
 * @format uuid
 */
quizId?: string | null ;
order: number;
/**
 * @format uuid
 */
tenantId: string;
createdAt: Date;
updatedAt: Date;
};
export type CourseContentCreateQuizBiz = {
order: number;
quiz: { maxAttempts?: number | null | undefined; questions: QuizQuestionCreateBiz[]; };
};
export type CourseAttrs = { id: string; name?: string | null | undefined; description?: string | null | undefined; status?: string | undefined; is_learning_path?: boolean | undefined; isPublic: boolean; deleted?: boolean | undefined; category_id?: number | null | undefined; badge_id?: string | null | undefined; tenant_id: string; categoryIds?: number[] | undefined; };
export type CourseAttr = {
/**
 * @format uuid
 */
id: string;
name?: string | null ;
description?: string | null ;
status?: string ;
is_learning_path?: boolean ;
isPublic: boolean;
deleted?: boolean ;
category_id?: number | null ;
badge_id?: string | null ;
tenant_id: string;
categoryIds?: number[] ;
created_at: Date;
updated_at: Date;
};
export type CourseQueryStatusQuery = "eq 'draft'" | "eq 'published'";
export type CourseQueryBiz = {
favorites?: AssociationRestriction ;
lessonId?: number | number[] ;
lessons?: AssociationRestriction ;
order?: Order[] ;
progress?: AssociationRestriction ;
search?: string ;
status?: CourseQueryStatusQuery | CourseQueryStatusQuery[] ;
};
export type CourseCreateBiz = {
name?: string | null ;
description?: string | null ;
deleted?: boolean ;
status?: string ;
isPublic?: boolean ;
is_learning_path?: boolean ;
category_id?: number | null ;
badge_id?: string | null ;
categoryIds?: number[] ;
};
export type CourseModifyBiz = {
name?: string | null ;
description?: string | null ;
deleted?: boolean ;
status?: string ;
isPublic?: boolean ;
is_learning_path?: boolean ;
category_id?: number | null ;
badge_id?: string | null ;
categoryIds?: number[] ;
};
export type CourseLessonAttr = {
id: number;
position: number;
lesson_id: number;
course_id: string;
};
export type CoursePreferenceAttr = {
/**
 * @format uuid
 */
courseId: string;
/**
 * @format uuid
 */
userId: string;
isFavorite: boolean;
createdAt: Date;
updatedAt: Date;
};
export type CourseProgressStatus = "in_progress" | "completed" | "failed";
export type CourseProgressAttrs = { id: string; status: CourseProgressStatus; started_at?: Date | undefined; completed_at?: Date | null | undefined; last_attempted_at: Date; progress?: number | null | undefined; points?: number | null | undefined; score?: number | null | undefined; courseContentId?: string | null | undefined; course_id: string; user_id: string; tenant_id: string; };
export type CourseProgressAttr = {
id: string;
status: "in_progress" | "completed" | "failed";
started_at?: Date ;
completed_at?: Date | null ;
last_attempted_at: Date;
progress?: number | null ;
points?: number | null ;
score?: number | null ;
courseContentId?: string | null ;
/**
 * @format uuid
 */
course_id: string;
/**
 * @format uuid
 */
user_id: string;
/**
 * @format uuid
 */
tenant_id: string;
created_at: Date;
updated_at: Date;
};
export type CourseProgressUpsertBiz = {
/**
 * When `null`, it will indicate user has requested a new lesson if user
 * has completed a previous course.
 */
courseContentId?: string | null ;
};
export type CourseProgressQuizSubmissionAttr = {
/**
 * @format uuid
 */
courseProgressQuizSubmissionId: string;
courseProgressId: string;
/**
 * @format uuid
 */
quizSubmissionId: string;
createdAt: Date;
updatedAt: Date;
};
export type DashboardComponentAttr = {
/**
 * @format uuid
 */
dashboardId: string;
/**
 * @format uuid
 */
componentId: string;
createdAt: Date;
updatedAt: Date;
};
export type DashboardType = "dashboard" | "insight";
export type DashboardAttr = {
/**
 * @format uuid
 */
id: string;
name: string;
type: "dashboard" | "insight";
enabled: boolean;
/**
 * @format uuid
 */
organizationId?: string | null ;
/**
 * @format uuid
 */
createdById: string;
/**
 * @format uuid
 */
tenantId: string;
createdAt: Date;
updatedAt: Date;
};
export type DashboardQueryBiz = {
type?: "dashboard" | "insight" ;
/**
 * @format uuid
 */
organizationId?: string ;
};
export type DashboardCreateBiz = {
name: string;
type: "dashboard" | "insight";
/**
 * @format uuid
 */
organizationId?: string | null ;
enabled?: boolean ;
};
export type DashboardModifyBiz = {
name?: string ;
};
export type DashboardAddComponentBiz = {
analytic?: AnalyticCreateBiz ;
componentText?: { icon?: string | null ; source?: "rpmg" | "spGlobal" | "fasterPayments" | "custom" | null | undefined; position?: "left" | "right" | "center" | "top" | "bottom" | null | undefined; iconLabel?: string | null | undefined; type: "donut" | "calendar" | "percentText" | "iconText" | "donutSelection" | "bar"; text: string; request?: ComponentTextRequest | undefined; } | undefined;
component: { name: string; enabled?: boolean | undefined; analyticId?: string | undefined; componentTextId?: string | undefined; };
};
export type DashboardModifyComponentBiz = {
component?: ComponentModifyBiz ;
};
export type DashboardDefaultBiz = {
type: "dashboard" | "insight";
};
export type DealType = "cold" | "warm" | "hot" | "won" | "lost";
export type DealStatus = "won" | "lost";
export type DealAttr = {
/**
 * @format uuid
 */
id: string;
name?: string ;
date_entered?: Date ;
date_modified?: Date ;
/**
 * @format uuid
 */
modified_user_id?: string ;
/**
 * @format uuid
 */
created_by: string;
description?: string ;
deleted?: boolean ;
/**
 * @format uuid
 */
assigned_user_id?: string ;
deal_type?: "cold" | "warm" | "hot" | "won" | "lost" ;
lead_source?: string ;
amount?: number ;
currency?: string ;
date_closed?: Date ;
next_step?: string ;
sales_stage?: string ;
probability?: number ;
/**
 * @format uuid
 */
contact_person_id?: string | null ;
/**
 * @format uuid
 */
contact_organization_id?: string | null ;
date_won_closed?: Date ;
date_lost_closed?: Date ;
last_status_update?: Date ;
/**
 * @format uuid
 */
tenant_id?: string ;
position: number;
/**
 * @format uuid
 */
tenant_deal_stage_id?: string ;
status?: "won" | "lost" ;
};
export type DealOwnerAttr = {
/**
 * @format uuid
 */
user_id: string;
/**
 * @format uuid
 */
deal_id: string;
};
export type DealProductAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
product_id?: string ;
quantity?: number ;
price?: number ;
/**
 * @format uuid
 */
deal_id?: string ;
};
export type DefaultFieldAttr = {
id?: string ;
key: string;
field_type: "CHAR" | "TEXT" | "NUMBER" | "DATE" | "TIME" | "CURRENCY" | "URL" | "CHECKBOX" | "EMAIL" | "PHONE";
value_type: "string" | "number" | "boolean" | "object" | "date";
order?: number ;
type: "contact" | "deal" | "organization" | "product" | "task" | "call" | "event";
mandatory?: boolean ;
usedField?: boolean ;
isFixed?: boolean ;
columnName: string;
isCustom?: boolean ;
section: string;
preferred?: boolean ;
};
export type DefaultFieldCreateBiz = {
type: "contact" | "deal" | "organization" | "product" | "task" | "call" | "event";
order?: number ;
key: string;
field_type: "CHAR" | "TEXT" | "NUMBER" | "DATE" | "TIME" | "CURRENCY" | "URL" | "CHECKBOX" | "EMAIL" | "PHONE";
value_type: "string" | "number" | "boolean" | "object" | "date";
mandatory?: boolean ;
usedField?: boolean ;
isFixed?: boolean ;
columnName: string;
isCustom?: boolean ;
section: string;
preferred?: boolean ;
};
export type FeedAttrs = { id: string; summary: string; type: string; object_data: any; content?: string | undefined; created_by: string; updated_by?: string | undefined; contact_id?: string | undefined; organization_id?: string | undefined; deal_id?: string | undefined; created_on?: Date | undefined; tenant_id: string; };
export type FeedAttr = {
/**
 * @format uuid
 */
id: string;
summary: string;
type: string;
object_data: any;
content?: string ;
/**
 * @format uuid
 */
created_by: string;
/**
 * @format uuid
 */
updated_by?: string ;
/**
 * @format uuid
 */
contact_id?: string ;
/**
 * @format uuid
 */
organization_id?: string ;
/**
 * @format uuid
 */
deal_id?: string ;
created_on?: Date ;
/**
 * @format uuid
 */
tenant_id: string;
created_at: Date;
updated_at: Date;
};
export type FieldFieldType = "CHAR" | "TEXT" | "NUMBER" | "DATE" | "TIME" | "CURRENCY" | "URL" | "CHECKBOX" | "EMAIL" | "PHONE";
export type FieldValueType = "string" | "number" | "boolean" | "object" | "date";
export type FieldType = "contact" | "deal" | "organization" | "product" | "task" | "call" | "event";
export type FieldAttr = {
id?: string ;
key: string;
field_type: "CHAR" | "TEXT" | "NUMBER" | "DATE" | "TIME" | "CURRENCY" | "URL" | "CHECKBOX" | "EMAIL" | "PHONE";
value_type: "string" | "number" | "boolean" | "object" | "date";
order?: number ;
type: "contact" | "deal" | "organization" | "product" | "task" | "call" | "event";
tenant_id?: string ;
mandatory?: boolean ;
usedField?: boolean ;
isFixed?: boolean ;
columnName: string;
isCustom?: boolean ;
section: string;
preferred?: boolean ;
created_by: string;
};
export type FieldDefaultCreateBiz = {
type?: "contact" | "deal" | "organization" | "product" | "task" | "call" | "event" ;
};
export type SetFieldPreference = { type: FieldType; fieldIds: string[]; };
export type FieldQueryBiz = {
type: "contact" | "deal" | "organization" | "product" | "task" | "call" | "event";
preferred?: boolean ;
usedField?: boolean ;
order?: Order ;
};
export type FieldCreateBiz = {
type: "contact" | "deal" | "organization" | "product" | "task" | "call" | "event";
created_by: string;
tenant_id?: string ;
order?: number ;
key: string;
field_type: "CHAR" | "TEXT" | "NUMBER" | "DATE" | "TIME" | "CURRENCY" | "URL" | "CHECKBOX" | "EMAIL" | "PHONE";
value_type: "string" | "number" | "boolean" | "object" | "date";
mandatory?: boolean ;
usedField?: boolean ;
isFixed?: boolean ;
columnName: string;
isCustom?: boolean ;
section: string;
preferred?: boolean ;
};
export type FieldModifyBiz = {
type?: "contact" | "deal" | "organization" | "product" | "task" | "call" | "event" ;
created_by?: string ;
tenant_id?: string ;
order?: number ;
key?: string ;
field_type?: "CHAR" | "TEXT" | "NUMBER" | "DATE" | "TIME" | "CURRENCY" | "URL" | "CHECKBOX" | "EMAIL" | "PHONE" ;
value_type?: "string" | "number" | "boolean" | "object" | "date" ;
mandatory?: boolean ;
usedField?: boolean ;
isFixed?: boolean ;
columnName?: string ;
isCustom?: boolean ;
section?: string ;
preferred?: boolean ;
};
export type FileAttr = {
/**
 * @format uuid
 */
id: string;
storage: string;
filename_disk?: string ;
filename_download: string;
title?: string ;
type?: string ;
folder?: string ;
uploaded_by?: string ;
uploaded_on: Date;
modified_by?: string ;
modified_on: Date;
charset?: string ;
filesize?: number ;
width?: number ;
height?: number ;
duration?: number ;
embed?: string ;
description?: string ;
location?: string ;
tags?: string ;
metadata: any;
tenant_id: string;
is_public: boolean;
};
export type GroupAttrs = { id: string; parent_id?: string | null | undefined; name: string; has_sibling_access: boolean; description?: string | null | undefined; tenant_id: string; deleted_on?: Date | null | undefined; };
export type GroupQueryBiz = {
/**
 * Filters result by self. As users with elevated permissions can query data
 * across a tenant(s) and user(s), there may be situations where a user
 * would like to see data related only about themselves.
 * 
 * This includes data created by them or data assigned to them.
 */
self?: boolean ;
};
export type GroupAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
parent_id?: string | null ;
name: string;
has_sibling_access: boolean;
description?: string | null ;
tenant_id: string;
deleted_on?: Date | null ;
created_at: Date;
updated_at: Date;
};
export type GroupCreateBiz = {
/**
 * There can only be 1 root group per tenant. A root group is defined as a
 * group with a "null" parent_id.
 * @format uuid
 */
parent_id?: string | null ;
/**
 * @maxLength 50
 */
name: string;
has_sibling_access?: boolean ;
description?: string | null ;
};
export type GroupModifyBiz = {
/**
 * @maxLength 50
 */
name?: string ;
description?: string | null ;
has_sibling_access?: boolean ;
};
export type LabelType = "contact" | "organization";
export type LabelAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @maxLength 255
 */
name: string;
/**
 * @maxLength 255
 */
color: string;
type?: "contact" | "organization" | null ;
/**
 * @format uuid
 */
assigned_user_id?: string | null ;
/**
 * @format uuid
 */
tenant_id: string;
created_at: Date;
updated_at: Date;
};
export type LabelCreateBiz = {
/**
 * @maxLength 255
 */
name: string;
type?: "contact" | "organization" | null ;
/**
 * @maxLength 255
 */
color: string;
};
export type LabelModifyBiz = {
/**
 * @maxLength 255
 */
name?: string ;
type?: "contact" | "organization" | null ;
/**
 * @maxLength 255
 */
color?: string ;
};
export type LessonAttrs = { id: number; title: string; content?: string | null | undefined; category_id?: number | null | undefined; max_points?: number | null | undefined; max_attempts?: number | null | undefined; documents?: string | null | undefined; duration?: number | null | undefined; isPublic: boolean; tags?: string | null | undefined; icon?: string | null | undefined; status?: string | undefined; tenant_id: string; };
export type LessonAttr = {
id: number;
/**
 * @maxLength 255
 */
title: string;
content?: string | null ;
category_id?: number | null ;
max_points?: number | null ;
max_attempts?: number | null ;
/**
 * @maxLength 255
 */
documents?: string | null ;
duration?: number | null ;
isPublic: boolean;
/**
 * @maxLength 255
 */
tags?: string | null ;
/**
 * @maxLength 255
 */
icon?: string | null ;
/**
 * @maxLength 255
 */
status?: string ;
/**
 * @format uuid
 */
tenant_id: string;
created_at: Date;
updated_at: Date;
};
export type LessonQueryStatusQuery = "eq 'draft'" | "eq 'published'" | "ne 'deleted'";
export type GetLessonsQuery = { search?: string | undefined; status?: LessonQueryStatusQuery | LessonQueryStatusQuery[] | undefined; favorites?: AssociationRestriction | undefined; progress?: AssociationRestriction | undefined; } & { order?: Order[] | undefined; } & Self;
export type LessonCreateBiz = {
/**
 * @maxLength 255
 */
icon?: string | null ;
/**
 * @maxLength 255
 */
title: string;
/**
 * @maxLength 255
 */
status?: string ;
isPublic?: boolean ;
category_id?: number | null ;
content?: string | null ;
max_points?: number | null ;
max_attempts?: number | null ;
/**
 * @maxLength 255
 */
documents?: string | null ;
duration?: number | null ;
/**
 * @maxLength 255
 */
tags?: string | null ;
};
export type LessonModifyBiz = {
/**
 * @maxLength 255
 */
icon?: string | null ;
/**
 * @maxLength 255
 */
title?: string ;
/**
 * @maxLength 255
 */
status?: string ;
isPublic?: boolean ;
category_id?: number | null ;
content?: string | null ;
max_points?: number | null ;
max_attempts?: number | null ;
/**
 * @maxLength 255
 */
documents?: string | null ;
duration?: number | null ;
/**
 * @maxLength 255
 */
tags?: string | null ;
};
export type LessonPageType = "video" | "quiz" | "slide" | "quiz_review";
export type LessonPageAttrs = { id: number; type: LessonPageType; title?: string | undefined; content?: string | null | undefined; order?: number | undefined; videoId?: string | null | undefined; quizId?: string | null | undefined; contactAccessible: boolean; lesson_id: number; tenant_id: string; };
export type LessonPageAttr = {
id: number;
type: "video" | "quiz" | "slide" | "quiz_review";
title?: string ;
content?: string | null ;
order?: number ;
videoId?: string | null ;
/**
 * @format uuid
 */
quizId?: string | null ;
contactAccessible: boolean;
lesson_id: number;
/**
 * @format uuid
 */
tenant_id: string;
created_at: Date;
updated_at: Date;
};
export type LessonUpsertBiz = {
pages: { type: "video" | "quiz" | "slide" | "quiz_review"; order?: number | undefined; title?: string | undefined; quizId?: string | null | undefined; content?: string | null | undefined; contactAccessible?: boolean | undefined; videoId?: string | null | undefined; lesson_id: number; id?: number | undefined; }[];
};
export type LessonPreferenceAttr = {
lessonId: number;
/**
 * @format uuid
 */
userId: string;
isFavorite: boolean;
createdAt: Date;
updatedAt: Date;
};
export type LessonProgressStatus = "in_progress" | "completed" | "failed" | "pending";
export type LessonProgressAttrs = { id: number; status: LessonProgressStatus; started_at?: Date | undefined; completed_at?: Date | null | undefined; last_attempted_at: Date; progress?: number | null | undefined; points?: number | null | undefined; score?: number | null | undefined; page_id?: number | null | undefined; lesson_id: number; user_id: string; tenant_id: string; };
export type LessonProgressAttr = {
id: number;
status: "in_progress" | "completed" | "failed" | "pending";
started_at?: Date ;
completed_at?: Date | null ;
last_attempted_at: Date;
progress?: number | null ;
points?: number | null ;
score?: number | null ;
page_id?: number | null ;
lesson_id: number;
/**
 * @format uuid
 */
user_id: string;
/**
 * @format uuid
 */
tenant_id: string;
created_at: Date;
updated_at: Date;
};
export type LessonProgressUpsertBiz = {
/**
 * When `null`, it will indicate user has requested a new lesson if user
 * has completed a previous lesson.
 */
page_id: number | null;
};
export type LessonProgressQuizSubmissionAttr = {
/**
 * @format uuid
 */
lessonProgressQuizSubmissionId: string;
lessonProgressId: number;
/**
 * @format uuid
 */
quizSubmissionId: string;
createdAt: Date;
updatedAt: Date;
};
export type NaicsCrossReferenceAttr = {
/**
 * @format uuid
 */
id: string;
code: string;
cross_reference_code: string;
cross_reference: string;
created_at: Date;
updated_at: Date;
};
export type NaicsAttr = {
/**
 * @pattern ^\d+$
 */
code: string;
/**
 * @maxLength 255
 */
title: string;
created_at: Date;
updated_at: Date;
};
export type NaicsQueryBiz = {
search?: string ;
};
export type NaicsSpAttr = {
/**
 * @pattern ^\d+$
 */
code: string;
/**
 * @format uuid
 */
sp_summary_id: string;
created_at: Date;
updated_at: Date;
};
export type OrganizationAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
tenant_id: string;
/**
 * @maxLength 255
 */
name?: string ;
date_entered?: Date ;
date_modified?: Date ;
/**
 * @format uuid
 */
modified_user_id?: string ;
/**
 * @format uuid
 */
created_by: string;
deleted: boolean;
/**
 * @format uuid
 */
assigned_user_id: string;
/**
 * @maxLength 100
 */
industry?: string ;
/**
 * @maxLength 100
 */
annual_revenue?: string ;
/**
 * @maxLength 100
 */
annual_revenue_merchant?: string ;
/**
 * @maxLength 100
 */
annual_revenue_treasury?: string ;
/**
 * @maxLength 100
 */
annual_revenue_business_card?: string ;
/**
 * @maxLength 100
 */
total_revenue?: string ;
/**
 * @maxLength 100
 */
phone_fax?: string ;
/**
 * @maxLength 155
 */
billing_address_street?: string ;
/**
 * @maxLength 100
 */
billing_address_city?: string ;
/**
 * @maxLength 100
 */
billing_address_state?: string ;
/**
 * @maxLength 20
 */
billing_address_postalcode?: string ;
/**
 * @maxLength 255
 */
billing_address_country?: string ;
/**
 * @maxLength 100
 */
rating?: string ;
/**
 * @maxLength 100
 */
phone_office?: string ;
/**
 * @maxLength 100
 */
phone_alternate?: string ;
/**
 * @maxLength 255
 */
website?: string ;
employees?: number ;
/**
 * @maxLength 10
 */
ticker_symbol?: string ;
/**
 * @maxLength 150
 */
address_street?: string ;
/**
 * @maxLength 150
 */
address_suite?: string ;
/**
 * @maxLength 100
 */
address_city?: string ;
/**
 * @maxLength 100
 */
address_state?: string ;
/**
 * @maxLength 20
 */
address_postalcode?: string ;
/**
 * @maxLength 255
 */
address_country?: string ;
/**
 * @maxLength 10
 */
sic_code?: string ;
/**
 * @maxLength 150
 */
status?: string ;
/**
 * @maxLength 10
 * @pattern ^\d+$
 */
naics_code?: string ;
is_customer?: boolean ;
/**
 * @maxLength 50
 */
cif?: string ;
/**
 * @maxLength 10
 */
branch?: string ;
/**
 * @maxLength 64
 */
external_id?: string ;
/**
 * @maxLength 255
 */
avatar?: string ;
/**
 * @format uuid
 */
label_id?: string | null ;
};
export type OrganizationImportQuery = { updateExisting: boolean; };
export type OrganizationImportBiz = {
/**
 * @maxLength 255
 */
name: string;
/**
 * @maxLength 100
 */
industry?: string ;
/**
 * @maxLength 100
 */
total_revenue?: string ;
employees?: number ;
/**
 * @maxLength 150
 */
address_street?: string ;
/**
 * @maxLength 100
 */
address_city?: string ;
/**
 * @maxLength 100
 */
address_state?: string ;
/**
 * @maxLength 20
 */
address_postalcode?: string ;
/**
 * @maxLength 255
 */
address_country?: string ;
/**
 * @maxLength 10
 * @pattern ^\d+$
 */
naics_code?: string ;
/**
 * @maxLength 10
 */
branch?: string ;
};
export type OrganizationOwnerAttr = {
/**
 * @format uuid
 */
user_id: string;
/**
 * @format uuid
 */
organization_id: string;
};
export type PermissionCollection = "notes" | "dashboard" | "accounts" | "activities" | "analytics" | "categories" | "contacts" | "courses" | "dashboards" | "deals" | "lessons" | "products" | "prospects" | "quizzes" | "reports" | "insights";
export type PermissionAction = "create" | "delete" | "view" | "manage" | "edit";
export type PermissionAttr = {
/**
 * @format uuid
 */
role: string;
/**
 * @maxLength 64
 */
collection: "notes" | "dashboard" | "accounts" | "activities" | "analytics" | "categories" | "contacts" | "courses" | "dashboards" | "deals" | "lessons" | "products" | "prospects" | "quizzes" | "reports" | "insights";
/**
 * @maxLength 10
 */
action: "create" | "delete" | "view" | "manage" | "edit";
/**
 * @format uuid
 */
tenant_id: string;
};
export type PermissionUpsertBiz = {
/**
 * @maxLength 64
 */
collection: "notes" | "dashboard" | "accounts" | "activities" | "analytics" | "categories" | "contacts" | "courses" | "dashboards" | "deals" | "lessons" | "products" | "prospects" | "quizzes" | "reports" | "insights";
/**
 * @maxLength 10
 */
action: "create" | "delete" | "view" | "manage" | "edit";
};
export type CollectionPermission = { notes: { create: { collection: "notes"; action: "create"; }; delete: { collection: "notes"; action: "delete"; }; view: { collection: "notes"; action: "view"; }; manage: { collection: "notes"; action: "manage"; }; edit: { collection: "notes"; action: "edit"; }; }; dashboard: { create: { collection: "dashboard"; action: "create"; }; delete: { collection: "dashboard"; action: "delete"; }; view: { collection: "dashboard"; action: "view"; }; manage: { collection: "dashboard"; action: "manage"; }; edit: { collection: "dashboard"; action: "edit"; }; }; accounts: { create: { collection: "accounts"; action: "create"; }; delete: { collection: "accounts"; action: "delete"; }; view: { collection: "accounts"; action: "view"; }; manage: { collection: "accounts"; action: "manage"; }; edit: { collection: "accounts"; action: "edit"; }; }; activities: { create: { collection: "activities"; action: "create"; }; delete: { collection: "activities"; action: "delete"; }; view: { collection: "activities"; action: "view"; }; manage: { collection: "activities"; action: "manage"; }; edit: { collection: "activities"; action: "edit"; }; }; analytics: { create: { collection: "analytics"; action: "create"; }; delete: { collection: "analytics"; action: "delete"; }; view: { collection: "analytics"; action: "view"; }; manage: { collection: "analytics"; action: "manage"; }; edit: { collection: "analytics"; action: "edit"; }; }; categories: { create: { collection: "categories"; action: "create"; }; delete: { collection: "categories"; action: "delete"; }; view: { collection: "categories"; action: "view"; }; manage: { collection: "categories"; action: "manage"; }; edit: { collection: "categories"; action: "edit"; }; }; contacts: { create: { collection: "contacts"; action: "create"; }; delete: { collection: "contacts"; action: "delete"; }; view: { collection: "contacts"; action: "view"; }; manage: { collection: "contacts"; action: "manage"; }; edit: { collection: "contacts"; action: "edit"; }; }; courses: { create: { collection: "courses"; action: "create"; }; delete: { collection: "courses"; action: "delete"; }; view: { collection: "courses"; action: "view"; }; manage: { collection: "courses"; action: "manage"; }; edit: { collection: "courses"; action: "edit"; }; }; dashboards: { create: { collection: "dashboards"; action: "create"; }; delete: { collection: "dashboards"; action: "delete"; }; view: { collection: "dashboards"; action: "view"; }; manage: { collection: "dashboards"; action: "manage"; }; edit: { collection: "dashboards"; action: "edit"; }; }; deals: { create: { collection: "deals"; action: "create"; }; delete: { collection: "deals"; action: "delete"; }; view: { collection: "deals"; action: "view"; }; manage: { collection: "deals"; action: "manage"; }; edit: { collection: "deals"; action: "edit"; }; }; lessons: { create: { collection: "lessons"; action: "create"; }; delete: { collection: "lessons"; action: "delete"; }; view: { collection: "lessons"; action: "view"; }; manage: { collection: "lessons"; action: "manage"; }; edit: { collection: "lessons"; action: "edit"; }; }; products: { create: { collection: "products"; action: "create"; }; delete: { collection: "products"; action: "delete"; }; view: { collection: "products"; action: "view"; }; manage: { collection: "products"; action: "manage"; }; edit: { collection: "products"; action: "edit"; }; }; prospects: { create: { collection: "prospects"; action: "create"; }; delete: { collection: "prospects"; action: "delete"; }; view: { collection: "prospects"; action: "view"; }; manage: { collection: "prospects"; action: "manage"; }; edit: { collection: "prospects"; action: "edit"; }; }; quizzes: { create: { collection: "quizzes"; action: "create"; }; delete: { collection: "quizzes"; action: "delete"; }; view: { collection: "quizzes"; action: "view"; }; manage: { collection: "quizzes"; action: "manage"; }; edit: { collection: "quizzes"; action: "edit"; }; }; reports: { create: { collection: "reports"; action: "create"; }; delete: { collection: "reports"; action: "delete"; }; view: { collection: "reports"; action: "view"; }; manage: { collection: "reports"; action: "manage"; }; edit: { collection: "reports"; action: "edit"; }; }; insights: { create: { collection: "insights"; action: "create"; }; delete: { collection: "insights"; action: "delete"; }; view: { collection: "insights"; action: "view"; }; manage: { collection: "insights"; action: "manage"; }; edit: { collection: "insights"; action: "edit"; }; }; };
/**
 * Permission map for easy access control lookup
 */
export type Permissions = { privileged: { readonly admin: { readonly collection: "admin"; readonly action: "*"; }; readonly owner: { readonly collection: "owner"; readonly action: "*"; }; }; notes: { create: { collection: "notes"; action: "create"; }; delete: { collection: "notes"; action: "delete"; }; view: { collection: "notes"; action: "view"; }; manage: { collection: "notes"; action: "manage"; }; edit: { collection: "notes"; action: "edit"; }; }; dashboard: { create: { collection: "dashboard"; action: "create"; }; delete: { collection: "dashboard"; action: "delete"; }; view: { collection: "dashboard"; action: "view"; }; manage: { collection: "dashboard"; action: "manage"; }; edit: { collection: "dashboard"; action: "edit"; }; }; accounts: { create: { collection: "accounts"; action: "create"; }; delete: { collection: "accounts"; action: "delete"; }; view: { collection: "accounts"; action: "view"; }; manage: { collection: "accounts"; action: "manage"; }; edit: { collection: "accounts"; action: "edit"; }; }; activities: { create: { collection: "activities"; action: "create"; }; delete: { collection: "activities"; action: "delete"; }; view: { collection: "activities"; action: "view"; }; manage: { collection: "activities"; action: "manage"; }; edit: { collection: "activities"; action: "edit"; }; }; analytics: { create: { collection: "analytics"; action: "create"; }; delete: { collection: "analytics"; action: "delete"; }; view: { collection: "analytics"; action: "view"; }; manage: { collection: "analytics"; action: "manage"; }; edit: { collection: "analytics"; action: "edit"; }; }; categories: { create: { collection: "categories"; action: "create"; }; delete: { collection: "categories"; action: "delete"; }; view: { collection: "categories"; action: "view"; }; manage: { collection: "categories"; action: "manage"; }; edit: { collection: "categories"; action: "edit"; }; }; contacts: { create: { collection: "contacts"; action: "create"; }; delete: { collection: "contacts"; action: "delete"; }; view: { collection: "contacts"; action: "view"; }; manage: { collection: "contacts"; action: "manage"; }; edit: { collection: "contacts"; action: "edit"; }; }; courses: { create: { collection: "courses"; action: "create"; }; delete: { collection: "courses"; action: "delete"; }; view: { collection: "courses"; action: "view"; }; manage: { collection: "courses"; action: "manage"; }; edit: { collection: "courses"; action: "edit"; }; }; dashboards: { create: { collection: "dashboards"; action: "create"; }; delete: { collection: "dashboards"; action: "delete"; }; view: { collection: "dashboards"; action: "view"; }; manage: { collection: "dashboards"; action: "manage"; }; edit: { collection: "dashboards"; action: "edit"; }; }; deals: { create: { collection: "deals"; action: "create"; }; delete: { collection: "deals"; action: "delete"; }; view: { collection: "deals"; action: "view"; }; manage: { collection: "deals"; action: "manage"; }; edit: { collection: "deals"; action: "edit"; }; }; lessons: { create: { collection: "lessons"; action: "create"; }; delete: { collection: "lessons"; action: "delete"; }; view: { collection: "lessons"; action: "view"; }; manage: { collection: "lessons"; action: "manage"; }; edit: { collection: "lessons"; action: "edit"; }; }; products: { create: { collection: "products"; action: "create"; }; delete: { collection: "products"; action: "delete"; }; view: { collection: "products"; action: "view"; }; manage: { collection: "products"; action: "manage"; }; edit: { collection: "products"; action: "edit"; }; }; prospects: { create: { collection: "prospects"; action: "create"; }; delete: { collection: "prospects"; action: "delete"; }; view: { collection: "prospects"; action: "view"; }; manage: { collection: "prospects"; action: "manage"; }; edit: { collection: "prospects"; action: "edit"; }; }; quizzes: { create: { collection: "quizzes"; action: "create"; }; delete: { collection: "quizzes"; action: "delete"; }; view: { collection: "quizzes"; action: "view"; }; manage: { collection: "quizzes"; action: "manage"; }; edit: { collection: "quizzes"; action: "edit"; }; }; reports: { create: { collection: "reports"; action: "create"; }; delete: { collection: "reports"; action: "delete"; }; view: { collection: "reports"; action: "view"; }; manage: { collection: "reports"; action: "manage"; }; edit: { collection: "reports"; action: "edit"; }; }; insights: { create: { collection: "insights"; action: "create"; }; delete: { collection: "insights"; action: "delete"; }; view: { collection: "insights"; action: "view"; }; manage: { collection: "insights"; action: "manage"; }; edit: { collection: "insights"; action: "edit"; }; }; };
export type PipelineAttr = {
id: string;
name: string;
description?: string ;
isDefault: boolean;
global: boolean;
tenantId: string;
createdById: string;
};
export type PipelineQueryBiz = {
order?: Order ;
};
export type PipelineCreateBiz = {
name: string;
description?: string ;
global?: boolean ;
};
export type PipelineModifyBiz = {
name?: string ;
description?: string ;
global?: boolean ;
};
export type PipelineTeamAttr = {
teamId: string;
pipelineId: string;
};
export type PipelineTeamCreateBiz = {
teamId: string;
pipelineId: string;
};
export type ProductAttrs = { id?: string | undefined; tenant_id: string; name?: string | undefined; price?: number | undefined; code?: string | undefined; category?: string | undefined; unit?: string | undefined; tax?: string | undefined; description?: string | undefined; deleted: boolean; };
export type ProductAttr = {
/**
 * @format uuid
 */
id?: string ;
/**
 * @format uuid
 */
tenant_id: string;
name?: string ;
price?: number ;
code?: string ;
category?: string ;
unit?: string ;
tax?: string ;
description?: string ;
deleted: boolean;
created_at: Date;
updated_at: Date;
};
export type QuizAttr = {
/**
 * @format uuid
 */
quizId: string;
/**
 * @description The maximum number of attempts allowed for this quiz. If null, infinite attempts
 */
maxAttempts?: number | null ;
createdAt: Date;
updatedAt: Date;
};
export type QuizCreateBiz = {
maxAttempts?: number | null ;
questions: QuizQuestionCreateBiz[];
};
export type QuizCreateSubmissionBiz = {
answers: { quizQuestionId: string; id: string; }[];
};
export type QuizQuestionType = "multipleChoice";
export type QuizQuestionChoice = { id: string; answer: string; correct: boolean; };
export type QuizQuestionAttr = {
/**
 * @format uuid
 */
quizQuestionId: string;
/**
 * @format uuid
 */
quizId: string;
title?: string ;
type: "multipleChoice";
choices: QuizQuestionChoice[];
/**
 * @minimum 0
 */
order: number;
createdAt: Date;
updatedAt: Date;
};
export type QuizQuestionCreateBiz = {
type: "multipleChoice";
/**
 * @minimum 0
 */
order: number;
title?: string ;
choices: QuizQuestionChoice[];
};
export type QuizQuestionSubmissionBiz = {
answers: { id: string; }[];
};
export type QuizQuestionSubmissionAttr = {
/**
 * @format uuid
 */
quizQuestionSubmissionId: string;
/**
 * @format uuid
 */
userId: string;
/**
 * @format uuid
 */
quizSubmissionId: string;
/**
 * @format uuid
 */
quizQuestionId: string;
/**
 * @description Whether the answer was correct
 */
correct: boolean;
createdAt: Date;
updatedAt: Date;
};
export type QuizSubmissionStatus = "in-progress" | "pass" | "fail";
export type QuizSubmissionAttr = {
/**
 * @format uuid
 */
quizSubmissionId: string;
/**
 * @format uuid
 */
userId: string;
/**
 * @format uuid
 */
quizId: string;
/**
 * @description Score is not calculated until all questions have been answered.
 */
score?: number | null ;
completedAt?: Date | null ;
createdAt: Date;
updatedAt: Date;
};
export type ReportType = "TREASURY";
export type ReportTreasuryService = { id: number; name: string; total_items: number; item_fee: number; proposed_item_fee: number; };
export type ReportTreasuryInput = { type: 'TREASURY'; client_name: string; proposed_bank_name: string; date: string; average_balance: number; services: ReportTreasuryService[]; logo_white: string; logo_dark: string; };
export type ReportInput = { type: "TREASURY"; client_name: string; proposed_bank_name: string; date: string; average_balance: number; services: ReportTreasuryService[]; logo_white: string; logo_dark: string; };
export type ReportAttrs = { id: string; organization_id: string; created_by: string; file_id?: string | undefined; type: ReportType; input: ReportInput; month?: string | undefined; tenant_id: string; };
export type ReportAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
organization_id: string;
/**
 * @format uuid
 */
created_by: string;
/**
 * @format uuid
 */
file_id?: string ;
type: "TREASURY";
input: { type: "TREASURY"; client_name: string; proposed_bank_name: string; date: string; average_balance: number; services: ReportTreasuryService[]; logo_white: string; logo_dark: string; };
month?: string ;
/**
 * @format uuid
 */
tenant_id: string;
created_at: Date;
updated_at: Date;
};
export type RoleAttr = {
/**
 * @format uuid
 */
id?: string ;
/**
 * @format uuid
 */
tenant_id: string;
/**
 * @maxLength 100
 */
name: string;
/**
 * @maxLength 30
 */
icon?: string ;
description?: string ;
ip_access?: string ;
enforce_tfa: boolean;
admin_access: boolean;
owner_access: boolean;
/**
 * Used for application users. If the role has associated permissions,
 * those permissions will superseded default app_access permissions.
 */
app_access: boolean;
};
export type RoleQueryBiz = {
order?: Order ;
search?: string ;
/**
 * Filters result by self. As users with elevated permissions can query data
 * across a tenant(s) and user(s), there may be situations where a user
 * would like to see data related only about themselves.
 * 
 * This includes data created by them or data assigned to them.
 */
self?: boolean ;
};
export type RoleCreateBiz = {
/**
 * @maxLength 100
 */
name: string;
description?: string ;
admin_access: boolean;
owner_access: boolean;
};
export type RoleModifyBiz = {
/**
 * @maxLength 100
 */
name?: string ;
description?: string ;
admin_access?: boolean ;
owner_access?: boolean ;
};
export type RpmgSummaryAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
rpmg_vertical_id: string;
average_p_card_spending: number;
average_p_card_transactions: number;
average_spending_per_transaction: number;
average_spending_per_mm_revenue: number;
};
export type RpmgTransactionAttr = {
/**
 * @format uuid
 */
id: string;
name: string;
/**
 * @description Monetary range summary. e.g. <2500, 2500-10000, >10000
 * @pattern ^[<|>]\d+|\d+-\d+$
 */
range: string;
};
export type RpmgTransactionSummaryAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
rpmg_vertical_id: string;
/**
 * @format uuid
 */
rpmg_transaction_id: string;
/**
 * @description Represents a percentage value
 */
all_card_platforms: number;
/**
 * @description Represents a percentage value
 */
checks: number;
/**
 * @description Represents a percentage value
 */
ach: number;
/**
 * @description Represents a percentage value
 */
wire_transfer: number;
};
export type RpmgVerticalAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @maxLength 255
 */
industry: string;
/**
 * @maxLength 255
 */
description: string;
};
export type SearchAttr = {
id?: string ;
type: string;
name: string;
value: string;
userId: string;
tenantId: string;
};
export type SearchType = "organization" | "people" | "domain";
export type SearchCreateBiz = {
name: string;
type: string;
value: string;
};
export type SearchModifyBiz = {
name?: string ;
type?: string ;
value?: string ;
};
export type SessionAttr = {
id: number;
/**
 * @format uuid
 */
user: string;
/**
 * @format uuid
 */
tenant_id: string;
token: string;
expires: Date;
ip: string;
user_agent: string;
};
export type SpSummaryAggregationType = "AVERAGE";
export type SpSummaryAttr = {
/**
 * @format uuid
 */
id: string;
aggregation_type?: "AVERAGE" | null ;
report_date: Date;
days_sales_out?: number | null ;
days_payable_out?: number | null ;
working_capital?: number | null ;
working_capital_ratio?: number | null ;
created_at: Date;
updated_at: Date;
};
export type TeamAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
tenantId: string;
/**
 * @maxLength 50
 */
name: string;
description?: string | null ;
isActive: boolean;
deletedAt?: Date | null ;
createdAt: Date;
updatedAt: Date;
};
export type TeamCreateBiz = {
/**
 * @maxLength 50
 */
name: string;
description?: string | null ;
isActive?: boolean ;
members: { userId: string; isManager?: boolean | undefined; }[];
};
export type TeamModifyBiz = {
/**
 * @maxLength 50
 */
name?: string ;
description?: string | null ;
isActive?: boolean ;
};
export type TeamMemberAttr = {
/**
 * @format uuid
 */
teamId: string;
/**
 * @format uuid
 */
userId: string;
/**
 * Only one manager is allowed per team
 */
isManager: boolean;
deletedAt?: Date | null ;
createdAt: Date;
updatedAt: Date;
};
export type GetTeamsQuery = { order?: Order[] | undefined; };
export type TeamMemberCreateBiz = {
/**
 * Only one manager is allowed per team
 */
isManager?: boolean ;
};
export type MemberTeamCreateBiz = {
/**
 * Only one manager is allowed per team
 */
isManager?: boolean ;
/**
 * @format uuid
 */
teamId: string;
};
export type TeamMemberUpsertBiz = {
/**
 * @format uuid
 */
userId: string;
/**
 * Only one manager is allowed per team
 */
isManager?: boolean ;
};
export type TenantConfigQuiz = { maxPoints: number; maxAttempts: number; passingScore: number; };
export type TenantConfigAttr = {
tenantId: string;
quiz: { maxPoints: number; maxAttempts: number; passingScore: number; };
};
export type TenantConfigCreateBiz = {
quiz: { maxPoints: number; maxAttempts: number; passingScore: number; };
};
export type TenantConfigModifyBiz = {
quiz: { maxPoints: number; maxAttempts: number; passingScore: number; };
};
export type TenantColor = { name: string; primaryColor: string; secondaryColor: string; };
export type TenantAttrs = { id?: string | undefined; name: string; type: string; domain: string; modules: string; colors: TenantColor; logo: string; icon?: string | null | undefined; use_logo?: boolean | null | undefined; description?: string | null | undefined; settings?: { [K: string]: any; } | null | undefined; };
export type TenantAttr = {
/**
 * @format uuid
 */
id?: string ;
name: string;
type: string;
domain: string;
modules: string;
colors: { name: string; primaryColor: string; secondaryColor: string; };
logo: string;
icon?: string | null ;
use_logo?: boolean | null ;
description?: string | null ;
settings?: { [K: string]: any; } | null ;
created_at: Date;
updated_at: Date;
};
export type TenantQueryBiz = {
search?: string ;
order?: Order ;
includeOwners?: boolean ;
};
export type TenantCreateBiz = {
description?: string | null ;
icon?: string | null ;
use_logo?: boolean | null ;
settings?: { [K: string]: any; } | null ;
name: string;
type: string;
domain: string;
modules: string;
colors: { name: string; primaryColor: string; secondaryColor: string; };
logo: string;
};
export type TenantModifyBiz = {
name?: string ;
type?: string ;
description?: string | null ;
icon?: string | null ;
domain?: string ;
modules?: string ;
colors?: TenantColor ;
logo?: string ;
use_logo?: boolean | null ;
settings?: { [K: string]: any; } | null ;
};
export type TenantDealStageAttrs = { id?: string | undefined; name: string; description?: string | undefined; active?: boolean | undefined; position: number; probability?: number | undefined; pipelineId: string; };
export type TenantDealStageAttr = {
/**
 * @format uuid
 */
id?: string ;
name: string;
description?: string ;
active?: boolean ;
position: number;
probability?: number ;
/**
 * @format uuid
 */
pipelineId: string;
};
export type TenantDealStageCreateBiz = {
name: string;
description?: string ;
position: number;
active?: boolean ;
probability?: number ;
/**
 * @format uuid
 */
pipelineId: string;
};
export type TenantIntegrationType = "FISERV";
export type TenantIntegrationCredential = { url: string; client_id: string; client_secret: string; };
export type TenantIntegrationAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
tenant_id: string;
type: "FISERV";
credentials: { url: string; client_id: string; client_secret: string; };
enabled: boolean;
created_at: Date;
updated_at: Date;
};
export type UserCredentialAttr = {
/**
 * @format uuid
 */
user_id: string;
password?: string ;
tfa_secret?: string ;
};
export type UserCredentialResetPasswordBiz = { password: string; } | { generate: true; };
export type UserCredentialChangePassword = { newPassword: string; currentPassword: string; };
export type UserStatus = "deleted" | "active" | "inactive" | "suspended" | "invited" | "deactivated" | "invite_cancelled";
export type UserAttrs = { id: string; tenant_id: string; roleId?: string | null | undefined; groupId?: string | null | undefined; first_name?: string | null | undefined; last_name?: string | null | undefined; name?: string | null | undefined; email: string; title?: string | null | undefined; avatar?: string | null | undefined; status: string; last_access?: Date | null | undefined; last_page?: string | null | undefined; phone?: string | null | undefined; };
export type UserAttr = {
/**
 * @format uuid
 */
id: string;
/**
 * @format uuid
 */
tenant_id: string;
/**
 * @format uuid
 */
roleId?: string | null ;
/**
 * @format uuid
 */
groupId?: string | null ;
/**
 * @maxLength 255
 */
first_name?: string | null ;
/**
 * @maxLength 255
 */
last_name?: string | null ;
/**
 * @description Virtual result, `${first_name} ${last_name}`
 * @string 
 */
name?: string | null ;
/**
 * @maxLength 255
 */
email: string;
/**
 * @maxLength 255
 */
title?: string | null ;
/**
 * @maxLength 255
 */
avatar?: string | null ;
/**
 * @maxLength 255
 */
status: string;
last_access?: Date | null ;
/**
 * @maxLength 255
 */
last_page?: string | null ;
/**
 * @maxLength 255
 */
phone?: string | null ;
created_at: Date;
updated_at: Date;
};
export type UserCreateBiz = {
/**
 * @maxLength 255
 */
title?: string | null ;
/**
 * @maxLength 255
 */
first_name?: string | null ;
/**
 * @maxLength 255
 */
last_name?: string | null ;
/**
 * @maxLength 255
 */
avatar?: string | null ;
/**
 * @format uuid
 */
roleId?: string | null ;
/**
 * @format uuid
 */
groupId?: string | null ;
/**
 * @maxLength 255
 */
email: string;
last_access?: Date | null ;
/**
 * @maxLength 255
 */
last_page?: string | null ;
/**
 * @maxLength 255
 */
phone?: string | null ;
};
export type UserModifyBiz = {
/**
 * @maxLength 255
 */
title?: string | null ;
/**
 * @maxLength 255
 */
first_name?: string | null ;
/**
 * @maxLength 255
 */
last_name?: string | null ;
/**
 * @maxLength 255
 */
avatar?: string | null ;
/**
 * @format uuid
 */
roleId?: string | null ;
/**
 * @format uuid
 */
groupId?: string | null ;
/**
 * @maxLength 255
 */
email?: string ;
last_access?: Date | null ;
/**
 * @maxLength 255
 */
last_page?: string | null ;
/**
 * @maxLength 255
 */
phone?: string | null ;
};
export type UserQueryBiz = {
search?: string ;
order?: Order ;
status?: "deleted" | "active" | "inactive" | "suspended" | "invited" | "deactivated" | "invite_cancelled" ;
excludeAdmins?: boolean ;
/**
 * @format uuid
 */
roleId?: string | null ;
/**
 * Filters result by self. As users with elevated permissions can query data
 * across a tenant(s) and user(s), there may be situations where a user
 * would like to see data related only about themselves.
 * 
 * This includes data created by them or data assigned to them.
 */
self?: boolean ;
};
export type UserInviteBiz = {
firstName: string;
lastName: string;
email: string;
groupId: string;
roleId: string;
};
export type VideoAttr = {
/**
 * @format uuid
 */
videoId: string;
externalUrl: string | null;
muxUploadId: string | null;
muxUploadUrl: string | null;
/**
 * @format uuid
 */
createdById: string;
/**
 * @format uuid
 */
tenantId: string;
};
export type VideoCreateBiz = {
/**
 * @description Whether video is publicly accessible.
 */
externalUrl?: string ;
};
export type ActivityBizGet = { data: (ActivityAttrs & ModelTimestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type ActivityBizGetOneById = ActivityAttrs & ModelTimestamp;
export type ActivityBizUpdateById = ActivityAttrs & ModelTimestamp;
export type ActivityRequestBizGet = { data: ActivityRequestAttr[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type ActivityRequestBizGetOneById = ActivityRequestAttr;
export type ActivityRequestBizCreate = ActivityRequestAttr;
export type ActivityRequestBizUpdateById = ActivityRequestAttr;
export type AnalyticBizGetAllPublic = ({ id: string; name: string; type: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product"; relatedTypes: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[]; displayType: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat"; icon: string; createdById: string; tenantId: string; isMulti: boolean; dimensions: string[]; limit: number; measures: string[]; order: AnalyticOrder; segments: string[]; timeDimensions: AnalyticTimeDimension; } & { filters: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[]; } & Timestamp)[];
export type AnalyticBizGetOneById = { id: string; name: string; type: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product"; relatedTypes: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[]; displayType: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat"; icon: string; createdById: string; tenantId: string; isMulti: boolean; dimensions: string[]; limit: number; measures: string[]; order: AnalyticOrder; segments: string[]; timeDimensions: AnalyticTimeDimension; } & { filters: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[]; } & Timestamp;
export type AnalyticBizUpdateById = { id: string; name: string; type: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product"; relatedTypes: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[]; displayType: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat"; icon: string; createdById: string; tenantId: string; isMulti: boolean; dimensions: string[]; limit: number; measures: string[]; order: AnalyticOrder; segments: string[]; timeDimensions: AnalyticTimeDimension; } & { filters: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[]; } & Timestamp;
export type ArticleBizGet = { data: ({ id: string; tenant_id?: string | undefined; user_id?: string | undefined; title: string | null; blurb?: string | undefined; author?: string | undefined; body?: string | undefined; published: Date; url: string; image?: string | undefined; source?: string | undefined; } & Timestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type ArticleBizGetOneById = { id: string; tenant_id?: string | undefined; user_id?: string | undefined; title: string | null; blurb?: string | undefined; author?: string | undefined; body?: string | undefined; published: Date; url: string; image?: string | undefined; source?: string | undefined; } & Timestamp;
export type ArticleBizGetOneByURL = undefined;
export type ArticleBizCreate = { id: string; tenant_id?: string | undefined; user_id?: string | undefined; title: string | null; blurb?: string | undefined; author?: string | undefined; body?: string | undefined; published: Date; url: string; image?: string | undefined; source?: string | undefined; } & Timestamp;
export type AuditBizCreate = AuditResource & { auditId: number; actorId: string; actorType: "contact" | "user"; actorDisplayValue: string; action: "create" | "read" | "update" | "delete"; changeLog?: AuditChangeLog | undefined; };
export type AuditNotificationBizGet = { data: (AuditNotificationAttr & { audit: AuditAttr; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type CreateGuestTokenBiz = {
email: string;
redirect_url: string;
};
export type BadgeBizGet = { data: ({ id: string; tenant_id: string; name?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; badge_url?: string | null | undefined; deleted: boolean; } & ModelTimestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type BadgeBizGetOneById = { id: string; tenant_id: string; name?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; badge_url?: string | null | undefined; deleted: boolean; } & ModelTimestamp;
export type BadgeBizCreate = { id: string; tenant_id: string; name?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; badge_url?: string | null | undefined; deleted: boolean; } & ModelTimestamp;
export type BadgeBizUpdateById = { id: string; tenant_id: string; name?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; badge_url?: string | null | undefined; deleted: boolean; } & ModelTimestamp;
export type CategoryBizGet = { data: ({ id: number; tenant_id: string; title?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; logo?: string | null | undefined; icon?: string | null | undefined; position?: number | null | undefined; } & ModelTimestamp & { isPublic: boolean; totalCourses: number; totalLessons: number; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type CategoryBizGetCoursesById = { data: (CourseAttrs & ModelTimestamp & { badge?: BadgeAttr | undefined; category?: CategoryAttr | undefined; preference?: CoursePreferenceAttr[] | undefined; progress?: CourseProgressAttr[] | undefined; quiz?: QuizAttr | undefined; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type CategoryBizGetLessonsById = { data: (LessonAttrs & ModelTimestamp & { category?: CategoryAttr | undefined; preference?: LessonPreferenceAttr[] | undefined; progress?: LessonProgressAttr[] | undefined; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type CategoryBizGetVideosById = { data: VideoAttr[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type CategoryBizGetOneById = { id: number; tenant_id: string; title?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; logo?: string | null | undefined; icon?: string | null | undefined; position?: number | null | undefined; } & ModelTimestamp & { isPublic: boolean; totalCourses: number; totalLessons: number; };
export type CategoryBizCreate = { id: number; tenant_id: string; title?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; logo?: string | null | undefined; icon?: string | null | undefined; position?: number | null | undefined; } & ModelTimestamp;
export type CategoryBizUpdateById = { id: number; tenant_id: string; title?: string | null | undefined; description?: string | null | undefined; status?: string | null | undefined; logo?: string | null | undefined; icon?: string | null | undefined; position?: number | null | undefined; } & ModelTimestamp;
export type ComponentBizGetOneById = { id: string; name: string; enabled: boolean; analyticId?: string | null | undefined; componentTextId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp;
export type ComponentBizCreateComponentWithAssociations = { id: string; name: string; enabled: boolean; analyticId?: string | null | undefined; componentTextId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp;
export type ComponentBizUpdateById = { id: string; name: string; enabled: boolean; analyticId?: string | null | undefined; componentTextId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp;
export type ComponentBizUpdateComponentAnalytic = { id: string; name: string; type: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product"; relatedTypes: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[]; displayType: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat"; icon: string; createdById: string; tenantId: string; isMulti: boolean; dimensions: string[]; limit: number; measures: string[]; order: AnalyticOrder; segments: string[]; timeDimensions: AnalyticTimeDimension; } & { filters: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[]; } & Timestamp;
export type ContactBizGetAllByEmail = (ContactAttr & { organization: OrganizationAttr; })[];
export type ContactBizGetOneById = ContactAttr;
export type ContactBizBulkImport = { totalItems: number; itemsFailed: { first_name?: string | undefined; last_name?: string | undefined; email_work?: string | undefined; assigned_user_id?: string | undefined; modified_user_id?: string | undefined; created_by?: string | undefined; organization_id?: string | null | undefined; tenant_id?: string | undefined; title?: string | undefined; email_other?: string | undefined; phone_home?: string | undefined; phone_mobile?: string | undefined; phone_work?: string | undefined; phone_other?: string | undefined; external_id?: string | undefined; }[]; contacts: ContactAttr[]; };
export type CourseBizGetLessonProgressById = (LessonProgressAttrs & ModelTimestamp)[];
export type CourseBizGet = { data: (CourseAttrs & ModelTimestamp & { totalLessons: number; } & { badge?: BadgeAttr | undefined; category?: CategoryAttr | undefined; preference?: CoursePreferenceAttr[] | undefined; progress?: CourseProgressAttr[] | undefined; quiz?: QuizAttr | undefined; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type CourseBizGetOneById = CourseAttrs & ModelTimestamp & T & { contents: CourseContentAttr[]; };
export type CourseBizCreate = CourseAttrs & ModelTimestamp;
export type CourseContentBizGetByCourseId = { data: ({ courseContentId: string; courseId: string; quizId?: string | null | undefined; order: number; tenantId: string; } & Timestamp & { quiz?: ({ quizId: string; maxAttempts?: number | null | undefined; } & Timestamp & { questions: QuizQuestionAttr[]; }) | undefined; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type CourseContentBizCreateByCourseId = { courseContentId: string; courseId: string; quizId?: string | null | undefined; order: number; tenantId: string; } & Timestamp;
export type CourseProgressBizGetOneByCourseId = CourseProgressAttrs & ModelTimestamp;
export type DashboardBizGet = { data: ({ id: string; name: string; type: "dashboard" | "insight"; enabled: boolean; organizationId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type DashboardBizGetComponentsById = { data: ({ dashboardId: string; componentId: string; } & Timestamp & { component: { id: string; name: string; enabled: boolean; analyticId?: string | null | undefined; componentTextId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp & { analytic: AnalyticAttr; }; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type DashboardBizGetOneById = { id: string; name: string; type: "dashboard" | "insight"; enabled: boolean; organizationId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp;
export type DashboardBizCreate = { id: string; name: string; type: "dashboard" | "insight"; enabled: boolean; organizationId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp;
export type DashboardBizCreateDefault = ({ id: string; name: string; type: "dashboard" | "insight"; enabled: boolean; organizationId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp)[];
export type DashboardBizCreateDefaultDashboards = ({ id: string; name: string; type: "dashboard" | "insight"; enabled: boolean; organizationId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp)[];
export type DashboardBizCreateDefaultInsights = ({ id: string; name: string; type: "dashboard" | "insight"; enabled: boolean; organizationId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp)[];
export type DashboardBizUpdateById = { id: string; name: string; type: "dashboard" | "insight"; enabled: boolean; organizationId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp;
export type DashboardBizUpdateComponent = { component: { id: string; name: string; enabled: boolean; analyticId?: string | null | undefined; componentTextId?: string | null | undefined; createdById: string; tenantId: string; } & Timestamp; } | { component?: undefined; };
export type DashboardBizUpdateComponentAnalytic = { id: string; name: string; type: "AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product"; relatedTypes: ("AssignedUser" | "CreatedBy" | "Contact" | "Course" | "CourseProgress" | "Deal" | "Lesson" | "LessonProgress" | "Organization" | "Category" | "DealStage" | "Tenant" | "TenantDealStage" | "User" | "Training" | "Activities" | "Notes" | "Product")[]; displayType: "kpi_standard" | "kpi_scorecard" | "kpi_growth_index" | "kpi_rankings" | "kpi_basic" | "chart_column" | "chart_donut" | "chart_pie" | "chart_bar" | "chart_line" | "chart_table" | "chart_funnel" | "chart_area" | "chart_heat"; icon: string; createdById: string; tenantId: string; isMulti: boolean; dimensions: string[]; limit: number; measures: string[]; order: AnalyticOrder; segments: string[]; timeDimensions: AnalyticTimeDimension; } & { filters: ({ member: string; operator: "set"; } | { member: string; operator: "notSet"; } | { member: string; operator: "equals"; values: string[]; } | { member: string; operator: "notEquals"; values: string[]; } | { member: string; operator: "contains"; values: string[]; } | { member: string; operator: "notContains"; values: string[]; } | { member: string; operator: "startsWith"; values: string[]; } | { member: string; operator: "endsWith"; values: string[]; } | { member: string; operator: "gt"; values: string[]; } | { member: string; operator: "gte"; values: string[]; } | { member: string; operator: "lt"; values: string[]; } | { member: string; operator: "lte"; values: string[]; } | { member: string; operator: "beforeDate"; values: string[]; } | { member: string; operator: "afterDate"; values: string[]; })[]; } & Timestamp;
export type DealBizGetAllAsStageSummary = { tenant_deal_stage_id: string | undefined; total_amount: number; total_count: number; }[];
export type DealBizGetOneById = DealAttr;
export type DealProductBizGetProductsByDealId = { data: DealProductAttr[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type FieldBizCreateDefault = FieldAttr[];
export type FieldBizGet = { data: FieldAttr[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type FieldBizCreate = FieldAttr;
export type FieldBizGetOneById = FieldAttr;
export type FieldBizUpdateById = FieldAttr;
export type GroupBizGetFullHierarchy = { children: GroupNode[]; id: string; parent_id?: string | null | undefined; name: string; has_sibling_access: boolean; description?: string | null | undefined; tenant_id: string; deleted_on?: Date | null | undefined; created_at: Date; updated_at: Date; };
export type GroupBizGetAllByParentId = (GroupAttrs & ModelTimestamp)[];
export type GroupBizGet = { data: (GroupAttrs & ModelTimestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type GroupBizGetOneById = GroupAttrs & ModelTimestamp;
export type GroupBizGetRootGroup = GroupAttrs & ModelTimestamp;
export type GroupBizCreate = GroupAttrs & ModelTimestamp;
export type GroupBizUpdateById = GroupAttrs & ModelTimestamp;
export type GroupBizCreateDefaultGroup = GroupAttrs & ModelTimestamp;
export type InsightBizOpt = { Upload: {}; Code: {} | undefined; };
export type InsightRpmgBizGetOneByCode = (RpmgVerticalAttr & { naics: NaicsAttr; summary: RpmgSummaryAttr; transaction_summary: (RpmgTransactionAttr & { transaction: RpmgTransactionAttr; })[]; }) | (RpmgVerticalAttr & { naics: null; summary: RpmgSummaryAttr; transaction_summary: (RpmgTransactionAttr & { transaction: RpmgTransactionAttr; })[]; });
export type InsightSpBizGetOneByCode = { id: string; aggregation_type?: "AVERAGE" | null | undefined; report_date: Date; days_sales_out?: number | null | undefined; days_payable_out?: number | null | undefined; working_capital?: number | null | undefined; working_capital_ratio?: number | null | undefined; } & ModelTimestamp;
export type LabelBizGetAllByType = ({ id: string; name: string; color: string; type?: "contact" | "organization" | null | undefined; assigned_user_id?: string | null | undefined; tenant_id: string; } & ModelTimestamp)[];
export type LabelBizGetOneById = { id: string; name: string; color: string; type?: "contact" | "organization" | null | undefined; assigned_user_id?: string | null | undefined; tenant_id: string; } & ModelTimestamp;
export type LabelBizCreate = { id: string; name: string; color: string; type?: "contact" | "organization" | null | undefined; assigned_user_id?: string | null | undefined; tenant_id: string; } & ModelTimestamp;
export type LessonBizGetRandomLessonsWithUniqueCategoryId = (LessonAttrs & ModelTimestamp)[];
export type LessonBizGet = { data: (LessonAttrs & ModelTimestamp & { category?: CategoryAttr | undefined; preference?: LessonPreferenceAttr[] | undefined; progress?: LessonProgressAttr[] | undefined; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type LessonBizGetOneById = LessonAttrs & ModelTimestamp & { pages: (LessonPageAttrs & ModelTimestamp & { video?: VideoAttr | undefined; })[]; category: CategoryAttr; };
export type LessonBizCreate = LessonAttrs & ModelTimestamp;
export type LessonBizUpdateById = LessonAttrs & ModelTimestamp;
export type LessonPageBizGetAllById = (LessonPageAttrs & ModelTimestamp)[];
export type LessonProgressBizGetLatestByLessonIds = (LessonProgressAttrs & ModelTimestamp)[];
export type LessonProgressBizGetOneByLessonId = LessonProgressAttrs & ModelTimestamp;
export type NaicsBizGet = { data: ({ code: string; title: string; } & ModelTimestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type NaicsBizGetByCode = { code: string; title: string; } & ModelTimestamp;
export type NotificationSendee = { tenant_id: string; to?: string | undefined; bcc?: string[] | undefined; } & Pick<Mail.Options, "attachments" | "subject">;
export type NotificationTemplate = { ACTIVITY_REQUEST_CREATED: {    payload: {        activityRequest: ActivityRequestAttr;        organization: OrganizationAttr;    };}; COMMENT_CREATED: {    payload: {        resource: {            url: string;        };        firstName?: string | null;        lastName?: string | null;        comment: string;        date: string;    };}; CONTACT_INVITED: {    payload: {        organizations: {            name: string;            token: string;            url: string;        }[];    };}; DEAL_UPDATED: { payload: { name?: string | null | undefined; updates: { [x: string]: { from: any; to: any; }; }; url: string; }; }; FOLLOWER_ADDED: {    payload: {        resource: {            name?: string;            type: 'organization';            url: string;        };        primaryOwner: {            name: string;        };    };}; OWNER_ADDED: {    payload: {        resource: {            type: 'organization' | 'deal' | 'contact';            name?: string | null;            url: string;        };    };}; PASSWORD_CHANGED: {    payload: {        password: string;    };}; PASSWORD_RESET: {    payload: {        email: string;    };}; PASSWORD_RESET_REQUESTED: {    payload: {        url: string;        resetUrl: string;        email: string;    };}; REMINDER_CREATED: {    payload: {        firstName?: string | null;        activities: any[];    };}; REPORT_REQUESTED: {    payload: {        messageLine: string;    };}; TFA_CODE_REQUESTED: {    payload: {        code: string;    };}; USER_INVITED: {    payload: {        url: string;        email: string;    };}; USER_MENTIONED: {    payload: {        firstName?: string | null;        lastName?: string | null;        comment: string;        date: string;        resource: {            url: string;        };    };}; };
export type NotificationTemplateName = keyof NotificationTemplate;
export type NotificationBizGetTheme = { projectName: string | undefined; projectUrl: string; projectLogo: string; projectColor: string | undefined; };
export type OrganizationBizGetOneById = OrganizationAttr;
export type OrganizationBizGetInsights = { sp: { id: string; aggregation_type?: "AVERAGE" | null | undefined; report_date: Date; days_sales_out?: number | null | undefined; days_payable_out?: number | null | undefined; working_capital?: number | null | undefined; working_capital_ratio?: number | null | undefined; } & ModelTimestamp; rpmg: (RpmgVerticalAttr & { naics: NaicsAttr; summary: RpmgSummaryAttr; transaction_summary: (RpmgTransactionAttr & { transaction: RpmgTransactionAttr; })[]; }) | (RpmgVerticalAttr & { naics: null; summary: RpmgSummaryAttr; transaction_summary: (RpmgTransactionAttr & { transaction: RpmgTransactionAttr; })[]; }); };
export type OwnerBizGetAllByResourceId = ContactOwnerAttr[] | DealOwnerAttr[] | OrganizationOwnerAttr[];
export type OwnerBizGetByParent = { data: { user_id: string; total_owned: number; user: UserAttr; }[]; };
export type PermissionBizGetAllByRoleId = PermissionAttr[];
export type PipelineBizGet = { data: PipelineAttr[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type PipelineBizGetOneById = PipelineAttr;
export type PipelineBizCreate = PipelineAttr;
export type PipelineBizUpdateById = PipelineAttr;
export type PipelineTeamBizCreate = PipelineTeamAttr[];
export type PipelineTeamBizGetOneById = PipelineTeamAttr;
export type PipelineTeamBizGetOneByCompositeIds = PipelineTeamAttr;
export type PipelineTeamBizGetAllById = ({ id: string; tenantId: string; name: string; description?: string | null | undefined; isActive: boolean; deletedAt?: Date | null | undefined; } & Timestamp)[];
export type QuizBizFindOneById = { quizId: string; maxAttempts?: number | null | undefined; } & Timestamp & { questions: QuizQuestionAttr[]; };
export type QuizQuestionBizFindAllByQuizId = ({ quizQuestionId: string; quizId: string; title?: string | undefined; type: "multipleChoice"; choices: QuizQuestionChoice[]; order: number; } & Timestamp)[];
export type QuizQuestionBizUpdateById = ({ quizQuestionId: string; quizId: string; title?: string | undefined; type: "multipleChoice"; choices: QuizQuestionChoice[]; order: number; } & Timestamp) | undefined;
export type ReportBizGetOneById = ReportAttrs & ModelTimestamp;
export type ReportExtension = "pdf" | "html";
export type ReportGeneratorBizGetLocalPath = string;
export type ReportGeneratorBizGetLocalPDFPath = string;
export type ReportGeneratorBizGetLocalHTMLPath = string;
export type ReportGeneratorBizGetReportTitle = string;
export type RoleBizGet = { data: RoleAttr[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type RoleBizGetOneById = RoleAttr;
export type RoleBizCreate = RoleAttr;
export type RoleBizUpdateById = RoleAttr;
export type RoleBizCreateDefaultRole = RoleAttr[];
export type SearchBizGet = SearchAttr[];
export type SearchBizCreate = SearchAttr;
export type SearchBizUpdateById = SearchAttr;
export type SearchBizGetOneById = SearchAttr;
export type TeamBizGet = { data: ({ id: string; tenantId: string; name: string; description?: string | null | undefined; isActive: boolean; deletedAt?: Date | null | undefined; } & Timestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type TeamBizGetOneById = { id: string; tenantId: string; name: string; description?: string | null | undefined; isActive: boolean; deletedAt?: Date | null | undefined; } & Timestamp;
export type TeamBizCreate = { members: ({ teamId: string; userId: string; isManager: boolean; deletedAt?: Date | null | undefined; } & Timestamp)[]; id: string; tenantId: string; name: string; description?: string | null | undefined; isActive: boolean; deletedAt?: Date | null | undefined; createdAt: Date; updatedAt: Date; };
export type TeamBizUpdateById = { id: string; tenantId: string; name: string; description?: string | null | undefined; isActive: boolean; deletedAt?: Date | null | undefined; } & Timestamp;
export type TeamMemberBizGetByTeamId = { data: ({ teamId: string; userId: string; isManager: boolean; deletedAt?: Date | null | undefined; } & Timestamp & { user: UserAttr; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type TeamMemberBizGetByUserId = ({ teamId: string; userId: string; isManager: boolean; deletedAt?: Date | null | undefined; } & Timestamp & { team: TeamAttr; })[];
export type TeamMemberBizCreateByCompositeIds = { teamId: string; userId: string; isManager: boolean; deletedAt?: Date | null | undefined; } & Timestamp;
export type TenantBizGet = { data: (TenantAttrs & ModelTimestamp & { users?: UserAttr[] | undefined; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type TenantBizGetOneById = TenantAttrs & ModelTimestamp;
export type TenantBizUpdateById = TenantAttrs & ModelTimestamp;
export type TenantBizCreateTenant = TenantAttrs & ModelTimestamp;
export type TenantConfigBizGetOneByTenantId = TenantConfigAttr;
export type TenantDealStageBizGetAllByPipelineId = TenantDealStageAttrs[];
export type TenantDealStageBizGetOneById = TenantDealStageAttrs;
export type TenantIntegrationCreateBizAttr = {
enabled: boolean;
credentials: { client_id: string; client_secret: string; };
};
export type TenantIntegrationBizGet = { data: ({ id: string; tenant_id: string; type: "FISERV"; credentials: TenantIntegrationCredential; enabled: boolean; } & ModelTimestamp)[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type TenantIntegrationBizGetOneByType = ({ id: string; tenant_id: string; type: "FISERV"; credentials: TenantIntegrationCredential; enabled: boolean; } & ModelTimestamp) | undefined;
export type TenantIntegrationBizCreate = { id: string; tenant_id: string; type: "FISERV"; credentials: TenantIntegrationCredential; enabled: boolean; } & ModelTimestamp;
export type TenantIntegrationBizUpdateByType = ({ id: string; tenant_id: string; type: "FISERV"; credentials: TenantIntegrationCredential; enabled: boolean; } & ModelTimestamp) | undefined;
export type TenantIntegrationBizDeleteByType = number;
export type UserBizGetAllByGroupId = (UserAttrs & ModelTimestamp)[];
export type UserBizGet = { data: (UserAttrs & ModelTimestamp & { tenant: TenantAttr; role?: RoleAttr | undefined; group?: GroupAttr | undefined; })[]; pagination: { limit: number; page: number; totalPages: number; count: number; }; };
export type UserBizGetOneById = UserAttrs & ModelTimestamp & { role: RoleAttr; group: GroupAttr; };
export type UserBizGetOneAuthorizationById = Pick<UserAttrs & ModelTimestamp & { group?: GroupAttr | undefined; role?: RoleAttr | undefined; }, "id" | "role" | "roleId" | "groupId" | "group">;
export type UserBizUpdateById = UserAttrs & ModelTimestamp;
export type UserCredentialBizGetOneById = UserCredentialAttr;
export type VideoBizCreate = any;
export type RootGroup = GroupAttrs & ModelTimestamp;
export type GroupNode = GroupAttrs & ModelTimestamp & { children: GroupNode[]; };
export type Includeable = {};
export type T = {};
/**
 * Older models which used underscored: true
 */
export type ModelTimestamp = { created_at: Date; updated_at: Date; };
export type Timestamp = { createdAt: Date; updatedAt: Date; };
/**
 * Allows ordering by a column in ascending or descending order.
* And will also allow ordering by nulls first or last if needed.
 */
export type Order = [string, "asc" | "desc" | "asc nulls first" | "asc nulls last" | "desc nulls first" | "desc nulls last"];
/**
 * Value provided is used to perform an ILIKE search on fields such as:
* * title
* * description
* * name
* 
* Dependent on the resource being queried.
 */
export type Search = string;
export type AssociationRestriction = "include" | "required";
/**
 * Whether favorites should be included, excluded, or required in the response.
* * include - favorites will be included in the response
* * exclude - favorites will be excluded from the response
* * required - favorites will be required in the response
* If self=true, favorites will be limited to the current user.
* Else, favorites will include all users who have favorited the course.
 */
export type Favorites = "include" | "required";
/**
 * Whether progress should be included in the response.
* If self=true, progress will be limited to the current user.
* Else, progress will all course attempts.
 */
export type Progress = "include" | "required";
export type Self = {
/**
 * Filters result by self. As users with elevated permissions can query data
 * across a tenant(s) and user(s), there may be situations where a user
 * would like to see data related only about themselves.
 * 
 * This includes data created by them or data assigned to them.
 */
self?: boolean ;
};
export type CreatedBySelf = { createdBySelf?: boolean | undefined; };
export type Pagination = {
/**
 * Curent pagination limit
 * @minimum 0
 * @maximum 1000
 */
limit: number;
/**
 * Current pagination page
 * @minimum 1
 */
page: number;
};
export type PaginationResponse = {
/**
 * Curent pagination limit
 * @minimum 0
 * @maximum 1000
 */
limit: number;
/**
 * Current pagination page
 * @minimum 1
 */
page: number;
/**
 * Total pagination pages
 * @minimum 0
 */
totalPages: number;
/**
 * Total pagination size
 * @minimum 0
 */
count: number;
};
export type Resources = "contact" | "deal" | "organization";
export type ResourceKeys = "organization_id" | "deal_id" | "contact_id";
export type ContextFields = { tenantId?: string | undefined; userId?: string | undefined; ownedIds?: string[] | undefined; organizationId?: string | undefined; contactId?: string | undefined; accessibleUserIds?: string[] | undefined; };
export type MerchantOutput = {
type: "MERCHANT";
name: string;
requestDate: string;
totalTransactions: number;
totalFees: number;
averageFee: number;
totalDollarsProcessed: number;
averageTransaction: number;
effectiveRate: number;
authorizationAttempts: number;
authorizationApprovals: number;
authorizationToApprovalRate: number;
refundAmount: number;
salesAmount: number;
refundPercentage: number;
chargeBackCount: number;
chargeBackPercentage: number;
interchangeFees: number;
serviceFees: number;
processorFees: number;
feesPercentageNotControlledByBank: number;
networks: { type: 'MASTERCARD' | 'VISA' | 'AMEX' | 'MISCELLANEOUS'; dollarsProcessed: number; interchangeFees: number; networkCharges: number; feePercentage: number; }[];
};
export type TreasuryOutput = {
type: "TREASURY";
client_name: string;
proposed_bank_name: string;
annual_services_savings: number;
annual_estimated_savings: number;
services: (ReportTreasuryService & { annual_savings: number; })[];
};
export type ReportOutput = {
type: "TREASURY" | "MERCHANT";
};
export type PlaybackIdPolicy = "public" | "signed";
export type AssetMp4Support = "none" | "standard";
export type AssetMasterAccess = "none" | "temporary";
export type TrackStatus = "preparing" | "ready" | "errored";
export type LatencyMode = "standard" | "low" | "reduced";
export type RecordingTimesType = "content" | "slate";
export type Track = VideoTrack | AudioTrack | TextTrack;
export type SpaceStatus = "active" | "idle";
export type BroadcastStatus = "active" | "idle";
export type BroadcastLayout = "gallery" | "active-speaker";
export type BroadcastResolution = "1920x1080" | "1280x720" | "1080x1920" | "720x1280" | "1080x1080" | "720x720";
export type RecordingTimes = {
started_at: string;
duration: number;
type?: RecordingTimesType ;
};
export type SigningKey = {
id: string;
created_at: string;
private_key?: string ;
};
export type Identifier = {
type: "asset" | "live_stream";
id: string;
};
export type PlaybackIdentifier = {
policy: "public" | "signed";
object: Identifier;
id: string;
};
export type PlaybackId = {
id: string;
policy: "public" | "signed";
};
export type AudioTrack = {
id: string;
passthrough: string;
status: "preparing" | "ready" | "errored";
type: "audio";
duration: number;
max_channels: number;
max_channel_layout: string;
};
export type TextTrack = {
id: string;
passthrough: string;
status: "preparing" | "ready" | "errored";
type: "text";
text_type: "subtitles";
language_code: string;
closed_captions: boolean;
name: string;
};
export type VideoTrack = {
id: string;
passthrough: string;
status: "preparing" | "ready" | "errored";
type: "video";
duration: number;
max_width: number;
max_height: number;
max_frame_rate: number;
};
export type InputOverlaySettings = {
vertical_align?: "top" | "bottom" | "middle" ;
vertical_margin?: string ;
horizontal_align?: "left" | "right" | "center" ;
horizontal_margin?: string ;
width?: string ;
height?: string ;
opacity?: string ;
};
export type InputSettings = {
url: string;
start_time?: number ;
end_time?: number ;
overlay_settings?: InputOverlaySettings ;
type?: "text" | "video" | "audio" ;
text_type?: "subtitles" ;
language_code?: string ;
name?: string ;
closed_captions?: boolean ;
passthrough?: string ;
};
export type CreateAssetParams = {
input: string | InputSettings[];
playback_policy?: PlaybackIdPolicy | PlaybackIdPolicy[] ;
passthrough?: string ;
mp4_support?: AssetMp4Support ;
normalize_audio?: boolean ;
test?: boolean ;
master_access?: AssetMasterAccess ;
per_title_encode?: boolean ;
};
export type UpdateAssetParams = {
passthrough?: string ;
};
export type StaticRendition = {
name: "low.mp4" | "medium.mp4" | "high.mp4";
ext: "mp4";
height: number;
width: number;
bitrate: number;
filesize: number;
};
export type StaticRenditions = {
status: "preparing" | "ready" | "errored";
files: StaticRendition[];
};
export type NonStandardInputReasons = {
video_codec?: string ;
audio_codec?: string ;
video_gop_size?: string ;
video_frame_rate?: string ;
video_resolution?: string ;
video_bitrate?: string ;
pixel_aspect_ratio?: string ;
video_edit_list?: string ;
audio_edit_list?: string ;
unexpected_media_file_parameters?: string ;
};
export type AssetMaster = {
status: "preparing" | "ready" | "errored";
url: string;
};
export type AssetError = {
type: string;
messages: string[];
};
export type Asset = {
id: string;
created_at: string;
status: "preparing" | "ready" | "errored";
duration?: number ;
max_stored_resolution?: "Audio only" | "SD" | "HD" | "FHD" | "UHD" ;
max_stored_frame_rate?: number ;
aspect_ratio?: string ;
per_title_encode?: boolean ;
is_live?: boolean ;
source_asset_id?: string ;
playback_ids?: PlaybackId[] ;
tracks?: Track[] ;
mp4_support: "none" | "standard";
static_renditions?: StaticRenditions ;
master_access: "none" | "temporary";
master?: AssetMaster ;
passthrough?: string ;
errors?: AssetError ;
upload_id?: string ;
live_stream_id?: string ;
normalize_audio?: boolean ;
recording_times?: RecordingTimes[] ;
non_standard_input_reasons?: NonStandardInputReasons ;
test: boolean;
};
export type InputTrack = {
type?: string ;
duration?: number ;
encoding?: string ;
width?: number ;
height?: number ;
frame_rate?: number ;
sample_rate?: number ;
sample_size?: number ;
channels?: number ;
};
export type InputFile = {
container_format?: string ;
tracks?: InputTrack[] ;
};
export type InputInfo = {
settings: InputOverlaySettings;
file: InputFile;
};
export type ListAssetParams = {
limit?: number ;
page?: number ;
live_stream_id?: string ;
upload_id?: string ;
};
export type CreatePlaybackIdParams = {
policy: "public" | "signed";
};
export type CreateTrackParams = {
url: string;
type: "text";
text_type: "subtitles";
language_code: string;
name?: string ;
closed_captions?: boolean ;
passthrough?: string ;
};
export type UpdateMp4SupportParams = {
mp4_support: "none" | "standard";
};
export type UpdateMasterAccessParams = {
master_access: "none" | "temporary";
};
export type ListDeliveryUsageParams = {
limit?: number ;
page?: number ;
asset_id?: string ;
timeframe: number[];
};
export type DeliveryReport = {
live_stream_id?: string ;
asset_id: string;
passthrough?: string ;
created_at: string;
asset_state: string;
asset_duration: number;
delivered_seconds: number;
};
export type SimulcastTargetParams = {
url: string;
stream_key?: string ;
passthrough?: string ;
};
export type SimulcastTarget = {
id?: string ;
passthrough?: string ;
status: "errored" | "idle" | "starting" | "broadcasting";
stream_key?: string ;
url: string;
};
export type LiveStreamGeneratedSubtitleSettings = {
name: string;
passthrough?: string ;
language_code?: string ;
transcription_vocabulary_ids?: string[] ;
};
export type LiveStream = {
id?: string ;
created_at?: string ;
stream_key?: string ;
active_asset_id?: string ;
recent_asset_ids?: string[] ;
status?: string ;
playback_ids?: PlaybackId[] ;
new_asset_settings?: Asset ;
passthrough?: string ;
reconnect_window?: number ;
reduced_latency?: boolean ;
latency_mode?: LatencyMode ;
simulcast_targets?: SimulcastTarget[] ;
test?: boolean ;
generated_subtitles?: LiveStreamGeneratedSubtitleSettings[] ;
use_slate_for_standard_latency?: boolean ;
reconnect_slate_url?: string ;
};
export type LiveStreamEmbeddedSubtitleSettings = {
name: string;
passthrough?: string ;
language_code?: string ;
language_channel?: "cc1" ;
};
export type UpdateLiveStreamEmbeddedSubtitlesParams = {
embedded_subtitles: LiveStreamEmbeddedSubtitleSettings[];
};
export type UpdateLiveStreamGeneratedSubtitlesParams = {
generated_subtitles: LiveStreamGeneratedSubtitleSettings[];
};
export type CreateLiveStreamParams = {
reconnect_window?: number ;
playback_policy?: PlaybackIdPolicy | PlaybackIdPolicy[] ;
new_asset_settings?: Partial<CreateAssetParams> ;
passthrough?: string ;
reduced_latency?: boolean ;
latency_mode?: LatencyMode ;
simulcast_targets?: SimulcastTargetParams[] ;
test?: boolean ;
audio_only?: boolean ;
max_continuous_duration?: number ;
embedded_subtitles?: LiveStreamEmbeddedSubtitleSettings[] ;
use_slate_for_standard_latency?: boolean ;
reconnect_slate_url?: string ;
};
export type UpdateLiveStreamParams = {
passthrough?: string ;
latency_mode?: LatencyMode ;
reconnect_window?: number ;
max_continuous_duration?: number ;
use_slate_for_standard_latency?: boolean ;
reconnect_slate_url?: string ;
};
export type ListLiveStreamParams = {
limit?: number ;
page?: number ;
live_stream_id?: string ;
stream_key?: string ;
status?: string ;
upload_id?: string ;
};
export type Upload = {
id: string;
timeout: number;
status: "errored" | "waiting" | "asset_created" | "cancelled" | "timed_out";
new_asset_settings: CreateAssetParams;
asset_id?: string ;
error?: { type?: string ; message?: string | undefined; } | undefined;
cors_origin?: string ;
url: string;
test?: boolean ;
};
export type CreateUploadParams = {
timeout?: string ;
cors_origin?: string ;
new_asset_settings?: Partial<CreateAssetParams> ;
test?: boolean ;
};
export type ListUploadParams = {
limit?: number ;
page?: number ;
upload_id?: string ;
};
export type GetAssetPlaybackIdResponse = {
data: PlaybackId;
};
export type GetLiveStreamPlaybackIdResponse = {
data: PlaybackId;
};
export type ReferrerDomainRestriction = {
allowed_domains?: string[] ;
allow_no_referrer?: boolean ;
};
export type CreatePlaybackRestrictionParams = {
referrer?: ReferrerDomainRestriction ;
};
export type PlaybackRestriction = {
id: string;
created_at: string;
updated_at?: string ;
referrer?: ReferrerDomainRestriction ;
};
export type PlaybackRestrictionResponse = {
data: PlaybackRestriction;
};
export type ListPlaybackRestrictionsResponse = {
data: PlaybackRestriction[];
};
export type Broadcast = {
id: string;
live_stream_id: string;
status: "active" | "idle";
layout: "gallery" | "active-speaker";
resolution: "1920x1080" | "1280x720" | "1080x1920" | "720x1280" | "1080x1080" | "720x720";
passthrough?: string ;
background?: string ;
};
export type Space = {
id: string;
created_at: string;
type: "server";
status: "active" | "idle";
passthrough?: string ;
broadcasts?: Broadcast[] ;
};
export type CreateBroadcastRequest = {
live_stream_id: string;
passthrough?: string ;
layout?: BroadcastLayout ;
resolution?: BroadcastResolution ;
};
export type CreateSpaceRequest = {
type?: "server" ;
passthrough?: string ;
broadcasts?: CreateBroadcastRequest[] ;
};
export type SpaceResponse = {
data: Space;
};
export type BroadcastResponse = {
data: Broadcast;
};
export type ListSpacesRequest = {
limit?: number ;
page?: number ;
};
export type ListSpacesResponse = {
data: Space[];
};
export type StartSpaceBroadcastResponse = {
data: {};
};
export type StopSpaceBroadcastResponse = {
data: {};
};
export type TranscriptionVocabulary = {
id: string;
name: string;
phrases: string[];
created_at: string;
updated_at?: string ;
};
export type UpsertTranscriptionVocabularyParams = {
name: string;
phrases: string[];
passthrough?: string ;
};
export type ListTranscriptionVocabulariesResponse = {
data: TranscriptionVocabulary[];
};
export type TranscriptionVocabularyResponse = {
data: TranscriptionVocabulary;
};
