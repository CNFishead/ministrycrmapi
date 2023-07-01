import mongoose from "mongoose";
import MemberType from "../types/MemberType";

/**
 * @description - This is the member schema
 * @param {String} firstName - The users first name
 * @param {String} lastName - The users last name
 * @param {String} profileImageUrl - The users profile image url
 * @param {String} sex - The users sex male/female
 * @param {String} email - The users email
 * @param {String} password - The users password
 * @param {String} username - The users username
 * @param {String} phoneNumber - The users phone number
 * @param {String} role - The users role
 * @param {String} handler - The users handler (used for pretty urls)
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
const MemberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a name"],
      // trim
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    family: {
      // reference to what family this member belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
    },
    ministry: {
      // reference to what ministry this member belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ministry",
    },
    profileImageUrl: {
      type: String,
      default: "/images/no-photo.png",
    },
    sex: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    email: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
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
      default: "member",
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
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// creates the fullName field.
MemberSchema.pre("save", async function () {
  // last name could be undefined, so we check for that
  if (this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  } else {
    this.fullName = this.firstName;
  }
});

// enforces that the email string be lower case throughout, as if it isnt, a user with
// test@email.com and a user Test@email.com do not match, and you can end up with duplicate emails..
MemberSchema.pre("save", async function (next) {
  this.email = this.email?.toLowerCase();
  next();
});

export default mongoose.model<MemberType>("Member", MemberSchema);
