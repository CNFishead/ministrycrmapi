import { NextFunction, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import Family from '../../models/Family';

/**
 * @description       Removes a member from the family object in the database
 * @route             POST /api/v1/family/:id/removeMember/:memberId
 * @access            Private
 *
 * @param req         Request
 * @param res         Response
 * @param next        NextFunction
 *
 * @returns           { Object } { success: true, family: family }
 * @author            Austin Howard
 * @version           1.0.0
 * @since             1.0.0
 * @lastModifiedBy    Austin Howard
 * @lastModified      2024-10-30 09:14:45
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // find the family
      const family = await Family.findById(req.params?.id);
      console.log(family);
      // check if it exists
      if (!family) {
        // return a 404 if it does not
        return res.status(404).json({
          success: false,
          message: 'No family found',
        });
      }
      // remove the member from the family
      family.members = family.members.filter(
        (member: any) => member.toString() !== req.params?.memberId.toString()
      );
      console.log(family);
      // save the family
      await family.save();
      // return the family
      return res.status(200).json({
        success: true,
        family: family,
      });
    } catch (e) {
      console.log(e);
      error(e, req, res, next);
    }
  }
);
