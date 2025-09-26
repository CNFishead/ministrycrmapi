import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import error from '../../middleware/error';
import User from '../../modules/auth/models/User';

/**
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 *
 * @access      Private
 * @route       POST /api/v1/user
 *
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 * @lastModified 2025-04-21 14:20:51
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'an account for this email already exists' });
    }

    // otherwise create the user
    return res.status(201).json({ success: true, data: {} });
  } catch (err: any) {
    console.log(error);
    error(err, req, res);
  }
});
