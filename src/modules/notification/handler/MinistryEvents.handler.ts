import { ErrorUtil } from '../../../middleware/ErrorUtil';
import { EmailService } from '../email/EmailService';
import Notification from '../model/Notification';

export default class MinistryEventsHandler {
  async onMinistryInvited(event: { profile: any; invitationData: any; additionalData: any }) {
    const { profile, invitationData, additionalData } = event;
    console.info(`[Notification] - Ministry Invited: ${profile.name}`);
    // Send invitation email
    await EmailService.sendEmail({
      to: invitationData.inviteeEmail,
      subject: 'You Have Been Invited to Join a Ministry',
      templateId: 'invite-team-member', // Assuming a template ID for ministry invitations
      data: {
        inviteeName: invitationData.inviteeName,
        inviterMessage: invitationData.inviteMessage,
        ministryName: profile.name,
        inviteUrl: `${process.env.AUTH_URL}/signup?token=${additionalData.token}`,
        expiresInHours: 48,
        supportEmail: 'support@shepherdcms.org',
        logoUrl: 'https://res.cloudinary.com/wulfdev/image/upload/v1760816772/ShepherdsCMSLogo_p3ipxo.png',
        year: new Date().getFullYear(),
        subject: `You Have Been Invited to Join the ${profile.name} Ministry`,
      },
    });
  }
  

  async onTeamInvitedToken(event: { userId: string; teamId: string }) {
    const { userId, teamId } = event;
    console.info(`[Notification] - User used token to claim profile - User ID: ${userId}, Team ID: ${teamId}`);
    // Send notification to the user
    await Notification.insertNotification(userId as any, null as any, 'You have successfully joined the team.', null as any, 'system', teamId as any);
  }
}
