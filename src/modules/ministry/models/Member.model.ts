import mongoose, { ObjectId } from 'mongoose'; 
 
export interface IMember extends mongoose.Document {
  _id: ObjectId | string;
  user: ObjectId;
  firstName: string;
  lastName: string;
  ministry: ObjectId[]; // user can be in multiple ministries
  mainMinistry: ObjectId; // user can only belong to one main ministry, i.e. the church.
  profileImageUrl: string;
  sex: string;
  email: string;
  phoneNumber: string;
  role: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    address2: string;
  };
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  birthday: Date;
  dateLastVisited: Date;
}

const MemberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please add a name'],
      // trim
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastName: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      default: 'single',
    },
    family: {
      // reference to what family this member belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
    },
    ministry: [
      {
        // reference to what ministry this member belongs to
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ministry',
      },
    ],
    mainMinistry: {
      // reference to what ministry this member belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ministry',
    },
    profileImageUrl: {
      type: String,
      default: '/images/no-photo.png',
    },
    sex: {
      type: String,
      enum: ['male', 'female'],
      default: 'male',
    },
    email: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
    },
    location: {
      address: {
        type: String,
        trim: true,
      },
      address2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
      },
    },
    // Family is an array of Members who belong to the same family.
    // its a m
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'member',
    },
    fullName: {
      type: String,
    },
    unsubscribeFromEmails: {
      type: Boolean,
      default: false,
    },
    birthday: {
      type: Date,
    },
    isChild: {
      type: Boolean,
      default: false,
    },
    dateLastVisited: {
      type: Date,
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// creates the fullName field.
MemberSchema.pre('save', async function () {
  // last name could be undefined, so we check for that
  this.fullName = this.firstName + ' ' + this.lastName;
});

// enforces that the email string be lower case throughout, as if it isnt, a user with
// test@email.com and a user Test@email.com do not match, and you can end up with duplicate emails..
MemberSchema.pre('save', async function (next) {
  this.email = this.email?.toLowerCase();
  next();
});

export default mongoose.model<IMember>('Member', MemberSchema);
