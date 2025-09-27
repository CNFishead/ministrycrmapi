import { CRUDService } from '../../../utils/baseCRUD';
import { MinistryHandler } from '../handlers/Ministry.handler';

export class MinistryService extends CRUDService {
  constructor() {
    super(MinistryHandler);
  }
}
