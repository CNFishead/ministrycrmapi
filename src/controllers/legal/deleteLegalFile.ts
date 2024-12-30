import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest'; 
import { Response } from 'express'; 
import LegalPages from '../../models/LegalPages';

export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await LegalPages.findById(req.params?.id);
    if (!result) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json({ message: 'Document Deleted', success: true });
  } catch (err: any) {
    console.log(err);
    error(err, req, res);
  }
});
