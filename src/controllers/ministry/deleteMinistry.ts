import { Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import Ministry from "../../models/Ministry";

/**
 * @description Creates a new ministry under the main ministry
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 *
 * @access      Private
 * @route       DELETE /api/v1/ministry/:id
 *
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 * @lastModified 2023-10-28T11:06:01.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // check the id exists
    const ministryId = req.params?.subministryId; 
    if (!ministryId) {
      return res.status(400).json({ message: "Ministry ID is required" });
    }
    // find the ministry
    const ministry = await Ministry.findById(ministryId);
    // if the ministry doesn't exist, return an error
    if (!ministry) {
      return res.status(404).json({ message: "Ministry not found" });
    }

    // TODO: check if the ministry has any events, if it does, delete them
    // TODO: check if the ministry has any announcements, if it does, delete them

    // finally we need to find all of the sub ministries
    // if there are any, return an error, because we can't delete a ministry that has sub ministries
    const subministries = await Ministry.find({ ownerMinistry: ministryId });
    // if there are sub ministries, return an error
    if (subministries.length > 0) {
      return res.status(400).json({ message: "This ministry has sub ministries, please delete them first" });
    }
    // delete the ministry
    await Ministry.findByIdAndDelete(ministryId);
    // return
    return res.status(201).json({ success: true });
  } catch (err: any) {
    console.log(error);
    error(err, req, res);
  }
});
