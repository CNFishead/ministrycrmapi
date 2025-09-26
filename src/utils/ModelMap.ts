import { Model } from 'mongoose';
import User from '../modules/auth/models/User';

export type ModelKey = 'auth';

export const ModelMap: Record<ModelKey, any> = {
  auth: User,
};
