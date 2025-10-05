import User from '../modules/auth/models/User';
import AdminModel from '../modules/profiles/admin/model/AdminModel';
import BillingAccount from '../modules/auth/models/BillingAccount';
import MinistryModel from '../modules/ministry/models/Ministry.model';
import MemberModel from '../modules/ministry/models/Member.model';
import PartnerSchema from '../models/PartnerSchema';
import Token from '../modules/auth/models/TokenSchema';
import CheckInRecord from '../modules/ministry/models/CheckInRecord';
import CheckInSummary from '../modules/ministry/models/CheckInSummary';
import Receipt from '../modules/payment/models/Receipt';

export type ModelKey =
  | 'auth'
  | 'admin'
  | 'ministry'
  | 'member'
  | 'billing'
  | 'partner'
  | 'token'
  | 'check-rec'
  | 'check-sum'
  | 'receipt';

export const ModelMap: Record<ModelKey, any> = {
  auth: User,
  admin: AdminModel,
  ministry: MinistryModel,
  member: MemberModel,
  billing: BillingAccount,
  partner: PartnerSchema,
  token: Token,
  'check-rec': CheckInRecord,
  'check-sum': CheckInSummary,
  receipt: Receipt,
};
