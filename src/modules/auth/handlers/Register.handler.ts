import { UserType } from '../models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RoleRegistry } from '../utils/RoleRegistry';
import BillingAccount, { BillingAccountType } from '../models/BillingAccount';
import slugify from 'slugify';
import Notification from '../../notification/model/Notification';
import { ErrorUtil } from '../../../middleware/ErrorUtil';
import { ModelMap } from '../../../utils/ModelMap';
import Token from '../models/TokenSchema';
import Ministry from '../../../models/Ministry';
import Member from '../../../models/Member';
import PartnerSchema from '../../../models/PartnerSchema';

type RegisterInput = {
  userInfo: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    [key: string]: any;
  };
  ministryInfo: {
    name: string;
    description?: string;
    donationLink?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    ministryType?: string;
    ministryImageUrl?: string;
    [key: string]: any;
  };
  features?: string[];
  partnerid?: string;
  [key: string]: any;
};

export class RegisterHandler {
  private user!: any;
  private member!: any;
  private ministry!: any;
  private profileRefs: Record<string, string | null> = {};
  private customerCreated = false;
  private data!: RegisterInput;
  private billingAccount!: BillingAccountType;
  private modelMap: Record<string, any>;

  /**
   * @description Initializes the RegisterHandler with user data.
   * @param data - An object containing email, password, and roles of the user.
   */
  constructor() {
    this.modelMap = ModelMap;
  }

  /**
   * @description Executes the registration process by creating a user and their profiles, and generating a JWT token.
   * @returns {Promise<{token: string, profileRefs: Record<string, string | null>, billing: {status: string, requiresVaultSetup: boolean}}>}
   * @throws {Error} If any step in the registration process fails.
   */
  public async execute(data: RegisterInput): Promise<{
    user: any;
    token: string;
    profileRefs?: Record<string, string | null>; 
  }> {
    try {
      this.data = data;
      // await this.validatePartner(); // Temporarily disabled since we have no partners
      await this.createUser();
      await this.createMember();
      await this.createMinistry();
      await this.createBillingAccount(this.ministry._id.toString(), 'ministry');
      // await this.createProfiles();

      const token = jwt.sign(
        {
          userId: this.user._id,
          roles: this.data.roles,
          profileRefs: this.profileRefs,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      // query the admin table to get all admins and populate their emails
      // role is an array of strings, so we need to use $in operator
      const admins = await this.modelMap['admin'].find({ role: { $in: ['admin'] } });

      // for each admin, create a notification in the system
      for (const admin of admins) {
        await Notification.insertNotification(
          admin._id as any,
          null as any, // switch this to a centralized admin user id later
          'Registration Event',
          `New user registered: ${this.user.email}`,
          `user_registered`,
          this.user._id as any
        );
      }
      const result = {
        token,
        profileRefs: this.profileRefs, 
        user: this.user,
      };

      // Reset state after successful execution
      this.resetState();

      return result;
    } catch (error: any) {
      console.log(`[RegistrationHandler] Registration failed:`, error);
      // Reset state after failed execution
      this.resetState();
      await this.cleanupOnFailure();
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * @description Validates that the partner is authorized to create an account.
   * @throws {Error} If the partner is not found or not authorized.
   */
  private async validatePartner() {
    const partnerid = String(
      this.data.partnerid ? this.data.partnerid : process.env.SHEPHERD_PARTNER_KEY
    );

    const [partner] = await PartnerSchema.aggregate([
      {
        $match: {
          // can be the id, or the businessName
          $or: [
            {
              businessName: {
                $regex: partnerid,
                $options: 'i',
              },
            },
            // if the partnerid is a valid mongoose object id, then we will match it to the _id
            ...(mongoose.Types.ObjectId.isValid(partnerid)
              ? [{ _id: mongoose.Types.ObjectId.createFromHexString(partnerid) }]
              : []),
          ],
        },
      },
    ]);

    if (!partner) {
      throw new Error("You're not Authorized to post to this form.");
    }
  }

  /**
   * @description Creates a new user in the database. It checks if the email is already registered and hashes the password before saving.
   * @throws {Error} If the email is already registered.
   */
  private async createUser() {
    console.log(
      `[RegistrationHandler] attempting to create user with email: ${this.data.userInfo.email}`
    );

    const existingUser = await this.modelMap['auth'].findOne({ email: this.data.userInfo.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // create a slug of the user's full name
    const fullName = `${this.data.userInfo.firstName} ${this.data.userInfo.lastName || ''}`.trim();
    const sluggedName = slugify(fullName, {
      lower: true,
      strict: true, // removes special characters
      trim: true, // removes leading and trailing whitespace
    });

    this.user = await this.modelMap['auth'].create(this.data.userInfo);

    // create a token for email verification
    const { token } = await Token.issue({
      type: 'EMAIL_VERIFY',
      email: this.user.email,
      ttlMs: 3600000, // 1 hour
      uniquePerSubject: true,
      meta: { purpose: 'Verify email address' },
    });

    this.user.emailVerificationToken = token; // so we can pass this to the email service.

    // unique tail to the access key to avoid collisions
    const uniqueTail = this.user._id.toString().slice(-6);
    this.user.accessKey = `${sluggedName}-${uniqueTail}`;
  }

  /**
   * @description Creates a member document associated with the user.
   * @throws {Error} If the member creation fails.
   */
  private async createMember() {
    this.member = await Member.create({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      user: this.user._id,
      ...this.data.ministryInfo, // Include any additional ministry-related member info
    });
  }

  /**
   * @description Creates the main ministry for the user.
   * @throws {Error} If the ministry creation fails.
   */
  private async createMinistry() {
    this.ministry = await Ministry.create({
      leader: this.member._id,
      ...this.data.ministryInfo,
      isMainMinistry: true,
      features: this.data.features,
      user: this.user._id,
      admins: [this.user._id],
    });

    if (!this.ministry) {
      throw new Error('Error Creating Ministry');
    }
  }

  /**
   * @description Creates profiles for the user based on their roles. Each role has a specific profile creator that handles the profile creation logic.
   * @throws {Error} If any profile creation fails, it will clean up the user and any created profiles.
   */
  private async createProfiles() {
      try {
      } catch (err) {
        console.log(`[RegistrationHandler] Failed to create profile:`, err);
        await this.cleanupOnFailure();
        throw new Error(`Failed to create profile`);
      }

    // Set both profileRefs and accessKey, then save only once
    this.user.profileRefs = this.profileRefs;
    await this.user.save();
  }

  /**
   * @description Creates a billing account for the ministry. The ministry serves as the profile and the user is the payor responsible for payments.
   * @throws {Error} If the billing account creation fails.
   * @param profileId - The ID of the ministry for which the billing account is being created.
   * @param role - The role/type of the profile (ministry).
   */
  private async createBillingAccount(profileId: string, role: string) {
    console.log(`[RegistrationHandler] Creating billing account for ministry ${profileId}...`);
    try {
      this.billingAccount = await BillingAccount.create({
        profileId,
        profileType: role,
        email: this.data.userInfo.email,
        status: 'active',
        vaulted: false,
        payor: this.user._id,
      });
      console.log(
        `[RegistrationHandler] Billing account created for ministry ${profileId} with payor ${this.user._id}`
      );
    } catch (error: any) {
      console.error(
        `[RegistrationHandler] Failed to create billing account for ministry ${profileId}:`,
        error
      );
      throw new Error(`Failed to create billing account: ${error.message}`);
    }
  }

  /**
   * @description Cleans up the user and their profiles if any step in the registration process fails.
   * This ensures that no partial data is left in the database.
   */
  private async cleanupOnFailure() {
    const cleanupPromises = [
      this.user?._id && this.modelMap['auth'].findByIdAndDelete(this.user._id),
      this.member?._id && Member.findByIdAndDelete(this.member._id),
      this.ministry?._id && Ministry.findByIdAndDelete(this.ministry._id),
      this.billingAccount?._id && BillingAccount.findByIdAndDelete(this.billingAccount._id),
    ].filter(Boolean); // Remove null/undefined promises

    // Add profile cleanup if they exist
    if (this.user?.profileRefs) {
      cleanupPromises.push(
        ...Object.entries(this.user.profileRefs)
          .filter(([_, pid]) => !!pid) // filter out any null or undefined profile IDs
          .map(([role, pid]) => mongoose.model(role).findByIdAndDelete(pid)) // delete profiles by role
      );
    }

    await Promise.all(cleanupPromises);
  }

  /**
   * @Description checks if the email is already registered in the system.
   * @param email - The email to check for registration.
   */
  public async isEmailRegistered(email: string): Promise<boolean> {
    const user = await this.modelMap['auth'].findOne({ email }).lean();
    return !!user;
  }

  /**
   * @description Sets verification token and expiration for email verification.
   * @param email - The email to set the verification token for.
   */
  public async setEmailVerificationToken(
    email: string
  ): Promise<{ token: string; user: UserType }> {
    const user = await this.modelMap['auth'].findOne({ email });
    if (!user) throw new Error('User not found');

    // Use the Token schema to issue a new email verification token
    const { token } = await Token.issue({
      userId: user._id,
      type: 'EMAIL_VERIFY',
      email: user.email,
      ttlMs: 3600000, // 1 hour
      uniquePerSubject: true,
      meta: { purpose: 'Verify email address' },
    });

    return { token, user };
  }

  /**
   * @description Verifies the user's email using the provided token.
   * @param token - The verification token sent to the user's email.
   */
  public async verifyEmail(token: string): Promise<{ message: string; user: UserType }> {
    // Validate the token using the TokenSchema system
    const tokenDoc = await Token.validateRaw({ rawToken: token, type: 'EMAIL_VERIFY' });
    if (!tokenDoc) throw new ErrorUtil('Invalid or expired token', 400);

    // Get the user from the token document
    const user = await this.modelMap['auth'].findById(tokenDoc.user);
    if (!user) throw new ErrorUtil('User not found', 400);

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    // Consume the token so it can't be used again
    await Token.consume(tokenDoc._id as mongoose.Types.ObjectId);

    return { message: 'Email verified successfully', user };
  }

  /**
   * @description Resets all instance state to prevent data bleeding between registrations.
   * This should be called after each execute() call, whether successful or failed.
   */
  private resetState(): void {
    this.user = undefined;
    this.member = undefined;
    this.ministry = undefined;
    this.profileRefs = {};
    this.customerCreated = false;
    this.data = undefined as any;
    this.billingAccount = undefined as any;
  }
}
