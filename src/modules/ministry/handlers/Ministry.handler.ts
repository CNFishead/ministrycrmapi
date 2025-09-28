import { ErrorUtil } from '../../../middleware/ErrorUtil';
import { CRUDHandler } from '../../../utils/baseCRUD';
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
    const ministry = await this.Schema.findOne({ _id: profileId }).lean();
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
}
