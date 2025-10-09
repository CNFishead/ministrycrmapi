import { SupportHandler } from '../handlers/SupportHandler'; 
import { CRUDService } from '../../../utils/baseCRUD';

export default class SupportGroupService extends CRUDService {
  constructor() {
    super(SupportHandler);
    this.queryKeys = ['name'];
  }
}
