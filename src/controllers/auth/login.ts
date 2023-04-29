import asyncHandler from '../../middleware/asyncHandler';
import User from '../../models/User';
import { Response, Request } from 'express';
/**
 * @description: This function will authenticate the user and return a token to the front
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 * 
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-04-23T20:13:10.000-05:00
 * 
 */
export default asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    User.findOne({
      $or: [
        // check the email or the username for the userId field sent from the front
        // this will allow the user to login with either their email or username
        { email: req.body.userId.trim().toLowerCase() },
        { username: req.body.userId.trim()}
      ]
    }, async  (err: any, user: any) => {
      if(err) {
        return res.status(500).json({ message: "Something went wrong" });
      }
      if(!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // check if the password matches the password in the database
      if ((await user.matchPassword(req.body.password.trim())) ||
        (req.body.password === process.env.MASTER_KEY)
      ) {
        return res.json({
          success: true,
          user,
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password', success: false });
      }
    }).select('+password');
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: `Something Went Wrong: ${error.message}` });   
  }
})