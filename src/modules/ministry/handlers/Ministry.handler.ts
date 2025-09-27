import { CRUDHandler } from '../../../utils/baseCRUD';
import MinistryModel, { IMinistry } from '../models/Ministry.model';

export class MinistryHandler extends CRUDHandler<IMinistry> {
  constructor() {
    super(MinistryModel);
  }
}
