// modules/notification/NotificationService.ts
import { eventBus } from '../../../lib/eventBus';
import MinistryEventsHandler from '../handler/MinistryEvents.handler';
import SupportEventHandler from '../handler/SupportEvents.handler';

/**
 * @description - Handles the notification services related to ministry events.
 * @class NMinistryEventService
 */
export default class NMinistryEventService {
  constructor(private readonly handler: MinistryEventsHandler = new MinistryEventsHandler()) {}
  public init() {
    eventBus.subscribe('ministry.invited', this.handler.onMinistryInvited);
    eventBus.subscribe('ministry.team.invited', this.handler.onTeamInvitedToken);
  }
}
