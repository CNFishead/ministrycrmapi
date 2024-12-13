import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import error from '../../middleware/error';
import Support from '../../models/Support';
import SupportMessage from '../../models/SupportMessage';
/**
 * @description Remvoes an object from the database
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
    const id = req.params?.id;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }
    // find the object
    const object = await Support.findById(id);
    // if the object doesn't exist, return an error
    if (!object) {
      return res.status(404).json({ message: 'Object not found' });
    }

    // find all supportmessages that belong to the ticket, and delete them
    await SupportMessage.deleteMany({ ticket: object._id });

    // delete the object
    await Support.findByIdAndDelete(id);

    // return
    return res.status(201).json({ success: true });
  } catch (err: any) {
    console.log(error);
    error(err, req, res);
  }
});
