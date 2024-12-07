import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import Support from '../../models/Support';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import authenticateUser from '../../utils/authenticateUser';
import SupportGroup from '../../models/SupportGroups';
import SupportMessage from '../../models/SupportMessage';

/**
 * @description
 *
 *
 * @last_modified 2024-11-26 13:56:19
 * @version 1.0.0
 * @author Austin Howard
 * @since 1.0.0
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      //try to authenticate the user in-case they are logged in
      const user = await authenticateUser(req.headers.authorization);
      console.log(req.body);
      const newTicket = await Support.create({
        ...req.body,
        requester: user ? user._id : null,
        requesterDetails: {
          email: user ? user.email : req.body.email,
          fullName: user ? user.fullName : req.body.fullName,
        },
      });

      // if the ticket was not created, return a 400 error
      if (!newTicket) {
        return res
          .status(400)
          .json({ success: false, message: 'Ticket not created..' });
      }

      // next we need to find all of our support groups and assign the ticket to the group
      // that matches the category, the Category field is an array of strings, so find
      // all groups that match the category strings
      const groups = await SupportGroup.find({
        name: { $in: newTicket.category },
      });

      // if no groups are found, return a 400 error something went wrong...
      if (!groups.length) {
        return res
          .status(401)
          .json({ success: false, message: 'No support groups found..' });
      }
      //update the ticket with the groups that were found
      newTicket.groups = groups.map((group) => group._id);

      // next we want to create a message for the ticket
      const message = await SupportMessage.create({
        ticket: newTicket._id,
        message: req.body.message,
        // These fields are technically optional, as the messages will be attached
        // to a ticket, which will have the requester and sender fields, but it's
        // good to have them here for reference.
        user: user ? user._id : null,
        sender: {
          fullName: user ? user.fullName : req.body.fullName,
          avatarUrl: user ? user.profilePictureUrl : null,
        },
      });

      // if the message was not created, return a 400 error
      if (!message) {
        // the ticket will still be created, but the message will not be attached
        return res
          .status(400)
          .json({ success: false, message: 'Message not created..' });
      }
      await newTicket.save();
      return res.status(201).json({ success: true });
    } catch (err) {
      console.log(err);
      error(err, req, res);
    }
  }
);
