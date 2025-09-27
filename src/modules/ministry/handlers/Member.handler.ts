import { CRUDHandler } from '../../../utils/baseCRUD';
import MemberModel, { IMember } from '../models/Member.model';

export class MemberHandler extends CRUDHandler<IMember> {
  constructor() {
    super(MemberModel);
  }
}
