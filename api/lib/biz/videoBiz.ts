import { VideoCreateBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class VideoBiz extends Biz {
  async create(override: UserQuery | undefined, payload: VideoCreateBiz) {
    const context = await this.userQuery.build(override);

    let video;
    const defaultPayload = {
      createdById: this.user.id,
      tenantId: this.user.tenant,
    };
    if (payload.externalUrl) {
      video = await this.services.dao.video.create(context, {
        ...defaultPayload,
        externalUrl: payload.externalUrl,
      });
    } else {
      const muxVideo = await this.services.providers.mux.createUpload();

      video = await this.services.dao.video.create(context, {
        ...defaultPayload,
        muxUploadId: muxVideo.id,
        muxUploadUrl: muxVideo.url,
      });
    }

    return video;
  }
}
