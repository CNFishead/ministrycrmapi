import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import User from "../../models/User";
import Ministry from "../../models/Ministry";
import Family from "../../models/Family";
import Member from "../../models/Member";

/**
 * @description - allows developer to run a myriad of different functions on the platform via a http request
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let users = [];
    for (let i = 0; i < 3; i++) {
      const user = await User.create({
        email: `test-${i}@email.com`,
        password: "password10",
        firstName: `John${i}`,
        lastName: `Doe-${i}`,
        username: `johndoe${i}`,
      });
      users.push(user);
    }
    // create one ministry for each user
    for (const user of users) {
      await Ministry.create({
        name: `Test Ministry for ${user.firstName}`,
        user: user._id,
      });
    }

    // create 3 families for each user, each with 1 member
    for (const user of users) {
      for (let i = 0; i < 3; i++) {
        const family = await Family.create({
          name: `Family ${i} for ${user.firstName}`,
          user: user._id,
        });
        const member = await Member.create({
          firstName: `John${i}`,
          lastName: `Doe-${i}`,
          family: family._id,
        });

        await Family.findByIdAndUpdate(family._id, { $push: { members: member._id } });
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
