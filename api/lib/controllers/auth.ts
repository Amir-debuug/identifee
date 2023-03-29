import { Router } from 'express';
import { InvalidPayload } from 'lib/middlewares/exception';
import { userServiceFactory } from '../services';
import asyncHandler from '../utils/async-handler';

const router = Router();

router.post(
  '/auth/password/request',
  asyncHandler(async (req, res) => {
    if (!req.body.email) {
      throw new InvalidPayload(`"email" field is required.`);
    }

    const service = userServiceFactory(req.user);
    await service.requestPasswordReset(
      req.body.email,
      req.body.reset_url || null
    );
    return res.json({});
  })
);

export default router;
