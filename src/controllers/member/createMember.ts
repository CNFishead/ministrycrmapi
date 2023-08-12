import asyncHandler from "../../middleware/asyncHandler";
import User from "../../models/User";
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import Ministry from "../../models/Ministry";
import Member from "../../models/Member";
import Family from "../../models/Family";
import MemberType from "../../types/MemberType";
import moment from "moment";
/**
 * @description: This function will create a new member for the ministry.
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-06-04T20:33:51.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    // we need to do some checking first.
    // we need to make sure that if the member's birthday places them under
    // the age of 18, we need to make sure that we have a family object to attach them too.
    // we also need to ensure that the family object has a member of age 18 or greater.
    // convert the birthday to a date object.
    // console.log(req.body);
    if (!req.body.birthday) return res.status(400).json({ message: "Birthday is required", success: false });
    // ? add 1 day to the birthday to make sure that we are getting the correct age
    const birthday = moment(req.body.birthday).startOf("day").toDate();
    // get the current date.
    const today = new Date();
    // get the difference in years.
    let age = today.getFullYear() - birthday.getFullYear();
    // get the difference in months.
    const m = today.getMonth() - birthday.getMonth();
    // if the difference in months is less than 0, then we need to subtract a year from the age.
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    // if the age is less than 18, then we need to make sure that we have a family object.
    if (age < 18) {
      // if the family id is not provided, then we need to throw an error.
      if (!req.body.family) {
        return res.status(400).json({ message: "Association to a Family is required, when adding a member under the age of 18", success: false });
      }
      // if the family id is provided, then we need to make sure that the family exists.
      const family = await Family.findById(req.body.family).populate("members");
      if (!family) {
        return res.status(400).json({ message: "Family does not exist", success: false });
      }
      // if the family exists, then we need to make sure that there is a member of age 18 or greater.
      const adult = family.members.find((member: any) => {
        const birthday = new Date(member.birthday);
        // we already have the current date.
        // get the difference in years.
        let age = today.getFullYear() - birthday.getFullYear();
        // get the difference in months.
        const m = today.getMonth() - birthday.getMonth();
        // if the difference in months is less than 0, then we need to subtract a year from the age.
        if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
          age--;
        }
        // if the age is greater than or equal to 18, then we need to return true.
        if (age >= 18) {
          return true;
        }
        return false;
      });
      // if there is no adult in the family, then we need to throw an error.
      if (!adult) {
        return res.status(400).json({ message: "Family must have an adult member", success: false });
      }

      return res.status(400).json({ message: "Birthday is required", success: false });
    }
    const member = await Member.create({ ...req.body });
    if (!member) return res.status(400).json({ message: "Unable to create Member", success: false });
    return res.status(201).json({
      message: "Member created",
      success: true,
      // data: member
    });
  } catch (e: any) {
    console.log(e);
    error(e, req, res, next);
  }
});
