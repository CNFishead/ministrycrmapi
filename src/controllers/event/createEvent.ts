import { Request, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import Event from "../../models/Event";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Ministry from "../../models/Ministry";

export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(req.body);
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
      // find a ministry that the user is connected to
      const ministry = await Ministry.findOne({ leader: req.user._id });
      if (!ministry) {
        return res.status(400).json({
          success: false,
          error: "No ministry found for this user",
        });
      }
      eventData.ministry = ministry._id;
    }

    // Create the event
    const event = await Event.create({
      ...eventData,
      user: req.user._id,
      startDate: new Date(eventData.dates[0]),
      endDate: new Date(eventData.dates[1]),
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
});
