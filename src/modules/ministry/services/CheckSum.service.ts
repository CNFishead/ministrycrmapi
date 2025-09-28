import { CRUDService } from '../../../utils/baseCRUD';
import { CheckSumHandler } from '../handlers/CheckSum.handler';

export class CheckSumService extends CRUDService {
  constructor() {
    super(CheckSumHandler);
  }
}
