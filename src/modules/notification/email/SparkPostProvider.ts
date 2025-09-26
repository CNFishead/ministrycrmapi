// modules/notification/email/SparkPostProvider.ts
import SparkPost from 'sparkpost';
import { EmailPayload, EmailProvider } from './EmailProvider';
import { ErrorUtil } from '../../../middleware/ErrorUtil';

export class SparkPostProvider implements EmailProvider {
  private client: SparkPost;

  constructor() {
    const apiKey = process.env.SPARKPOST_API_KEY;
    if (!apiKey) {
      throw new Error('SPARKPOST_API_KEY environment variable is required');
    }

    this.client = new SparkPost(apiKey);
  }

  async sendEmail({ to, subject, html, from, data, templateId }: EmailPayload): Promise<void> {
    try {
      const transmission: any = {
        recipients: [{ address: to }],
        content: {
          from: from || 'noreply@shepherdcms.com',
          subject,
        },
      };

      if (templateId) {
        // Use template-based sending
        transmission.content.template_id = templateId;
        if (data) {
          transmission.substitution_data = data;
        }
      } else if (html) {
        // Use HTML content
        transmission.content.html = html;
      } else {
        throw new ErrorUtil('Either html or templateId must be provided for sending email.', 400);
      }

      await this.client.transmissions.send(transmission);

      console.log(`[SparkPostProvider] Email sent successfully to ${to}`);
    } catch (error: any) {
      console.error(`[SparkPostProvider] Failed to send email to ${to}:`, error);
      throw new ErrorUtil(`Failed to send email: ${error.message}`, 500);
    }
  }
}
