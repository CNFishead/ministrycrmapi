import { SupportHandler } from '../handlers/SupportHandler'; 
import { CRUDService } from '../../../utils/baseCRUD';

export default class SupportService extends CRUDService {
  constructor() {
    super(SupportHandler);
    this.queryKeys = ['requesterDetails.email', 'requesterDetails.fullName', 'subject', 'tags'];
  }
}
