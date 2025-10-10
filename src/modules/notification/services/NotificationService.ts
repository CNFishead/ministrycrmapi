// modules/notification/NotificationService.ts
import { EmailService } from '../email/EmailService';
import NAuthService from './NAuthService';
import NMinistryEventService from './NMinistryEvent.service';
import NSupportService from './NSupportService';
import NUserService from './NUserService';

export default class NotificationService {
  constructor(
    private readonly nauthService: NAuthService = new NAuthService(),
    private readonly nticketService: NSupportService = new NSupportService(),
    private readonly nuserService: NUserService = new NUserService(),
    private readonly nministryEventService: NMinistryEventService = new NMinistryEventService()
  ) {}
  public init() {
    EmailService.init('sparkpost');
    this.nauthService.init();
    this.nticketService.init();
    this.nuserService.init();
    this.nministryEventService.init();
  }
}
