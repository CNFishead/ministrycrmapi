import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import authenticateUser from '../../utils/authenticateUser';
import Support from '../../models/Support';
import SupportMessage from '../../models/SupportMessage';
import User from '../../models/User';
import Notification from '../../models/Notification';
import socket from '../../utils/socket';

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
      const io = socket.getIO();
      //try to authenticate the user in-case they are logged in
      const user = await authenticateUser(req.headers.authorization);
      //try to locate ticket
      const ticket = await Support.findById(req.params.id);
      //if no ticket is found, return a 400 error
      if (!ticket) {
        return res
          .status(400)
          .json({ success: false, message: 'Ticket not found..' });
      }
      //create the message
      const newMessage = await SupportMessage.create({
        ticket: ticket._id,
        message: req.body.message,
        user: user ? user._id : null,
        sender: {
          email: user ? user.email : req.body.email,
          fullName: user ? user.fullName : req.body.fullName,
        },
      });
      //if the message was not created, return a 400 error
      if (!newMessage) {
        return res
          .status(400)
          .json({ success: false, message: 'Message not created..' });
      }

      // find out who is sending the message, is it the agent or the user?
      // if the user is sending the message, we need to update the ticket status to open, and we send a notification to the agent
      // if its the agent, we set the status to pending and send a notification to the user, but not the agent
      // we can see whose sending the message by checking req.user against the ticket user, if they are the same, then its the user sending the message
      // if they are different, then its the agent sending the message
      const isUser = ticket.requester!.toString() === user?._id.toString();

      // update the ticket status
      ticket.status = isUser ? 'Open' : 'Pending';

      // notify the user if the agent is sending the message
      if (!isUser) {
        await Notification.insertNotification(
          ticket.requester as any,
          user ? user._id : null,
          `New message on ticket #${ticket.subject}`,
          `${
            user ? user.fullName : req?.body?.fullName
          } has sent a new message on ticket #${ticket.subject}`,
          'support',
          ticket._id
        );
      }

      // add a notification to the tickets assigned agent if there is one
      if (ticket.assignee) {
        // find the agent
        const agent = await User.findById(ticket.assignee);
        // if the agent is found, add the notification
        if (agent) {
          await Notification.insertNotification(
            agent._id as any,
            user ? user._id : null,
            `New message on ticket #${ticket.subject}`,
            `${
              user ? user.fullName : req?.body?.fullName
            } has sent a new message on ticket #${ticket.subject}`,
            'support',
            ticket._id
          );
        }
      }

      // save the ticket
      await ticket.save();

      // emit a socket event to the room (ticket id) that a new message has been sent
      io.to(`support-${ticket._id.toString()}`).emit('newMessage', {
        message: newMessage,
        ticket: ticket,
      }); 
      return res.status(201).json({ success: true });
    } catch (err) {
      console.log(err);
      error(err, req, res);
    }
  }
);
