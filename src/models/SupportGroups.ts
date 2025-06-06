import mongoose from 'mongoose';
import UserType from '../types/UserType';
import { SupportType } from './Support';

export type SupportGroupType = {
  name: string;
  agents: UserType[];
  tickets: SupportType[];
  isActive: boolean;
};

const SupportGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    agents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Support',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SupportGroup = mongoose.model('SupportGroup', SupportGroupSchema);

export default SupportGroup;
