import mongoose from 'mongoose';

const SupportGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    
  },
  {
    timestamps: true,
  }
);

const SupportGroup = mongoose.model('SupportGroup', SupportGroupSchema);

export default SupportGroup;
