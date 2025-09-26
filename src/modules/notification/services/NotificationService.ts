// modules/notification/NotificationService.ts
import { EmailService } from '../email/EmailService';
import NAuthService from './NAuthService';
import NSupportService from './NSupportService';
import NUserService from './NUserService';

export default class NotificationService {
  constructor(
    private readonly nauthService: NAuthService = new NAuthService(),
    private readonly nticketService: NSupportService = new NSupportService(),
    private readonly nuserService: NUserService = new NUserService()
  ) {}
  public init() {
    EmailService.init('sendgrid');
    this.nauthService.init();
    this.nticketService.init();
    this.nuserService.init();
  }
}
