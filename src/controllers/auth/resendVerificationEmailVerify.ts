import asyncHandler from '../../middleware/asyncHandler';
import errorHandler from '../../middleware/error';
import UserSchema from '../../models/User';
import crypto from 'crypto';
import sendEmail from '../../utils/sendEmail';
import { Request, Response } from 'express';
/**
 * @description This function will resend the verification email to the user, with a new token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @method POST /auth/resend-verification-email
 * @returns {Object} - Returns a response object
 *
 * @author Austin Howard
 * @version 1.0
 * @since 1.0
 *
 */
export default asyncHandler(async (req: Request, res: Response) => {
  try {
    // get the user from the database using the user's email that was sent in the request body
    const user = await UserSchema.findOne({ email: req.body.email });
    // if the user is not found, return an error
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // use the findByIdAndUpdate method to update the user's emailVerificationToken field
    const updatedUser = await UserSchema.findByIdAndUpdate(
      user._id,
      {
        emailVerificationToken: await crypto.randomBytes(20).toString('hex'),
        emailVerificationExpire: Date.now() + 10 * 60 * 1000,
      },
      { new: true }
    );
    // set the hostname for the email validation link, if we are in development send it to localhost
    let hostName = 'https://auth.pyreprocessing.com';
    if (process.env.NODE_ENV === 'development') {
      hostName = 'http://localhost:3000';
    }
    // send email verification
    await sendEmail({
      personalizations: [
        {
          to: [{ email: user.email, name: user.fullName }],
        },
      ],
      from: 'info@pyreprocessing.com',
      dynamicTemplateData: {
        subject: `Please complete your registration!`,
        verifyEmailUrl: `${hostName}/resend-verification?verify=${user.emailVerificationToken}`,
        firstName: user.fullName,
      },
      templateId: 'd-3a9068c3975b48399ab31db2cfa6d08c',
    });
    // if the user is successfully updated, send the user a success message
    return res.status(200).json({
      success: true,
      message: 'Email successfully sent.',
    });
  } catch (error) {
    console.log(error);
    errorHandler(error, req, res);
  }
});
