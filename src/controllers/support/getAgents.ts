import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import SupportGroup from '../../models/SupportGroups';
import Support from '../../models/Support';
import User from '../../models/User';
import { ObjectId } from 'mongoose';

/**
 * @description - Retrieves all unique agents associated with the support groups of a given ticket.
 * @param       {AuthenticatedRequest} req - The request object from the client
 * @param       {Response} res - The response object from the server
 * @returns     {object} - A response containing unique agents
 *
 * @author Austin Howard
 * @since 1.0
 * @version 1.2
 * @lastModifiedBy - Austin Howard
 * @lastModified - 2024-12-12T00:00:00.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    // Find the ticket by ID
    const ticket = await Support.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find the support groups the ticket belongs to
    const groups = await SupportGroup.find({ _id: { $in: ticket.groups } });
    if (groups.length === 0) {
      return res.status(404).json({ message: 'No associated support groups found' });
    }

    // Inflate all agents from the support groups
    const agentIds = groups.reduce<ObjectId[]>((acc, group) => {
      if (group.agents && Array.isArray(group.agents)) {
        acc.push(...(group.agents as unknown as ObjectId[]));
      }
      return acc;
    }, []);

    // Remove duplicate agent IDs
    const uniqueAgentIds = [...new Set(agentIds)];

    // Fetch detailed agent information
    const uniqueAgents = await User.find({ _id: { $in: uniqueAgentIds } }).select(
      'fullName email _id'
    );

    return res.json({ agents: uniqueAgents });
  } catch (e) {
    console.error(e);
    error(e, req, res, next);
  }
});
