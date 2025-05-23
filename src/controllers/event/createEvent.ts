import { Request, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import Event from '../../models/Event';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import Ministry from '../../models/Ministry';

export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Get the event data from the request body
      const eventData = req.body;
      // check if 'ministry' is part of the req.body if it is, attempt to parse it
      if (eventData.ministry) {
        try {
          // attempting to parse json object
          eventData.ministry = JSON.parse(eventData.ministry);
        } catch (error) {
          console.log(`parsing failed, ${eventData.ministry}`);
        }
      }

      // if a ministry is not provided, set it to the user's ministry
      if (!eventData.ministry) {
        // find a ministry that the user owns, that does not have an ownerMinistry
        // this should be the main ministry for the user (i.e., most likely the user's church)
        const ministry = await Ministry.findOne({
          user: req.user._id,
          ownerMinistry: null,
        });
        if (!ministry) {
          return res.status(400).json({
            success: false,
            error: 'No ministry found for this user',
          });
        }
        eventData.ministry = ministry._id;
      }

      // Create the event
      const event = await Event.create({
        ...eventData,
        user: req.user._id,
      });

      // Send the event data in the response
      return res.status(201).json({
        success: true,
        data: event,
      });
    } catch (err: any) {
      console.error(err);
      error(err, req, res);
    }
  }
);
