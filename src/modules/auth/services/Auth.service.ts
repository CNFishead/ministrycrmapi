import { Request, Response } from 'express';
import { RegisterHandler } from '../handlers/Register.handler';
import { eventBus } from '../../../lib/eventBus';
import { AuthenticationHandler } from '../handlers/Authentication.handler';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import { PasswordRecoveryHandler } from '../handlers/PasswordRecovery.handler';
import error from '../../../middleware/error';
import asyncHandler from '../../../middleware/asyncHandler';

export default class AuthService {
  constructor(
    private readonly authHandler: AuthenticationHandler = new AuthenticationHandler(),
    private readonly passwordRecoveryHandler: PasswordRecoveryHandler = new PasswordRecoveryHandler(),
    private readonly registerHandler: RegisterHandler = new RegisterHandler()
  ) {}

  public register = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.registerHandler.execute(req.body);

      eventBus.publish('email.verify', {
        user: result.user,
      });

      result.user = null;
      return res.status(201).json(result);
    } catch (err: any) {
      return error(err, req, res);
    }
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.authHandler.login(req);
      return res.status(200).json(result);
    } catch (err: any) {
      return error(err, req, res);
    }
  });

  public getMe = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.authHandler.getMe(req as AuthenticatedRequest);
      return res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      console.log(err);
      return error(err, req, res);
    }
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.passwordRecoveryHandler.requestReset(req.body.email);

      // Only emit event if a user was found and token generated
      if (result.success) {
        eventBus.publish('password.reset.requested', {
          email: result.email!,
          token: result.token!,
        });
      }

      return res.status(200).json({ message: 'Recovery email sent' });
    } catch (err: any) {
      return error(err, req, res);
    }
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const { token, password } = req.body;
      const user = await this.passwordRecoveryHandler.resetPassword(token, password);
      // Emit event for password reset
      eventBus.publish('password.reset.complete', {
        user,
      });
      return res.status(200).json({ message: 'Password reset successful' });
    } catch (err: any) {
      return error(err, req, res);
    }
  });

  public verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.registerHandler.verifyEmail(req.body.token as any);

      // Emit event for email verification
      eventBus.publish('email.verified', {
        user: result.user,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return error(err, req, res);
    }
  });

  public resendVerificationEmail = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const result = await this.registerHandler.setEmailVerificationToken(email);

      // Emit event for resending verification email
      eventBus.publish('email.verify', {
        user: result.user,
      });

      return res
        .status(200)
        .json({ success: true, message: 'Verification email sent', token: result.token });
    } catch (err: any) {
      return error(err, req, res);
    }
  });

  public recaptcha = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.authHandler.recaptchaVerify(req);
      return res.status(200).json(result);
    } catch (err: any) {
      return error(err, req, res);
    }
  });

  public checkEmail = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // const exists = await this.authHandler.checkEmailExists(email);
      return res.status(200).json({
        // exists
      });
    } catch (err: any) {
      return error(err, req, res);
    }
  });
}
