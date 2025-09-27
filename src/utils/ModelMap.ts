import { Model } from 'mongoose';
import User from '../modules/auth/models/User';
import AdminModel from '../modules/profiles/admin/model/AdminModel';
import Ministry from '../models/Ministry';

export type ModelKey = 'auth' | 'admin' | 'ministry';

export const ModelMap: Record<ModelKey, any> = {
  auth: User,
  admin: AdminModel,
  ministry: Ministry,
};
