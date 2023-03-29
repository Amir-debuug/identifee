import { sequelize } from '../database';
import { AuthUser } from 'lib/middlewares/auth';
import { ContextMiddleware } from 'lib/middlewares/context';
import { PermissionAttr } from 'lib/middlewares/sequelize';
import { Permission, permissions } from 'lib/middlewares/sequelize';

export type SearchResult = {
  kind: string;
  type: string;
  deal_id: string; // UUID
  deal_name: string;
  organization_id: string; // UUID
  organization_name: string;
  contact_id: string; // UUID
  contact_name: string;
  activity_id: string; // UUID
  activity_name: string;
  file_id: string; // UUID
  file_name: string;
  category_id: string;
  category_name: string;
  course_id: string;
  course_name: string;
  lessson_id: string; // integer
  lesson_name: string;
};

export default class GlobalSearchService {
  static async search(req: ContextMiddleware, user: AuthUser, query: string) {
    const tenant = user.tenant;
    const userId = user.id;
    const { isAdmin, isOwner } = user.auth;

    //Declaring action to check user role and permission allowed or not
    let isAllowAction = {
      deals: true,
      accounts: true,
      contacts: true,
      categories: true,
      courses: true,
      lessons: true,
    };

    //Declaring need to insert union clause or not, as we will be skipping query portions according to role and permissions
    let returnInsertUnion = {
      organizations: true,
      contacts: true,
      activity: true,
      file: true,
      categories: true,
      courses: true,
      lessons: true,
    };

    const rolePermissions = await req.services.biz.permission.getAllByRoleId(
      undefined,
      user.auth.roleIds[0]
    );

    //Only get permissioins allowed if user is not admin(Super admin) or Owner (Have access to everything related to his tenant)
    if (!isAdmin && !isOwner) {
      isAllowAction = checkIsAllowed(rolePermissions);
    }
    //Only get union clause check allowed if user is not admin(Super admin) or Owner (Have access to everything related to his tenant)
    if (!isAdmin && !isOwner) {
      returnInsertUnion = isInsertUnion(isAllowAction);
    }

    const tables = {
      deal: {
        delete: ' and not d.deleted',
      },
      organization: {
        delete: ' and not o.deleted',
      },
      contact: {
        delete: ' and not c.deleted',
      },
      activity: {
        delete: ' and a.deleted_on IS NULL',
      },
    };

    let mergQuery = ''; //Will add queries according to user role and permission in this variable
    /*** Add checks for deals according to user role and permission  */
    if (isAllowAction.deals) {
      // If user have access to deals than execute this portion
      const dealTenantCheck =
        !isAdmin && !isOwner // if user is admin skip all conditions , if owner include only tenant check and if normal user get deals relevant to user or he owned.
          ? 'where (deal_o.user_id = :user_id or d.assigned_user_id= :user_id) and d.tenant_id = :tenant_id'
          : isOwner
          ? 'where d.tenant_id = :tenant_id'
          : 'where 1=1'; // this is just a dummy clause to join delete

      const dealQuery = `
        select /* Deals Search **************************************/
          'deal' as kind,
          greatest(similarity(d.name, :search_term)) as score,
          d.id as deal_id,
          d.name as deal_name,
          o.id as organization_id,
          o.name as organization_name,
          c.id as contact_id,
          concat(c.first_name, ' ', c.last_name) as contact_name,
          null::uuid as activity_id,
          null as activity_name,
          null as type,
          null::uuid as file_id,
          null as file_name,
          null::integer as lesson_id,
          null as lesson_name,
          null::integer as category_id,
          null as category_name,
          null::uuid as course_id,
          null as course_name
        from deals d
        left join organizations o
          on o.id = d.contact_organization_id ${tables.organization.delete}
        left join contacts c
          on c.id = d.contact_person_id ${tables.contact.delete}
        left join users u
          on u.id = d.created_by
        left join deal_owners deal_o
          on deal_o.deal_id = d.id
        ${dealTenantCheck + tables.deal.delete}
      `;
      mergQuery = mergQuery + dealQuery;
    }

    if (isAllowAction.accounts) {
      const isUnion =
        isAllowAction.deals && returnInsertUnion.organizations ? ' union ' : ''; // Add union, checking is previose portion of query added
      const roleCheck =
        !isAdmin && !isOwner // if user is admin skip all conditions , if owner include only tenant check and if normal user get organizations relevant to user or he owned.
          ? 'where (oo.user_id = :user_id or o.assigned_user_id= :user_id) and o.tenant_id = :tenant_id'
          : isOwner
          ? 'where o.tenant_id = :tenant_id'
          : 'where 1=1'; // this is just a dummy clause to join delete

      const orgQuery = `${isUnion}
        select
          'organization' as kind,
          greatest(similarity(o.name, :search_term)) as score,
          null::uuid  as deal_id,
          null as deal_name,
          o.id as organization_id,
          o.name as organization_name,
          null::uuid  as contact_id,
          null as contact_name,
          null::uuid  as activity_id,
          null as activity_name,
          null as type,
          null::uuid  as file_id,
          null as file_name,
          null::integer  as lesson_id,
          null as lesson_name,
          null::integer  as category_id,
          null as category_name,
          null::uuid  as course_id,
          null as course_name
        from organizations o
        left join users u
          on u.id = o.created_by
        left join organizations_owners oo
          on oo.organization_id = o.id
        ${roleCheck + tables.organization.delete}
      `;
      mergQuery = mergQuery + orgQuery;
    }

    if (isAllowAction.contacts) {
      const isUnion = returnInsertUnion.contacts ? ' union ' : '';
      const roleCheck =
        !isAdmin && !isOwner // if user is admin skip all conditions , if owner include only tenant check and if normal user get contact relevant to user or he owned.
          ? 'where (co.user_id = :user_id or c.assigned_user_id= :user_id) and c.tenant_id = :tenant_id'
          : isOwner
          ? 'where c.tenant_id = :tenant_id'
          : 'where 1=1'; // this is just a dummy clause to join delete

      const contactQuery = `${isUnion} 
        select
          'contact' as kind,
          greatest(
            similarity(c.first_name , :search_term),
            similarity(c.last_name, :search_term),
            similarity(c.email_work, :search_term)
          ) as score,
          null::uuid  as deal_id,
          null as deal_name,
          o.id as organization_id,
          o.name as organization_name,
          c.id as contact_id,
          concat(c.first_name, ' ', c.last_name) as contact_name,
          null::uuid  as activity_id,
          null as activity_name,
          null as type,
          null::uuid  as file_id,
          null as file_name,
          null::integer  as lesson_id,
          null as lesson_name,
          null::integer  as category_id,
          null as category_name,
          null::uuid  as course_id,
          null as course_name
        from contacts c
        left join organizations o
          on o.id = c.organization_id ${tables.organization.delete}
        left join users u
          on u.id = c.created_by
        left join contacts_owners co
          on co.contact_id = c.id

        ${roleCheck + tables.contact.delete}
      `;

      mergQuery = mergQuery + contactQuery;
    }

    /***** Add role and permission check against activity  ******/

    let isUnion = returnInsertUnion.activity ? ' union ' : '';
    let roleCheck =
      !isAdmin && !isOwner
        ? 'where (a.owner = :user_id or a.assigned_user_id= :user_id) and a.tenant_id = :tenant_id'
        : isOwner
        ? 'where a.tenant_id = :tenant_id'
        : 'where 1=1'; // this is just a dummy clause to join delete
    //TODO return multiple contacts against activity, on bases of front end need.
    const activityQuery = `${isUnion}
      select
        'activity' as kind,
        greatest(similarity(a.name, :search_term)) as score,
        d.id as deal_id,
        d.name as deal_name,
        o.id as organization_id,
        o.name as organization_name,
        c.id as contact_id,
        concat(c.first_name, ' ', c.last_name) as contact_name,
        a.id as activity_id,
        a.name as activity_name,
        a.type as type,
        null::uuid  as file_id,
        null as file_name,
        null::integer  as lesson_id,
        null as lesson_name,
        null::integer  as category_id,
        null as category_name,
        null::uuid  as course_id,
        null as course_name
      from activities a
      left join organizations o
        on o.id = a.organization_id ${tables.organization.delete}      
          left join contacts c
          on c.id = a.contact_id    
      left join deals d
        on d.id = a.deal_id ${tables.deal.delete}
      left join users u
        on u.id = a.created_by
      ${roleCheck + tables.activity.delete}
    `;

    mergQuery = mergQuery + activityQuery;

    /***** Add role and permission check against activity  ******/

    if (isAllowAction.accounts || isAllowAction.contacts) {
      const isUnion = returnInsertUnion.file ? ' union ' : '';
      const roleCheck =
        !isAdmin && !isOwner
          ? 'where a.assigned_user_id= :user_id  and f.tenant_id = :tenant_id'
          : isOwner
          ? 'where f.tenant_id = :tenant_id'
          : 'where 1=1'; // this is just a dummy clause to join delete

      const fileQuery = `${isUnion}
        select
          'file' as kind,
          greatest(similarity(f.title , :search_term)) as score,
          d.id as deal_id,
          d.name as deal_name,
          o.id as organization_id,
          o.name as organization_name,
          c.id as contact_id,
          concat(c.first_name, ' ', c.last_name) as contact_name,
          null::uuid  as activity_id,
          null as activity_name,
          null as type,
          f.id as file_id,
          f.title as file_name,
          null::integer  as lesson_id,
          null as lesson_name,
          null::integer  as category_id,
          null as category_name,
          null::uuid  as course_id,
          null as course_name
        from files f
        left join activity_file a
          on a.file_id = f.id
        left join organizations o
          on o.id = a.organization_id 
        left join contacts c
          on c.id = a.contact_id
        left join deals d
          on d.id = a.deal_id 
        left join users u
          on u.id = f.uploaded_by
        ${roleCheck}
      `;

      mergQuery = mergQuery + fileQuery;
    }
    /***** Add caterogy check and query , permission do not apply in this section ******/
    isUnion = returnInsertUnion.categories ? ' union ' : '';
    roleCheck = !isAdmin
      ? " where  cat.tenant_id = :tenant_id and cat.status='published' "
      : " where cat.status='published'";

    const catQuery = `${isUnion}
      select
        'category' as kind,
        greatest(similarity(cat.title , :search_term)) as score,
        null::uuid  as deal_id,
        null as deal_name,
        null as organization_id,
        null as organization_name,
        null::uuid  as contact_id,
        null as contact_name,
        null::uuid  as activity_id,
        null as activity_name,
        null as type,
        null::uuid  as file_id,
        null as file_name,
        null::integer  as lesson_id,
        null as lesson_name,
        cat.id as category_id,
        cat.title as category_name,
        null::uuid  as course_id,
        null as course_name
      from categories cat
     ${roleCheck}
    `;

    mergQuery = mergQuery + catQuery;
    isUnion = ' union ';
    /***** Add course check and query , permission do not apply in this section ******/
    roleCheck = !isAdmin
      ? " where  cou.tenant_id = :tenant_id and cou.status='published' "
      : " where cou.status='published' ";

    const couQuery = `${isUnion}   
      select
        'course' as kind,
        greatest(similarity(cou.name , :search_term), similarity(cou.description, :search_term)) as score,
        null::uuid  as deal_id,
        null as deal_name,
        null as organization_id,
        null as organization_name,
        null::uuid  as contact_id,
        null as contact_name,
        null::uuid  as activity_id,
        null as activity_name,
        null as type,
        null::uuid  as file_id,
        null as file_name,
        null::integer  as lesson_id,
        null as lesson_name,
        null::integer  as category_id,
        null as category_name,
        cou.id as course_id,
        cou.name as course_name
      from courses cou
      ${roleCheck}
    `;

    mergQuery = mergQuery + couQuery;

    isUnion = ' union ';

    /***** Add lesson check and query , permission do not apply in this section ******/

    roleCheck = " where l.status='published' ";

    const lessonQuery = `${isUnion}   
      select
        'lesson' as kind,
        greatest(similarity(l.title , :search_term)) as score,
        null::uuid  as deal_id,
        null as deal_name,
        null as organization_id,
        null as organization_name,
        null::uuid  as contact_id,
        null as contact_name,
        null::uuid  as activity_id,
        null as activity_name,
        null as type,
        null::uuid  as file_id,
        null as file_name,
        l.id as lesson_id,
        l.title as lesson_name,
        null::integer  as category_id,
        null as category_name,
        null::uuid  as course_id,
        null as course_name
      from lessons l
      ${roleCheck}
    `;

    mergQuery = mergQuery + lessonQuery;

    mergQuery = mergQuery + ' order by score desc limit 100 ';

    const finalQuery = `select * from (${mergQuery})  global_results where  global_results.score between 0.1 and 1`;

    const [results] = await sequelize.query(finalQuery, {
      replacements: { search_term: query, tenant_id: tenant, user_id: userId },
    });

    return results;
  }
}

/**
 * Check which action user is allowed
 */
export const checkIsAllowed = (rolePermissions: PermissionAttr[]) => {
  const isAllowAction = {
    deals: true,
    accounts: true,
    contacts: true,
    categories: true,
    courses: true,
    lessons: true,
  };

  isAllowAction.deals = hasAccessToPermission(
    rolePermissions,
    permissions.deals.view
  )
    ? true
    : false;
  isAllowAction.contacts = hasAccessToPermission(
    rolePermissions,
    permissions.contacts.view
  )
    ? true
    : false;
  isAllowAction.accounts = hasAccessToPermission(
    rolePermissions,
    permissions.accounts.view
  )
    ? true
    : false;
  isAllowAction.categories = hasAccessToPermission(
    rolePermissions,
    permissions.categories.view
  )
    ? true
    : false;
  isAllowAction.courses = hasAccessToPermission(
    rolePermissions,
    permissions.courses.view
  )
    ? true
    : false;
  isAllowAction.lessons = hasAccessToPermission(
    rolePermissions,
    permissions.lessons.view
  )
    ? true
    : false;

  return isAllowAction;
};

/**
 * Check specific permission is allowed against role's permission list
 * // TODO this is duplicate stuff
 */
export const hasAccessToPermission = (
  rolePermissions: PermissionAttr[],
  permission: Permission
) => {
  const permissionResults = rolePermissions.filter((rolePermission) => {
    return (
      rolePermission.collection === permission.collection &&
      rolePermission.action === permission.action
    );
  });

  return permissionResults.length > 0;
};

/**
 * Check where union clause should be inserted in global search
 */
export const isInsertUnion = (isAllowAction: any) => {
  const returnInsertUnion = {
    organizations: false,
    contacts: false,
    activity: false,
    file: false,
    categories: true,
    courses: true,
    lessons: true,
  };

  if (isAllowAction.deals && isAllowAction.accounts) {
    returnInsertUnion.organizations = true;
  }

  if (
    (isAllowAction.accounts || isAllowAction.deals) &&
    isAllowAction.contacts
  ) {
    returnInsertUnion.contacts = true;
  }

  if (isAllowAction.accounts || isAllowAction.deals || isAllowAction.contacts) {
    returnInsertUnion.activity = true;
  }

  if (isAllowAction.accounts || isAllowAction.deals || isAllowAction.contacts) {
    returnInsertUnion.file = true;
  }

  if (
    (isAllowAction.accounts || isAllowAction.deals || isAllowAction.contacts) &&
    isAllowAction.categories
  ) {
    returnInsertUnion.categories = true;
  }

  if (
    (isAllowAction.accounts ||
      isAllowAction.deals ||
      isAllowAction.contacts ||
      isAllowAction.categories) &&
    isAllowAction.courses
  ) {
    returnInsertUnion.courses = true;
  }

  if (
    (isAllowAction.accounts ||
      isAllowAction.deals ||
      isAllowAction.contacts ||
      isAllowAction.categories ||
      isAllowAction.courses) &&
    isAllowAction.lessons
  ) {
    returnInsertUnion.lessons = true;
  }

  return returnInsertUnion;
};
