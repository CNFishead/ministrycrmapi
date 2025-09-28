import { Request, Response } from 'express';
import asyncHandler from '../../../middleware/asyncHandler';
import { CRUDService } from '../../../utils/baseCRUD';
import { MinistryHandler } from '../handlers/Ministry.handler';
import error from '../../../middleware/error';

export class MinistryService extends CRUDService {
  constructor() {
    super(MinistryHandler);
  }

  public getMinistryForProfile = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        const profileId = req.params.profileId;
        if (!profileId) {
          return res.status(400).json({ success: false, message: 'Profile ID is required' });
        }

        const ministry = await this.handler.getMinistryForProfile(profileId);
        return res.status(200).json({ success: true, payload: ministry });
      } catch (err: any) {
        console.error(err);
        return error(err, req, res, null);
      }
    }
  );
}
