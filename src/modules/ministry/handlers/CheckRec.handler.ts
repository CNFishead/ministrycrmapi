import { CRUDHandler } from '../../../utils/baseCRUD'; 
import CheckInRecord, { ICheckInRecord } from '../models/CheckInRecord';

export class CheckRecHandler extends CRUDHandler<ICheckInRecord> {
  constructor() {
    super(CheckInRecord);
  }
}
