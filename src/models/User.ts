import mongoose from 'mongoose';
import bcyrpt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserType from '../types/UserType';

/**
 * @description - This is the user schema
 * @param {String} firstName - The users first name
 * @param {String} lastName - The users last name
 * @param {String} profileImageUrl - The users profile image url
 * @param {String} sex - The users sex male/female
 * @param {String} email - The users email
 * @param {String} password - The users password
 * @param {String} username - The users username
 * @param {String} phoneNumber - The users phone number
 * @param {String} role - The users role
 * @param {String} address - The users address
 * @param {String} city - The users city
 * @param {String} state - The users state
 * @param {String} zip - The users zip
 * @param {String} country - The users country
 * @param {String} address2 - The users address2
 * @param {String} fullName - The users full name (first and last name)
 * @param {Boolean} isActive - If the user is active, if false the user will not be able to login
 * @param {Array} features - An array of features that the user has access to
 * @param {Date} initialPayment - The date the user made their initial payment
 * @param {Date} nextPayment - The date the user will make their next payment
 * @param {Date} createdAt - The date the user was created
 * @param {Date} updatedAt - The date the user was last updated
 * @param {Date} resetPasswordToken - The token used to reset the users password
 * @param {Date} resetPasswordExpire - The date the reset password token expires
 * @param {Number} credits - Credits towards the users account, used for subscriptions, etc
 *
 * @method getSignedJwtToken - This method returns a signed jwt token
 * @method getResetPasswordToken - This method returns a reset password token
 * @method matchPassword - This function matches a users password
 *
 */
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please add a name'],
    },
    customerId: {
      type: String,
    },
    lastName: {
      type: String,
    },
    features: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feature',
      },
    ],
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
      // match: [
      // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      // 'Please add a valid email',
      // ],
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 10,
      // match: [
      //   /^(?=\P{Ll}*\p{Ll})(?=\P{Lu}*\p{Lu})(?=\P{N}*\p{N})(?=[\p{L}\p{N}]*[^\p{L}\p{N}])[\s\S]{8,}$/,
      //   "Password Failed Validation",
      // ],
      select: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    nextPayment: {
      type: Date,
      // required: true,
    },
    address: {
      type: String,
    },
    address2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    country: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // role is an array of strings, that defaults to 'user', but can be values of 'admin', 'user', 'moderator', etc.
    role: [
      {
        type: String,
        default: 'user',
        enum: ['user', 'admin', 'moderator'],
      },
    ],

    fullName: {
      type: String,
    },
    unsubscribeFromEmails: {
      type: Boolean,
      default: false,
    },
    credits: {
      type: Number,
      default: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    birthday: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving new user
// Should hash the password on registration.
UserSchema.pre('save', async function (next) {
  //conditional will check to see if the password is being modified so it wont update the password constantly.
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcyrpt.genSalt(10);
  this.password = await bcyrpt.hash(this.password!, salt);
});

// creates the fullName field.
UserSchema.pre('save', async function () {
  this.fullName = this.firstName + ' ' + this.lastName;
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  // JWT_SECRET is an environment variable, use the ! to tell typescript that it will be there.
  // as this method requires the JWT_SECRET to be set, it cannot be null or undefined.
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcyrpt.compare(enteredPassword, this.password);
};
// enforces that the email string be lower case throughout, as if it isnt, a user with
// test@email.com and a user Test@email.com do not match, and you can end up with duplicate emails..
UserSchema.pre('save', async function (next) {
  this.email = this.email!.toLowerCase();
  next();
});

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = async function () {
  // Generate a token
  // this returns a buffer, we want to make it into a string
  const resetToken = crypto.randomBytes(20).toString('hex');
  // Hash token and set to resetPasswordToken field.
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration, 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  // save the user
  await this.save({ validateBeforeSave: true });
  return resetToken;
};
export default mongoose.model<UserType>('User', UserSchema);
