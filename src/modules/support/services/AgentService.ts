import { Request, Response } from 'express'; 
import error from '../../../middleware/error';
import { AgentHandler } from '../handlers/AgentHandler';
import asyncHandler from '../../../middleware/asyncHandler';

export default class AgentService {
  constructor(private readonly agentHandler: AgentHandler = new AgentHandler()) {}

  public getResource = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.agentHandler.fetchAgents(req.params.id);
      return res.status(200).json({ success: true, payload: result.agents });
    } catch (err) {
      console.error(err);
      return error(err, req, res);
    }
  });
}
