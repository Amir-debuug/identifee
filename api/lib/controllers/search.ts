import { Router } from 'express';

import GlobalSearchService from 'lib/services/search';
import asyncHandler from '../utils/async-handler';
const router = Router();
const path = '/search';

router.get(
  path,
  asyncHandler(async (req, res) => {
    const { s } = req.query;

    const data = await GlobalSearchService.search(
      req as any,
      req.user,
      s as string
    );

    return res.json(data);
  })
);

export default router;
