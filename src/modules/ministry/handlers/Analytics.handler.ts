import { ModelKey, ModelMap } from '../../../utils/ModelMap';
import { IMember } from '../models/Member.model';

export class AnalyticsHandler {
  private modelMap: Record<ModelKey, any> = ModelMap;
  // Define your static methods here
  public getMinistryAttendanceData(req: Request): Promise<any> {
    // Implement your logic to fetch ministry attendance data
    return Promise.resolve({}); // Replace with actual data fetching logic
  }

  public async getGenderDistribution(members: IMember[]): Promise<any> {
    return this.modelMap['member'].aggregate([
      {
        $match: { _id: { $in: members } },
      },
      {
        $group: {
          _id: '$sex',
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
