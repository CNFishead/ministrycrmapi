import { Model } from 'mongoose';
import User from '../modules/auth/models/User';
import AdminModel from '../modules/profiles/admin/model/AdminModel';

export type ModelKey = 'auth' | 'admin';

export const ModelMap: Record<ModelKey, any> = {
  auth: User,
  admin: AdminModel,
};
