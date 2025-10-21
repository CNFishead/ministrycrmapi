import { ErrorUtil } from '../../../middleware/ErrorUtil';
import { ModelKey, ModelMap } from '../../../utils/ModelMap';
import { UserType } from '../../auth/models/User';
import { EmailService } from '../email/EmailService';
import Notification from '../model/Notification';

export default class RegistrationEventHandler {
  private modelMap: Record<ModelKey, any> = ModelMap;
  async passwordResetCompleted(event: { user: UserType }) {
    const { user } = event;
    if (!user) {
      throw new ErrorUtil(
        'User data is required for password reset completion event handling',
        400
      );
    }
    console.log(`[Notification] Password reset completed for email: ${user.email}`);
    try {
      await EmailService.sendEmail({
        to: user.email,
        subject: 'Your Password Has Been Reset Successfully',
        templateId: 'd-100b051843c146f5b2e19633f004a15b',
        data: {
          firstName: user.firstName,
          currentYear: new Date().getFullYear(),
          subject: 'Your Password Has Been Reset Successfully',
        },
      });
    } catch (err: any) {
      console.error('Failed to send password reset completion email:', err);
      throw new ErrorUtil('Failed to send password reset completion email', 500);
    }
  }
  public emailVerification = async (event: any): Promise<void> => {
    try {
      const { user } = event;
      console.log(`[Notification] Email Verification for email: ${user.email}`);

      await EmailService.sendEmail({
        to: user.email,
        subject: 'Welcome to ShepherdCMS - Please Verify Your Email',
        templateId: 'verification-email',
        data: {
          firstName: user.firstName,
          currentYear: new Date().getFullYear(),
          verificationLink: process.env.AUTH_URL,
          token: event.emailVerificationToken,
          subject: 'Welcome to ShepherdCMS - Please Verify Your Email',
        },
      });
    } catch (err: any) {
      console.log(err.response.body.errors);
      throw new ErrorUtil('Failed to handle user verify email event', 500);
    }
  };

  async emailVerified(event: any): Promise<void> {
    const { user } = event;
    if (!user) {
      throw new Error('User data is required for email verification event handling');
    }

    // Logic to handle email verification, e.g., logging or sending a confirmation email
    console.log(`[Notification] Email verified for user: ${user.email}`);
    try {
      await Notification.insertNotification(
        user._id as any,
        null as any,
        'Your email has been successfully verified.',
        null as any,
        'system',
        null as any
      );
    } catch (err: any) {
      console.error('Failed to send email verification confirmation:', err);
      throw new ErrorUtil('Failed to send email verification confirmation', 500);
    }
  }

  async passwordReset(event: { email: string; token: string }): Promise<void> {
    const { email, token } = event;
    if (!email || !token) {
      throw new ErrorUtil('Email and token are required for password reset event handling', 400);
    }
    console.log(`[Notification] Password reset requested for email: ${email}`);
    // build the reset url
    const resetUrl = `${process.env.FRONTEND_AUTH_URL}/reset-password?token=${token}`;
    try {
      await EmailService.sendEmail({
        to: email,
        subject: 'Password Reset Request',
        templateId: 'd-a10af4698c09420fbd7c766a1ca1a99e',
        data: {
          resetLink: resetUrl,
          currentYear: new Date().getFullYear(),
          subject: 'Password Reset Request',
          expirationTime: '10 minutes',
        },
      });
    } catch (err: any) {
      console.error('Failed to send password reset email:', err);
      throw new ErrorUtil('Failed to send password reset email', 500);
    }
  }

  userRegistered = async (event: { user: UserType }): Promise<void> => {
    try {
      const { user } = event;
      if (!user) {
        throw new ErrorUtil('User data is required for user registration event handling', 400);
      }
      console.log(`[Notification] New user registered with email: ${user.email}`);
      await EmailService.sendEmail({
        to: user.email,
        subject: 'Welcome to ShepherdCMS',
        templateId: 'registration-email',
        data: {
          name: user.fullName,
          subject: 'Welcome to ShepherdCMS',
        },
      });

      const admin = await this.modelMap['admin'].findOne({
        role: { $in: ['admin', 'superadmin'] },
      });
      if (admin) {
        await EmailService.sendEmail({
          to: admin.email,
          subject: 'New User Registration',
          templateId: 'admin-new-user',
          data: { name: admin.fullName, subject: 'New User Registration', user: user.fullName },
        });
      }
    } catch (error) {
      console.error('Failed to send user registration email:', error);
      throw new ErrorUtil('Failed to send user registration email', 500);
    }
  };
}
