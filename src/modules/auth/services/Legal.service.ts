import { CRUDService } from '../../../utils/baseCRUD';
import { LegalHandler } from '../handlers/Legal.handler';

export default class LegalService extends CRUDService {
  constructor() {
    super(LegalHandler);
    this.requiresAuth = {
      getResource: false,
      getResources: false,
      create: true,
      updateResource: true,
      removeResource: true,
    };
    this.queryKeys = ['title'];
  }
}
