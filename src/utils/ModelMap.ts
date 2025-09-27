import User from '../modules/auth/models/User';
import AdminModel from '../modules/profiles/admin/model/AdminModel';
import Member from '../models/Member';
import BillingAccount from '../modules/auth/models/BillingAccount';
import MinistryModel from '../modules/ministry/models/Ministry.model';

export type ModelKey = 'auth' | 'admin' | 'ministry' | 'member' | 'billing';

export const ModelMap: Record<ModelKey, any> = {
  auth: User,
  admin: AdminModel,
  ministry: MinistryModel,
  member: Member,
  billing: BillingAccount,
};
