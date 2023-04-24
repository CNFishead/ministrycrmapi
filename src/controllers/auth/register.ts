import asyncHandler from '../../middleware/asyncHandler';
import Ministry from '../../models/Ministry';
import User from '../../models/User';
import { Response, Request } from 'express';
/**
 * @description: this function registers a new account to the database. 
 *               It will check if the email is already in use, if it is, it will throw an error
 *               if the email is not in use, it will create a new user document in the database
 *               and return the user object to the front
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 * @throws:     If the email is already in use
 * @throws:     If the user is not found
 * 
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-04-22T18:50:56.000-05:00
 * 
 */
export default asyncHandler(async (req: Request, res: Response) => {
  try {
    // first check if the required fields are in the request body
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    // check if the email is already in use
    // @ts-ignore
    const userExists = await User.findOne({ email }); // returns a user object if the email is in use
    if(userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // TODO: add payment info to registration

    // create a new user object
    const newUser = await User.create({
      ...req.body.user,
    })
    // save the user to the database
    await newUser.save();

    // on registration we need to create a ministry object for the user who created the account
    // pass in the ministry object from the request body
    await Ministry.create({
      leader: newUser._id,
      ...req.body.ministry,
    })
    // return the user object to the front
    return res.status(201).json({ user: newUser, message: "User Created", success: true });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: `Something Went Wrong: ${error.message}` });   
  }
})