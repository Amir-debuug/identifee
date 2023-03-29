import MuxNode from '@mux/mux-node';
import { ExceptionMiddleware } from 'lib/middlewares/exception';
import { OtelMiddleware } from 'lib/middlewares/opentelemetry';

// Mux is lame. Throws an error as an object, not an actual error....
type MuxAPIError = {
  type: 'invalid_parameters' | 'unauthorized';
  messages: string[];
};
type MuxError = Error & { body: MuxAPIError };

export class Mux {
  private readonly req: ExceptionMiddleware & OtelMiddleware;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly mux: MuxNode;

  constructor(
    req: ExceptionMiddleware & OtelMiddleware,
    opts: { apiKey: string; apiSecret: string }
  ) {
    this.req = req;
    this.apiKey = opts.apiKey;
    this.apiSecret = opts.apiSecret;

    this.mux = new MuxNode(this.apiKey, this.apiSecret);
  }

  private toError(error: MuxAPIError) {
    const err = new Error(JSON.stringify(error));
    (err as MuxError).body = error;
    return err as MuxError;
  }

  /**
   * This generates an upload id in order for front end to directly upload
   * to mux. We are not uploading the video through backend.
   */
  async createUpload() {
    try {
      const upload = await this.mux.Video.Uploads.create({
        new_asset_settings: { playback_policy: 'public' },
        cors_origin: '*',
      });

      return upload;
    } catch (error) {
      throw this.toError(error);
    }
  }

  async deleteVideoByUploadId(uploadId: string) {
    const asset = await this.getAssetByUploadId(uploadId);
    if (asset) {
      try {
        await this.mux.Video.Assets.del(asset.id);
      } catch (error) {
        throw this.toError(error);
      }
    }
  }

  async getAssetByUploadId(uploadId: string) {
    try {
      const [asset] = await this.mux.Video.Assets.list({
        upload_id: uploadId,
      });

      if (!asset) {
        throw new this.req.exception.ResourceNotFound('upload');
      }

      return asset;
    } catch (error) {
      throw this.toError(error);
    }
  }
}
