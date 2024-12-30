import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import LegalPages from '../../models/LegalPages';
/**
 * @description - Creates a new document in the database
 *
 *
 * @last_modified 2024-12-29 20:24:35
 * @version 1.0.0
 * @author Austin Howard
 * @since 1.0.0
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // try to find a document of the same type
    const legalFile = await LegalPages.findOne({ type: req.body.type });
    if (legalFile) {
      return res.status(400).json({ success: false, message: 'File already exists, please update the existing file.' });
    }
    const newLegalFile = await LegalPages.create(req.body);
    if (!newLegalFile) {
      return res.status(400).json({ success: false, message: 'File not created..' });
    }
    return res.status(201).json({ success: true });
  } catch (err) {
    console.log(err);
    error(err, req, res);
  }
});
