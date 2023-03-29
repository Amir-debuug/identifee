import { v4 as uuidv4 } from 'uuid';
import { feedLogServiceFactory } from './feed/feedLog';
import { getResourceTypeWithId } from 'lib/utils/utils';
import { AuthUser } from 'lib/middlewares/auth';
import { send } from 'lib/middlewares/emitter';

class LinkService {
  protected user: AuthUser;
  protected feedLog: ReturnType<typeof feedLogServiceFactory>;

  constructor(user: AuthUser) {
    this.user = user;
    this.feedLog = feedLogServiceFactory(user);
  }

  async shareLink(data: any) {
    const userId = this.user.id;
    const {
      link,
      contact_id = null,
      organization_id = null,
      deal_id = null,
    } = data || {};

    const dataObject = {
      ...data.link,
      id: uuidv4(),
    };

    const body = {
      tenant_id: this.user.tenant,
      assigned_user_id: userId,
      modified_user_id: userId,
      created_by: userId,
      contact_id,
      organization_id,
      deal_id,
      ...dataObject,
    };

    const feed = await this.feedLog.create({
      ...body,
      tenant_id: this.user.tenant,
      type: 'link',
      summary: 'Shared News',
      object_data: dataObject,
    });

    const { type, id } = getResourceTypeWithId({
      organization_id,
      deal_id,
      contact_id,
    });

    await send(this.user, {
      event: 'LINK_SHARED',
      resource: {
        id,
        type,
      },
      payload: {
        date: feed.created_at,
        text: link,
      },
    });
  }
}

export function linkServiceFactory(user: AuthUser) {
  return new LinkService(user);
}
