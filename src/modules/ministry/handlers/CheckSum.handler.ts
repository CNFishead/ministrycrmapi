import { CRUDHandler, PaginationOptions } from '../../../utils/baseCRUD';
import CheckInSummary, { ICheckInSummary } from '../models/CheckInSummary';

export class CheckSumHandler extends CRUDHandler<ICheckInSummary> {
  constructor() {
    super(CheckInSummary);
  }

  async fetchAll(
    options: PaginationOptions
  ): Promise<{ entries: ICheckInSummary[]; metadata: any[] }[]> {
    return await this.Schema.aggregate([
      {
        $match: {
          $and: [...options.filters],
          ...(options.query.length > 0 && { $or: options.query }),
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          checkIns: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $facet: {
          metadata: [
            { $count: 'totalCount' },
            { $addFields: { page: options.page, limit: options.limit } },
          ],
          entries: [{ $skip: (options.page - 1) * options.limit }, { $limit: options.limit }],
        },
      },
    ]);
  }
}
