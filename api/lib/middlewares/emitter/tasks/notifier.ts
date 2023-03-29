import moment from 'moment';
import { EventReq, EventTask } from 'lib/middlewares/emitter';

import {
  getUrl,
  extractComment,
  getDealFollowers,
  getDealOwners,
  getUpdateDiff,
} from './utils';
import { settingsValidator, filterUsersBySetting } from './settingsValidator';
import { removeDuplicate } from 'lib/utils/utils';

export async function sendActivityRequestCreatedEmail(
  req: EventReq,
  { payload }: EventTask<'ACTIVITY_REQUEST_CREATED'>
) {
  const [organization] = await Promise.all([
    req.services.biz.organization.getOneById(
      undefined,
      payload.activityRequest.organizationId
    ),
  ]);
  const organizationOwners =
    await req.services.biz.organizationOwner.getAllByResourceId(
      undefined,
      organization.id
    );
  const userIds = organizationOwners.map((owner) => owner.user_id);
  userIds.push(organization.created_by);
  userIds.push(organization.assigned_user_id);

  const users = await Promise.all(
    userIds.map((id) => req.services.biz.user.getOneById(undefined, id))
  );

  const usersWithNotifications = await filterUsersBySetting(
    users,
    'mentionsAndComments'
  );

  await req.services.biz.notification.sendEmail({
    event: 'ACTIVITY_REQUEST_CREATED',
    payload: {
      activityRequest: payload.activityRequest,
      organization,
    },
    subject: `You have a new activity request: ${organization.name}`,
    tenant_id: req.user.tenant,
    bcc: usersWithNotifications.map((user) => user.email),
  });
}

export async function sendCommentCreatedEmail(
  req: EventReq,
  { resource, payload }: EventTask<'COMMENT_CREATED'>
) {
  await settingsValidator(req.user.id, 'mentionsAndComments');

  const comment = extractComment(payload.text);
  const [feedUser, genericResource, user] = await Promise.all([
    req.services.biz.user.getOneById(undefined, payload.feed.created_by),
    req.services.biz[resource.type].getOneById(undefined, resource.id),
    req.services.biz.user.getOneById({ self: true }, req.user.id),
  ]);

  await req.services.biz.notification.sendEmail({
    event: 'COMMENT_CREATED',
    payload: {
      resource: {
        url: getUrl(resource.type, resource.id),
      },
      firstName: user.first_name,
      lastName: user.last_name,
      comment: comment as string, // TODO check this...
      date: moment(payload.date).format('MMM DD YYYY h:mm A'),
    },
    subject: `You have a new comment in the ${resource.type}: ${genericResource.name}`,
    tenant_id: req.user.tenant,
    to: feedUser.email,
  });
}

export async function sendDealUpdatedEmail(
  req: EventReq,
  { payload }: EventTask<'DEAL_UPDATED'>
) {
  const [followers, owners] = await Promise.all([
    getDealFollowers(payload.deal.id, req.user),
    getDealOwners(payload.deal.id),
  ]);

  const usersToFilter = [...followers, ...owners] as any[];

  if (payload.deal.assigned_user_id) {
    const primaryOwner = await req.services.biz.user.getOneById(
      undefined,
      payload.deal.assigned_user_id
    );
    usersToFilter.push(primaryOwner);
  }

  const validUsers = await filterUsersBySetting(usersToFilter, 'dealsUpdates');

  const emails = removeDuplicate(validUsers.map((user) => user.email));

  await req.services.biz.notification.sendEmail({
    event: 'DEAL_UPDATED',
    payload: {
      name: payload.deal.name,
      updates: await getUpdateDiff(payload.previousDeal, payload.deal, {
        friendlyNames: {
          amount: 'Value',
          deal_type: 'Status',
          name: 'Title',
          tenant_deal_stage_id: 'Deal Stage',
        },
        relationships: {
          tenant_deal_stage_id: async (id: string) => {
            const stage = await req.services.biz.tenantDealStage.getOneById(
              undefined,
              id
            );
            return stage.name;
          },
        },
      }),
      url: getUrl('deal', payload.deal.id),
    },
    subject: `New changes to your deal ${payload.deal.name}`,
    tenant_id: req.user.tenant,
    bcc: emails,
  });
}

export async function sendFollowingEmail(
  req: EventReq,
  task: EventTask<'FOLLOWER_ADDED'>
) {
  const { payload } = task;

  const [user, primaryOwner] = await Promise.all([
    // TODO this may need to switch to user_id in payload
    req.services.biz.user.getOneById({ self: true }, req.user.id),
    req.services.biz.user.getOneById(
      undefined,
      payload.organization.assigned_user_id
    ),
  ]);

  await req.services.biz.notification.sendEmail({
    event: 'FOLLOWER_ADDED',
    payload: {
      resource: {
        name: payload.organization.name,
        type: 'organization',
        url: getUrl('organization', payload.organization.id),
      },
      primaryOwner: {
        name: `${primaryOwner.first_name || ''} ${
          primaryOwner.last_name || ''
        }`,
      },
    },
    subject: 'You are following a new organization',
    tenant_id: req.user.tenant,
    to: user.email,
  });
}

export async function sendOwnerAddedEmail(
  req: EventReq,
  { payload, resource }: EventTask<'OWNER_ADDED'>
) {
  await settingsValidator(payload.owner.user_id, 'associations');

  const [user, genericResource] = await Promise.all([
    // TODO context should always be of the desired user
    req.services.biz.user.getOneById(undefined, payload.owner.user_id),
    req.services.biz[resource.type].getOneById(undefined, resource.id),
  ]);

  await req.services.biz.notification.sendEmail({
    event: 'OWNER_ADDED',
    payload: {
      resource: {
        name: genericResource.name,
        type: resource.type,
        url: getUrl(resource.type, resource.id),
      },
    },
    subject: `You were assigned to a new ${resource.type}`,
    tenant_id: payload.owner.tenant_id,
    to: user.email,
  });
}

export async function sendPasswordChangedEmail(
  req: EventReq,
  { payload }: EventTask<'PASSWORD_CHANGED'>
) {
  await req.services.biz.notification.sendEmail({
    event: 'PASSWORD_CHANGED',
    payload: {
      password: payload.password,
    },
    subject: 'A new password was generated',
    // TODO context should always be of the desired user
    tenant_id: payload.tenantId,
    to: payload.email,
  });
}

export async function sendPasswordResetEmail(
  req: EventReq,
  { payload }: EventTask<'PASSWORD_RESET'>
) {
  await req.services.biz.notification.sendEmail({
    event: 'PASSWORD_RESET',
    payload: {
      email: payload.email,
    },
    subject: 'Your new password on Identifee',
    tenant_id: req.user.tenant,
    to: payload.email,
  });
}

export async function sendReminderCreatedEmail(
  req: EventReq,
  { payload }: EventTask<'REMINDER_CREATED'>
) {
  const user = await req.services.biz.user.getOneById(
    { self: true },
    req.user.id
  );

  await req.services.biz.notification.sendEmail({
    event: 'REMINDER_CREATED',
    payload: {
      firstName: user.first_name,
      activities: payload.activities,
    },
    subject: `Activities scheduled for the day`,
    tenant_id: req.user.tenant,
    to: user.email,
  });
}

export async function sendUserMentionedEmail(
  req: EventReq,
  { payload, resource }: EventTask<'USERS_MENTIONED'>
) {
  // nothing to do, no user was mentioned
  if (payload.mentions.length === 0) {
    return;
  }

  const validUsers = await filterUsersBySetting(
    payload.mentions as any,
    'mentionsAndComments'
  );
  const mentionedEmails = validUsers.map((user) => user.email);
  if (validUsers.length === 0) {
    return;
  }

  const [user, genericResource] = await Promise.all([
    req.services.biz.user.getOneById({ self: true }, req.user.id),
    req.services.biz[resource.type].getOneById(undefined, resource.id),
  ]);

  const filteredEmails = mentionedEmails.filter(
    (email) => email !== user.email
  );
  if (filteredEmails.length === 0) {
    return;
  }

  await req.services.biz.notification.sendEmail({
    event: 'USER_MENTIONED',
    payload: {
      firstName: user.first_name,
      lastName: user.last_name,
      comment: payload.textResource.text,
      date: moment(payload.textResource.created_at).format(
        'MMM DD YYYY h:mm A'
      ),
      resource: {
        url: getUrl(resource.type, resource.id),
      },
    },
    subject: `You have a new mention in the ${resource.type}: ${genericResource.name}`,
    tenant_id: req.user.tenant,
    bcc: filteredEmails,
  });
}
