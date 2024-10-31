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
 * @route       POST /api/v1/ministry/:id
 *
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 * @lastModified 2023-10-28T11:06:01.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // The main ministry is created at the same time as user creation,
    // so this is a sub ministry that belongs to the main ministry
    // we need the main ministry id to create this sub ministry
    const mainMinistryId = req.params?.id;
    // find the main ministry
    const mainMinistry = await Ministry.findById(mainMinistryId);
    // if the main ministry doesn't exist, return an error
    if (!mainMinistry) {
      return res.status(404).json({ message: "Main Ministry not found" });
    }
    console.log(req.body);

    // check that a leader is passed in
    const leader = req.body?.leader;
    if (!leader) {
      return res.status(400).json({ message: "Leader is required" });
    }
    // create the ministry
    const ministry = await Ministry.create({
      ...req.body,
      user: req.user._id,
      ownerMinistry: mainMinistryId,
    });
    // check that it was created
    if (!ministry) {
      return res.status(400).json({ message: "Ministry not created" });
    }

    // return
    return res.status(201).json({ success: true, data: ministry });
  } catch (err: any) {
    console.log(error);
    error(err, req, res);
  }
});
