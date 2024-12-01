import mongoose from 'mongoose';

const SupportSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subject: {
      type: String,
      required: true,
    },
    messages: [
      {
        message: {
          type: String,
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        date: {
          type: Date,
          default: Date.now,
        },
        attachments: [
          {
            filename: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ['open', 'closed', 'pending', 'solved', 'spam', 'trash'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'low',
    },
    category: {
      type: String,
      enum: ['general', 'technical', 'billing', 'other'],
      default: 'general',
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: [
      {
        comment: {
          type: String,
        },
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    due_date: {
      type: Date,
      // default date to 3 days from ticket open
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date;
      },
    },
    linkedTickets: [
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

const Support = mongoose.model('Support', SupportSchema);

export default Support;
