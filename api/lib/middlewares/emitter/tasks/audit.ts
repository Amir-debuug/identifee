import { AuditCreateDAO } from 'lib/middlewares/sequelize';
import { EventReq, EventTask } from '../types';
import { getUpdateDiff } from './utils';

export async function activityRequestCreatedAudit(
  req: EventReq,
  { payload }: EventTask<'ACTIVITY_REQUEST_CREATED'>
) {
  // has to be created by guest
  if (req.user.jwt.scope !== 'guest') {
    return;
  }

  const [contact, organization] = await Promise.all([
    req.services.biz.contact.getOneById(undefined, req.user.jwt.contact_id),
    req.services.biz.organization.getOneById(
      undefined,
      payload.activityRequest.organizationId
    ),
  ]);

  const auditPayload: AuditCreateDAO = {
    action: 'create',
    actorDisplayValue: contact.name || '',
    actorId: contact.id,
    actorType: 'contact',
    resourceDisplayValue: 'Activity Request',
    resourceId: payload.activityRequest.activityRequestId,
    resourceIdType: 'string',
    resourceType: 'activityRequest',
    changeLog: {
      association: {
        type: 'activityRequest',
        parent: {
          resourceDisplayValue: organization.name || '',
          resourceId: organization.id,
          resourceIdType: 'string',
          resourceType: 'organization',
        },
        associations: [
          {
            displayValue: contact.name || '',
            id: contact.id,
            type: 'contact',
          },
        ],
      },
    },
  };

  await req.services.biz.audit.create(undefined, auditPayload);
}

export async function dealCreatedAudit(
  req: EventReq,
  { payload }: EventTask<'DEAL_CREATED'>
) {
  const user = await req.services.biz.user.getOneById(
    { self: true },
    req.user.id
  );

  const auditPayload: AuditCreateDAO = {
    action: 'create',
    actorDisplayValue: user.name || '',
    actorId: user.id,
    actorType: 'user',
    resourceDisplayValue: payload.deal.name || '', // should deal enforce name?
    resourceId: payload.deal.id,
    resourceIdType: 'string',
    resourceType: 'deal',
  };

  await req.services.biz.audit.create(undefined, auditPayload);
}

export async function dealUpdatedAudit(
  req: EventReq,
  { payload }: EventTask<'DEAL_UPDATED'>
) {
  const user = await req.services.biz.user.getOneById(
    { self: true },
    req.user.id
  );

  const auditPayload: AuditCreateDAO = {
    action: 'update',
    actorDisplayValue: user.name || '',
    actorId: user.id,
    actorType: 'user',
    resourceDisplayValue: payload.deal.name || '', // should deal enforce name?
    resourceId: payload.deal.id,
    resourceIdType: 'string',
    resourceType: 'deal',
    changeLog: {
      update: await getUpdateDiff(payload.previousDeal, payload.deal, {
        friendlyNames: {
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
    },
  };

  await req.services.biz.audit.create(undefined, auditPayload);
}

export async function ownerAddedAudit(
  req: EventReq,
  { payload, resource }: EventTask<'OWNER_ADDED'>
) {
  const [user, owner, genericResource] = await Promise.all([
    req.services.biz.user.getOneById({ self: true }, req.user.id),
    req.services.biz.user.getOneById(undefined, payload.owner.user_id),
    req.services.biz[resource.type].getOneById(undefined, resource.id),
  ]);

  const auditPayload: AuditCreateDAO = {
    action: 'create',
    actorDisplayValue: user.name || '',
    actorId: user.id,
    actorType: 'user',
    resourceDisplayValue: owner.name || '',
    resourceId: `${payload.owner.user_id}-${resource.id}`,
    resourceIdType: 'string',
    resourceType: `${resource.type}Owner`,
    changeLog: {
      association: {
        type: 'owner',
        parent: {
          resourceDisplayValue: genericResource.name || '',
          resourceId: genericResource.id,
          resourceIdType: 'string',
          resourceType: resource.type,
        },
        associations: [
          {
            displayValue: owner.name || '',
            id: owner.id,
            type: 'user',
          },
        ],
      },
    },
  };

  await req.services.biz.audit.create(undefined, auditPayload);
}

export async function userMentionedAudit(
  req: EventReq,
  { payload, resource }: EventTask<'USERS_MENTIONED'>
) {
  // nothing to do, no user was mentioned
  if (payload.mentions.length === 0) {
    return;
  }

  const [user, genericResource, ...mentionedUsers] = await Promise.all([
    req.services.biz.user.getOneById({ self: true }, req.user.id),
    req.services.biz[resource.type].getOneById(undefined, resource.id),
    ...payload.mentions.map(({ id }) =>
      req.services.biz.user.getOneById(undefined, id)
    ),
  ]);

  const auditPayload: AuditCreateDAO = {
    action: payload.textResource.action,
    actorDisplayValue: user.name || '',
    actorId: user.id,
    actorType: 'user',
    resourceDisplayValue: `${payload.textResource.type} mention`,
    resourceId: payload.textResource.id,
    resourceIdType: payload.textResource.idType,
    resourceType: payload.textResource.type,
    changeLog: {
      association: {
        type: 'mention',
        parent: {
          resourceDisplayValue: genericResource.name || '',
          resourceId: genericResource.id,
          resourceIdType: 'string',
          resourceType: resource.type,
        },
        associations: mentionedUsers.map(({ name, id }) => ({
          displayValue: name || '',
          id,
          type: 'user',
        })),
      },
    },
  };

  await req.services.biz.audit.create(undefined, auditPayload);
}

export async function auditCreatedNotification(
  req: EventReq,
  { payload }: EventTask<'AUDIT_CREATED'>
) {
  const ownableResources = ['contact', 'deal', 'organization'] as const;

  let genericType: typeof ownableResources[number] | undefined;
  let genericId: string | undefined;

  const associationType = payload.audit.changeLog?.association?.type;
  if (
    !!payload.audit.changeLog?.association &&
    associationType !== 'guest' &&
    isOwnableResource(payload.audit.changeLog.association.parent.resourceType)
  ) {
    genericType = payload.audit.changeLog.association.parent.resourceType;
    genericId = payload.audit.changeLog.association.parent.resourceId;
  }

  if (isOwnableResource(payload.audit.resourceType)) {
    genericType = payload.audit.resourceType;
    genericId = payload.audit.resourceId;
  }

  // this means it's an audit for a single user and doesn't impact anyone else
  if (!genericType || !genericId) {
    await req.services.dao.auditNotification.create(
      {},
      {
        auditId: payload.audit.auditId,
        userId: payload.audit.actorId,
        userDisplayValue: payload.audit.actorDisplayValue,
        acknowledged: payload.audit.actorId === req.user.id,
      }
    );
    return;
  }

  const genericResource = await req.services.biz[genericType].getOneById(
    undefined,
    genericId
  );

  const userIds = new Set<string>();
  if (genericResource.assigned_user_id) {
    userIds.add(genericResource.assigned_user_id);
  }
  userIds.add(genericResource.created_by);

  let biz;
  if (genericType) {
    biz = req.services.biz[`${genericType}Owner`];
  } else {
    throw new Error(`invalid owner type: ${genericType}`);
  }

  const owners = await biz.getAllByResourceId(undefined, genericId);
  owners.forEach((owner) => userIds.add(owner.user_id));

  const users = await Promise.all(
    Array.from(userIds).map(async (userId) => {
      return req.services.biz.user.getOneById(undefined, userId);
    })
  );

  const bulkPayload = users.map((user) => {
    return {
      auditId: payload.audit.auditId,
      userId: user.id,
      userDisplayValue: user.name || '',
      acknowledged: user.id === req.user.id,
    };
  });

  await req.services.dao.auditNotification.bulkCreate({}, bulkPayload);
}

function isOwnableResource(
  type: string
): type is 'contact' | 'deal' | 'organization' {
  return ['contact', 'deal', 'organization'].includes(type);
}
