import {
  activityRequestCreatedAudit,
  auditCreatedNotification,
  dealCreatedAudit,
  dealUpdatedAudit,
  generateUsersMentionedFromComment,
  generateUsersMentionedFromNote,
  ownerAddedAudit,
  sendActivityRequestCreatedEmail,
  sendCommentCreatedEmail,
  sendDealUpdatedEmail,
  sendFollowingEmail,
  sendOwnerAddedEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendReminderCreatedEmail,
  sendUserMentionedEmail,
  userMentionedAudit,
} from './tasks';
import { EventFn, EventName } from './types';

/**
 * Each event can perform multiple tasks (e.g. send email, send slack message, etc).
 *
 * Each task should be completely independent from another. These run in parallel,
 * NOT consecutive. Keep in mind, one task can be assigned to multiple events.
 */
export const subscriptions: {
  [T in EventName]: EventFn<T>[];
} = {
  ACTIVITY_CREATED: [],
  ACTIVITY_REQUEST_CREATED: [
    sendActivityRequestCreatedEmail,
    activityRequestCreatedAudit,
  ],
  AUDIT_CREATED: [auditCreatedNotification],
  COMMENT_CREATED: [sendCommentCreatedEmail, generateUsersMentionedFromComment],
  COMMENT_UPDATED: [generateUsersMentionedFromComment],
  DEAL_CREATED: [dealCreatedAudit],
  DEAL_UPDATED: [sendDealUpdatedEmail, dealUpdatedAudit],
  FOLLOWER_ADDED: [sendFollowingEmail],
  LINK_SHARED: [],
  NOTE_CREATED: [generateUsersMentionedFromNote],
  NOTE_UPDATED: [generateUsersMentionedFromNote],
  OWNER_ADDED: [sendOwnerAddedEmail, ownerAddedAudit],
  REMINDER_CREATED: [sendReminderCreatedEmail],

  /**
   * Password Events
   */

  // password changed through user managed
  PASSWORD_CHANGED: [sendPasswordChangedEmail],
  // password changed by user
  PASSWORD_RESET: [sendPasswordResetEmail],

  /**
   * Transformer Events
   */

  USERS_MENTIONED: [userMentionedAudit, sendUserMentionedEmail],
};
