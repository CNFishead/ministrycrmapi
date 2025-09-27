import { CRUDService } from '../../../utils/baseCRUD'; 
import { MemberHandler } from '../handlers/Member.handler';

export class MemberService extends CRUDService {
  constructor() {
    super(MemberHandler);
  }
}
