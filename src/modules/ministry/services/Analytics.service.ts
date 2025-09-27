import { Response } from 'express';
import asyncHandler from '../../../middleware/asyncHandler';
import { CRUDService } from '../../../utils/baseCRUD';
import { MinistryHandler } from '../handlers/Ministry.handler';
import { AnalyticsHandler } from '../handlers/Analytics.handler';
import { MinistryService } from './Ministry.service';

export class AnalyticService {
  constructor(
    private readonly handler: AnalyticsHandler = new AnalyticsHandler(),
    private readonly ministryService: MinistryService = new MinistryService()
  ) {}

  public attendanceData = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.handler.getMinistryAttendanceData(req);
      return res.status(200).json({ success: true, payload: result });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  public genderDistribution = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      try {
        const { entries: ministries } = await this.ministryService.getResourcesData(req as any);
         
        if (!ministries.length) {
          return res.status(404).json({ 
            success: false, 
            message: 'No ministries found with the specified filters' 
          });
        }

        const targetMinistry = ministries[0];
        
        if (!targetMinistry.members || !targetMinistry.members.length) {
          return res.status(200).json({ 
            success: true, 
            payload: [],
            message: 'No members found in the ministry'
          });
        }

        const result = await this.handler.getGenderDistribution(targetMinistry.members as any[]);
        
        return res.status(200).json({ 
          success: true, 
          payload: result,
          metadata: {
            ministryId: targetMinistry._id,
            ministryName: targetMinistry.name,
            totalMembers: targetMinistry.members.length
          }
        });
      } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
      }
    }
  );
}
