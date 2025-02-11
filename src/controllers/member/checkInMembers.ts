import asyncHandler from '../../middleware/asyncHandler';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import error from '../../middleware/error';
import Family from '../../models/Family';
import Member from '../../models/Member';
import MemberType from '../../types/MemberType';
import moment from 'moment';
import Ministry from '../../models/Ministry';
import mongoose from 'mongoose';
import User from '../../models/User';
import CheckInRecord from '../../models/CheckInRecord';
/**
 * @description: This function will check in members for a ministry.
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2024-10-21 08:55:50
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { visitors, familyName } = req.body;
    // we need to make sure that the visitors array is not empty.
    if (!visitors || visitors.length === 0) {
      return res.status(400).json({ message: 'Visitors array is required', success: false });
    }
    const ministry = await Ministry.findById(req.params.id);
    if (!ministry) {
      return res.status(400).json({ message: 'Ministry not found', success: false });
    }
    const timestamp = new Date(); // current timestamp to be used for check-in

    // next we want to check if any of the visitors are already members of the ministry.
    // we can do this by checking the familyName field against a Family object, if their is a match, then we can assume that they are a member.
    // if they are a member, then for every visitor that is a member, we need to check them in.
    // for every visitor not part of the family object, add them to the family object.
    // if the family object does not exist, then create a new family object.
    // console.log(`familyName: ${familyName}`);
    const family = await Family.findOne({ name: familyName, user: ministry.user }).populate(
      'members'
    );
    // console.log(family);
    if (!family) {
      // create a new family object.
      const newFamily = await Family.create({
        name: familyName,
        user: ministry.user,
      });
      if (!newFamily) {
        return res.status(400).json({ message: 'Error creating family', success: false });
      }

      // we need to create a member object for each visitor, and add them to the family objects members array.
      for (let i = 0; i < visitors.length; i++) {
        const visitor = visitors[i];

        // check the visitors birthday, if they are younger than 16, then we need to
        // check them as a child.
        let isChild = false;
        if (visitor.birthday !== undefined) {
          isChild = moment().diff(visitor.birthday, 'years') < 16;
        }

        // create a new member object.
        const newMember = await Member.create({
          ...visitor,
          user: ministry.user,
          dateLastVisited: timestamp,
          isChild,
        });
        if (!newMember) {
          return res.status(400).json({ message: 'Error creating member', success: false });
        }
        await Ministry.findByIdAndUpdate(ministry._id, { $push: { members: newMember._id } });
        // add the member to the family object.
        await Family.findByIdAndUpdate(newFamily._id, { $push: { members: newMember._id } });
      }
      return res.status(201).json({
        success: true,
      });
    }

    // console.log(visitors.length);
    // family object exists, so we need to loop over each visitor, match it to a member, and check them in.
    for (const v of visitors) {
      // console.log(`Checking in visitor: ${v.firstName}`); // checking in visitor
      // console.log(v._id);
      if (v?._id) {
        const member = await Member.findById(v._id);
        if (!member) {
          res.status(400).json({ message: 'Member not found', success: false });
          continue; // Skip to the next visitor if member not found
        }
        // console.log(`Member exists: ${member.fullName}`); // member exists, so we need to check them in.
        // member exists, so we need to check them in.
        await Member.findByIdAndUpdate(
          member._id,
          {
            ...v, // updates the member object fields with relevant data if changed on frontend
            dateLastVisited: timestamp,
          },
          { new: true, runValidators: true }
        );
        // console.log(`Member checked in: ${member.fullName}`); // member checked in
        if (!ministry.members.includes(member._id as any)) {
          ministry.members.push(ministry._id as any);
        }
        // console.log(`Added member to ministry: ${member.fullName}`);
        // now we want to create a CheckInRecord object for the member.
        await CheckInRecord.create({
          member: member._id,
          ministry: ministry._id,
          checkInDate: timestamp,
        });

        // save the member object.
        await member.save();
        await ministry.save();
        // console.log(`Member saved: ${member.fullName}`);
      } else {
        // member does not exist, so we need to create a new member object.
        // console.log(`Member does not exist: ${v.firstName}`); // member does not exist, so we need to create a new member object.
        let isChild = false;
        if (v.birthday !== undefined) {
          isChild = moment().diff(v.birthday, 'years') < 16;
        }
        const newMember = await Member.create({
          ...v,
          user: ministry.user,
          dateLastVisited: timestamp,
          isChild,
        });
        if (!newMember) {
          console.log(`Error creating member: ${v.firstName}`); // Error creating member
          res.status(400).json({ message: 'Error creating member', success: false });
          continue; // Skip to the next visitor if error creating member
        }
        // checkinrecord object
        await CheckInRecord.create({
          member: newMember._id,
          ministry: ministry._id,
          checkInDate: timestamp,
        });
        await Ministry.findByIdAndUpdate(ministry._id, { $push: { members: newMember._id } });
        await Family.findByIdAndUpdate(family._id, { $push: { members: newMember._id } });
      }
    }

    return res.status(201).json({
      success: true,
    });
  } catch (e: any) {
    console.log(e);
    error(e, req, res, next);
  }
});
