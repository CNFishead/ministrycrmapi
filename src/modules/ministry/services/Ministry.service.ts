import { Request, Response } from 'express';
import asyncHandler from '../../../middleware/asyncHandler';
import { CRUDService } from '../../../utils/baseCRUD';
import { MinistryHandler } from '../handlers/Ministry.handler';
import error from '../../../middleware/error';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import { ModelKey, ModelMap } from '../../../utils/ModelMap';
import { eventBus } from '../../../lib/eventBus';

export class MinistryService extends CRUDService {
  private modelMap: Record<ModelKey, any> = ModelMap;
  constructor() {
    super(MinistryHandler);
  }

  public getMinistryForProfile = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        const profileId = req.params.profileId;
        if (!profileId) {
          return res.status(400).json({ success: false, message: 'Profile ID is required' });
        }

        const ministry = await this.handler.getMinistryForProfile(profileId);
        return res.status(200).json({ success: true, payload: ministry });
      } catch (err: any) {
        console.error(err);
        return error(err, req, res, null);
      }
    }
  );
  public inviteUserToMinistry = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
      try {
        // get the team profile
        const team = await this.handler.fetch(req.params.id);
        if (!team) {
          return res.status(404).json({ message: 'Team not found' });
        }

        // create a token hash in the database
        const { token } = await this.modelMap['token'].issue({
          type: 'TEAM_INVITE',
          email: req.body.inviteeEmail,
          teamProfileId: team._id,
          ttlMs: 48 * 60 * 60 * 1000, // 48 hours
        });

        // send invitation email through the email service
        eventBus.publish('team.invited', {
          profile: team,
          invitationData: req.body,
          additionalData: { token },
        });

        return res.status(200).json({ message: 'User invited to team successfully' });
      } catch (err) {
        console.error('Error inviting user to team:', err);
        return error(err, req, res);
      }
    }
  );
}
