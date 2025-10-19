import { ErrorUtil } from '../../../middleware/ErrorUtil';
import { CRUDHandler, PaginationOptions } from '../../../utils/baseCRUD';
import { BillingValidator } from '../../../utils/billingValidation';
import { ModelKey, ModelMap } from '../../../utils/ModelMap';
import MinistryModel, { IMinistry } from '../models/Ministry.model';

export class MinistryHandler extends CRUDHandler<IMinistry> {
  private modelMap: Record<ModelKey, any> = ModelMap;
  private checkSumHandler: any;

  constructor() {
    super(MinistryModel);
    // Import CheckSumHandler dynamically to avoid circular dependencies
    const { CheckSumHandler } = require('./CheckSum.handler');
    this.checkSumHandler = new CheckSumHandler();
  }

  // fetch a ministry for a profile, this will include whether or not the selected profile needs to complete
  // billing setup
  async getMinistryForProfile(profileId: string) {
    const ministry = await this.Schema.findOne({
      linkedUsers: {
        $elemMatch: { user: profileId },
      },
    })
      .populate({
        path: 'linkedUsers.user',
        model: 'User',
      })
      .lean();
    if (!ministry) {
      throw new ErrorUtil('Ministry not found', 404);
    }

    // find the billing profile for the ministry
    const billing = await this.modelMap['billing'].findOne({ profileId: ministry._id }).lean();
    const billingValidation = BillingValidator.validateBillingAccount(billing);
    return {
      ...ministry,
      needsBillingSetup: billingValidation.needsUpdate,
      billingValidation,
    } as any as IMinistry;
  }
  async fetchAll(options: PaginationOptions): Promise<{ entries: any[]; metadata: any[] }[]> {
    return await this.Schema.aggregate([
      {
        $match: {
          $and: [...options.filters],
          ...(options.query.length > 0 && { $or: options.query }),
        },
      },
      {
        $sort: options.sort,
      },
      {
        $facet: {
          metadata: [
            { $count: 'totalCount' },
            { $addFields: { page: options.page, limit: options.limit } },
          ],
          entries: [
            { $skip: (options.page - 1) * options.limit },
            { $limit: options.limit },
            {
              $lookup: {
                from: 'members',
                localField: 'leader',
                foreignField: '_id',
                as: 'leader',
              },
            },
            {
              $unwind: {
                path: '$leader',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
    ]);
  }

  async fetch(id: string): Promise<any | null> {
    return await this.Schema.findById(id)
      .populate('leader')
      .populate('admins')
      .populate('members')
      .lean();
  }

  async attach(id: string, userId: string, data: any): Promise<void> {
    // Check if user is already linked to this ministry
    const existingLink = await this.Schema.findOne({
      _id: id,
      linkedUsers: { $elemMatch: { user: userId } },
    });

    if (existingLink) {
      console.info(`[ProfileHandler]: User ${userId} is already linked to ministry ${id}`);

      await this.modelMap['auth'].findByIdAndUpdate(userId, {
        $set: { 'profileRefs.ministry': id },
      });

      return;
    }

    await this.Schema.findByIdAndUpdate(id, {
      $addToSet: {
        linkedUsers: {
          user: userId,
          role: data.role || 'member',
        },
      },
    });
  }

  /**
   * @description Fetches attendance data for a ministry within a date range
   * @param ministryId - The ID of the ministry to fetch attendance data for
   * @param startDate - Optional start date for filtering attendance data
   * @param endDate - Optional end date for filtering attendance data
   * @returns Array of attendance data with dates and check-in counts
   */
  async attendanceData(ministryId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    console.log(`[MinistryHandler] Fetching attendance data for ministry: ${ministryId}`);

    try {
      // Build filter options for the ministry and optional date range
      const filters: any[] = [{ ministry: ministryId }];

      if (startDate || endDate) {
        const dateFilter: any = {};
        if (startDate) {
          dateFilter.$gte = startDate;
        }
        if (endDate) {
          dateFilter.$lte = endDate;
        }
        filters.push({ date: dateFilter });
      }

      // Use the CheckSumHandler to fetch data with consistent filtering logic
      const [result] = await this.checkSumHandler.fetchAll({
        filters,
        sort: { date: 1 },
        query: [], // No keyword search needed for this use case
        page: 1,
        limit: 1000, // High limit to get all data within date range
      });

      console.log(`[MinistryHandler] Retrieved ${result.entries.length} attendance records`);

      return result.entries;
    } catch (error: any) {
      console.error(`[MinistryHandler] Error fetching attendance data:`, error);
      throw new ErrorUtil(`Failed to fetch attendance data: ${error.message}`, 500);
    }
  }
}
