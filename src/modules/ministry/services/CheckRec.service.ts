import { CRUDService } from '../../../utils/baseCRUD'; 
import { CheckRecHandler } from '../handlers/CheckRec.handler'; 

export class CheckRecService extends CRUDService {
  constructor() {
    super(CheckRecHandler);
  }
}
