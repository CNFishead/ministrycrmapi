import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Member from "../../models/Member";
import { Response } from "express";
import Ministry from "../../models/Ministry";

export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { memberId } = req.params!;
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(200).json({ message: "No Member Found" });
    } else {
      // check if the member is a leader of any ministries, if they are,
      // we need to throw an error and tell the user that they cannot delete the member
      const ministries = await Ministry.aggregate([
        {
          $match: {
            leader: member._id,
          },
        },
      ]);
      if (ministries.length > 0) {
        return res.status(400).json({ message: "Cannot delete a member that is a leader of a ministry" });
      }
      await Member.findByIdAndDelete(memberId);

      return res.status(200).json({ message: "Member Deleted", success: true });
    }
  } catch (err: any) {
    console.log(err);
    error(err, req, res);
  }
});
