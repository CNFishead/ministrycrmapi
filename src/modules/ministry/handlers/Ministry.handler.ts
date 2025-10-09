import { ErrorUtil } from '../../../middleware/ErrorUtil';
import { CRUDHandler, PaginationOptions } from '../../../utils/baseCRUD';
import { BillingValidator } from '../../../utils/billingValidation';
import { ModelKey, ModelMap } from '../../../utils/ModelMap';
import MinistryModel, { IMinistry } from '../models/Ministry.model';

export class MinistryHandler extends CRUDHandler<IMinistry> {
  private modelMap: Record<ModelKey, any> = ModelMap;
  constructor() {
    super(MinistryModel);
  }

  // fetch a ministry for a profile, this will include whether or not the selected profile needs to complete
  // billing setup
  async getMinistryForProfile(profileId: string) {
    const ministry = await this.Schema.findOne({
      admins: {
        $in: [profileId],
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

  async attach(id: string, userId: string): Promise<void> {
    // Check if user is already linked to this ministry
    const existingLink = await this.Schema.findOne({
      _id: id,
      admins: { $in: [userId] },
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
          role: 'member',
        },
      },
    });
    await this.modelMap['admin'].findByIdAndUpdate(userId, {
      $set: { 'profileRefs.ministry': id },
    });
  }
}
