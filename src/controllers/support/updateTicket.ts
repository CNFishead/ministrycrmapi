import asyncHandler from '../../middleware/asyncHandler';
import errorHandler from '../../middleware/error';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import Support from '../../models/Support';
import SupportGroup from '../../models/SupportGroups';
/**
 * @description: This function updates the object with the values sent from the client
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2024-12-12 14:12:27
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const item = await Support.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    // next we need to find all of our support groups and assign the ticket to the group
    // that matches the category, the Category field is an array of strings, so find
    // all groups that match the category strings
    const groups = await SupportGroup.find({
      name: { $in: req.body.category },
    });

    // if no groups are found, return a 400 error something went wrong...
    if (!groups.length) {
      return res.status(401).json({ success: false, message: 'No support groups found..' });
    }

    //update the ticket with the groups that were found
    item.groups = groups.map((group) => group._id) as any;
    
    const updatedItem = await Support.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);
    errorHandler(error, req, res, next);
  }
});
