import { Request, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import SupportGroup from '../../models/SupportGroups';

/**
 * @description
 */
export default asyncHandler(async (req: Request, res: Response) => {
  try {
    const newItem = await SupportGroup.create(req.body);
    if (!newItem) {
      return res.status(400).json({ success: false, message: "Support group not created.." });  
    }

    return res.status(200).json({ success: true});
  } catch (err) {
    console.log(err);
    error(err, req, res);
  }
});
