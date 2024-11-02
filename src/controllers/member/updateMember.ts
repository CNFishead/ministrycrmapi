import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import Member from "../../models/Member";
import Ministry from "../../models/Ministry";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";

/**
 * @description - Updates a member
 *
 * @param {string} memberId - the id of the member to be updated
 * @param {object} member - the member object to be updated
 *
 * @returns {object} - the updated member object
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2023-08-27T13:42:45.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.params?.memberId) return res.status(400).json({ message: "Member ID is required", success: false });
    if (!req.body?.member) return res.status(400).json({ message: "Member object is required", success: false }); 
    const _m = await Member.findById(req.params?.memberId);
    // check if _m ministry is different from the req.body.member.ministry, if it is, we want to update each ministry
    // to include the member in the ministry
    if (_m?.ministry !== req.body?.member?.ministry) {
      for (const m of req.body?.member?.ministry) {
        const ministry = await Ministry.findById(m);
        if (!ministry) return res.status(404).json({ message: "Ministry not found", success: false });
        // check that the member isnt already a member of the ministry if they are, continue, otherwise add them
        if (!ministry.members.includes(req.params?.memberId)) {
          ministry.members.push(req.params?.memberId);
          await ministry.save();
        }
      }
    }
    const member = await Member.findByIdAndUpdate(
      req.params?.memberId,
      { ...req.body?.member },
      { runValidators: true, new: true }
    );
    await member?.save();
    if (!member) return res.status(404).json({ message: "Member not found", success: false });
    return res.status(200).json({ message: "Member updated", success: true, data: member });
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
