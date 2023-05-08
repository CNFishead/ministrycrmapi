import asyncHandler from '../../middleware/asyncHandler';
import User, { UserType } from '../../models/User';
import { Response, Request } from 'express';
import crypto from 'crypto';

/**
 * @description: This function sets the necessary fields on the user document to reset the password, and sends an email to the user with a link to reset their password
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 * 
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-05-08T08:48:10.000-05:00
 * 
 */
export default asyncHandler(async (req: Request, res: Response) => {
  try {
    // find the user by email
    const users = await User.find({ email: req.body.userId });
    const user = users[0];
    // if the user is not found, return an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // if the user is found, set the resetPasswordToken and resetPasswordExpire fields on the user document
    //generate a token
    const token = await user.getResetPasswordToken()
    console.log(token)
    // create the reset url
    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    // create the message
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;
    // send the email
    // TODO: Implement email sending
    res.status(200).json({ message: 'Email Sent' });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: `Something Went Wrong: ${error.message}` });   
  }
})