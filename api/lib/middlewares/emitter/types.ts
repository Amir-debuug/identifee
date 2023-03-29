import { EventEmitter2 } from 'eventemitter2';
import { DealsAttributes } from 'lib/database/models/deal';
import { FeedAttributes } from 'lib/database/models/feed';
import { OrganizationAttributes } from 'lib/database/models/organizations';
import { AuthMiddleware } from '../auth';
import { ContextMiddleware } from '../context';
import { OtelMiddleware } from '../opentelemetry';

// TODO move this into DB model
import { RawDraftContentBlock, RawDraftEntity } from 'draft-js';
import { ActivityRequestAttr, AuditAttr } from '../sequelize';
/**
 * TODO this needs to be moved into DB model
 *
 * Represents the draft-js text block used to represent a comment or a note.
 *
 * For now, we only use `mention` to track users who were mentioned.
 */
export type TextBlock = {
  blocks: RawDraftContentBlock[];
  entityMap: RawDraftEntity<{
    // `mention` represents users who were mentioned in text block
    mention?: TextMention;
  }>;
};
export type TextMention = {
  email: string;
  id: string;
  name: string;
};

export enum EventTopic {
  APP = 'app.events',
}
export const eventBus = new EventEmitter2({
  wildcard: true,
  verboseMemoryLeak: true,
  delimiter: '.',

  // This will ignore the "unspecified event" error
  ignoreErrors: true,
});

/**
 * Generic resource holds information about the parent entity. E.g. notes
 * are a single entity but can belong to a contact, deal, or organization.
 */
export type GenericParentResource = {
  resource: {
    id: string;
    type: 'contact' | 'deal' | 'organization';
  };
};

export type GenericTextResource = {
  // mentions are a result of creating or updating a text block
  action: 'create' | 'update';
  id: string;
  idType: 'string' | 'number';
  // raw text from comment or note
  text: string;
  type: 'comment' | 'note';
  created_at: Date;
};

/**
 * Additional context about who or what generated the event. To be used by the
 * handler processing the event.
 */
export type EventReq = {
  // avoid cyclic import
  emitter: {
    emitAppEvent: <T extends keyof Event>(
      user: AuthMiddleware['user'],
      task: EventTask<T>,
      otel?: OtelMiddleware['otel']
    ) => Promise<void>;
  };
} & AuthMiddleware &
  ContextMiddleware &
  OtelMiddleware;

/**
 * The function that will be called when an event is consumed.
 */
export type EventFn<T extends EventName> = (
  req: EventReq,
  task: EventTask<T>
) => Promise<void>;

export type EventName = keyof Event;

export type EventTask<T extends EventName = EventName> = Event[T] & {
  event: T;
};

/**
 * Each event here should be named as something that was performed e.g. should
 * be in past tense, "CREATING_USER" should not be valid as that indicates the
 * process has not yet completed. "CREATED_USER" is valid as that indicates the
 * process has completed successfully.
 */
export type Event = {
  ACTIVITY_CREATED: {
    payload: {
      title: string;
      description: string;
      busyStatus: string;
      attendees: string[];
      location?: string;
      start: number[];
      date: Date;
      user_id: string;
      tenant_id: string;
    };
  };
  ACTIVITY_REQUEST_CREATED: {
    payload: {
      activityRequest: ActivityRequestAttr;
    };
  };
  /**
   * Although this event does notify users when a entity is modified such as,
   * DEAL_UPDATED, a user will be shown a notification in their feed. This should
   * still be kept separate from that actual DEAL_UPDATED event as the audit entry
   * is created after those events. And audit notifications need to lookup all
   * users who should have an audit notification entry created.
   */
  AUDIT_CREATED: {
    payload: {
      audit: AuditAttr;
    };
  };
  COMMENT_CREATED: {
    payload: {
      id: number;
      date: Date;
      /**
       * @deprecated
       */
      feed: FeedAttributes;
      // TODO define the correct type representation
      // generic object represent note/comments
      text: TextBlock;
    };
  } & GenericParentResource;
  // find better suited name
  // this is new mention...
  COMMENT_UPDATED: {
    payload: {
      id: number;
      date: Date;
      previous_text: TextBlock;
      text: TextBlock;
    };
  } & GenericParentResource;
  DEAL_CREATED: {
    payload: {
      deal: DealsAttributes;
    };
  };
  DEAL_UPDATED: {
    payload: {
      deal: DealsAttributes;
      previousDeal: DealsAttributes;
    };
  };
  FOLLOWER_ADDED: {
    payload: {
      organization: OrganizationAttributes;
    };
  };
  LINK_SHARED: {
    payload: {
      date: Date;
      // TODO define the correct type representation
      // generic object represent note/comments
      text: any;
    };
  } & GenericParentResource;
  NOTE_CREATED: {
    payload: {
      id: string;
      date: Date;
      // TODO define the correct type representation
      // generic object represent note/comments
      text: TextBlock;
    };
  } & GenericParentResource;
  NOTE_UPDATED: {
    payload: {
      id: string;
      date: Date;
      // TODO define the correct type representation
      // generic object represent note/comments
      previous_text: TextBlock;
      text: TextBlock;
    };
  } & GenericParentResource;
  OWNER_ADDED: {
    payload: {
      owner: {
        user_id: string;
        tenant_id: string;
      };
    };
  } & GenericParentResource;
  REMINDER_CREATED: {
    payload: {
      activities: any[];
      tenant_id: string;
      user_id: string;
    };
  };

  // Password Events

  // This is when an admin changes a user password
  PASSWORD_CHANGED: {
    payload: {
      tenantId: string;
      email: string;
      password: string;
    };
  };
  // This is when a user changes their own password
  PASSWORD_RESET: {
    payload: {
      email: string;
    };
  };

  /**
   * Transformer Events
   *
   * These are events that are generated as a result of a previous event.
   */

  USERS_MENTIONED: {
    payload: {
      mentions: TextMention[];
      textResource: GenericTextResource;
    };
  } & GenericParentResource;
};
