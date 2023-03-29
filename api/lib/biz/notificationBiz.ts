import {
  ActivityRequestAttr,
  OrganizationAttr,
} from 'lib/middlewares/sequelize';
import Mail from 'nodemailer/lib/mailer';
import { TenantService } from '../services/tenant';
import { Biz } from './utils';

const { PUBLIC_URL } = process.env;

export type NotificationSendee = {
  tenant_id: string;

  // to or bcc is required
  to?: string;
  bcc?: string[];
} & Pick<Mail.Options, 'attachments' | 'subject'>;

export type NotificationTemplate = {
  ACTIVITY_REQUEST_CREATED: {
    payload: {
      activityRequest: ActivityRequestAttr;
      organization: OrganizationAttr;
    };
  };
  COMMENT_CREATED: {
    payload: {
      resource: {
        url: string;
      };
      firstName?: string | null;
      lastName?: string | null;
      comment: string;
      date: string;
    };
  };
  CONTACT_INVITED: {
    payload: {
      organizations: {
        name: string;
        token: string;
        url: string;
      }[];
    };
  };
  DEAL_UPDATED: {
    payload: {
      name?: string | null;
      updates: {
        [k in string]: {
          from: any;
          to: any;
        };
      };
      url: string;
    };
  };
  FOLLOWER_ADDED: {
    payload: {
      resource: {
        name?: string;
        type: 'organization';
        url: string;
      };
      primaryOwner: {
        name: string;
      };
    };
  };
  OWNER_ADDED: {
    payload: {
      resource: {
        type: 'organization' | 'deal' | 'contact';
        name?: string | null;
        url: string;
      };
    };
  };
  PASSWORD_CHANGED: {
    payload: {
      password: string;
    };
  };
  PASSWORD_RESET: {
    payload: {
      email: string;
    };
  };
  PASSWORD_RESET_REQUESTED: {
    payload: {
      url: string;
      resetUrl: string;
      email: string;
    };
  };
  REMINDER_CREATED: {
    payload: {
      firstName?: string | null;
      activities: any[]; // todo define this
    };
  };
  REPORT_REQUESTED: {
    payload: {
      messageLine: string;
    };
  };
  TFA_CODE_REQUESTED: {
    payload: {
      code: string;
    };
  };
  USER_INVITED: {
    payload: {
      url: string;
      email: string;
    };
  };
  USER_MENTIONED: {
    payload: {
      firstName?: string | null;
      lastName?: string | null;
      comment: string;
      date: string;
      resource: {
        url: string;
      };
    };
  };
};

export type NotificationRequest<T extends NotificationTemplateName> = {
  event: T;
} & NotificationSendee &
  NotificationTemplate[T];

export type NotificationTemplateName = keyof NotificationTemplate;

export class NotificationBiz extends Biz {
  // TODO remove this, use biz/dao
  private tenantService: typeof TenantService;

  constructor(...args: ConstructorParameters<typeof Biz>) {
    super(...args);

    this.tenantService = TenantService;
  }

  async sendEmail<T extends NotificationTemplateName>(
    notification: NotificationRequest<T>
  ) {
    // no email to send
    if (
      !notification.to &&
      (!notification.bcc || notification.bcc.length === 0)
    ) {
      return;
    }

    let templateName;
    if (notification.event === 'ACTIVITY_REQUEST_CREATED') {
      templateName = 'activityRequest';
    } else if (notification.event === 'COMMENT_CREATED') {
      templateName = 'new-comment';
    } else if (notification.event == 'CONTACT_INVITED') {
      templateName = 'public-report-email';
    } else if (notification.event === 'DEAL_UPDATED') {
      templateName = 'deal-updates';
    } else if (notification.event === 'FOLLOWER_ADDED') {
      templateName = 'new-follow';
    } else if (notification.event === 'OWNER_ADDED') {
      templateName = 'assigned-to';
    } else if (notification.event === 'PASSWORD_CHANGED') {
      templateName = 'password-reseted';
    } else if (notification.event === 'PASSWORD_RESET') {
      templateName = 'password-changed';
    } else if (notification.event === 'PASSWORD_RESET_REQUESTED') {
      templateName = 'password-reset';
    } else if (notification.event === 'REMINDER_CREATED') {
      templateName = 'reminder';
    } else if (notification.event === 'REPORT_REQUESTED') {
      templateName = 'report-email';
    } else if (notification.event === 'TFA_CODE_REQUESTED') {
      templateName = 'email-2fa';
    } else if (notification.event === 'USER_INVITED') {
      templateName = 'user-invitation';
    } else if (notification.event === 'USER_MENTIONED') {
      templateName = 'new-mention';
    }

    if (!templateName) {
      throw new Error('invalid template');
    }

    const theme = await this.getTheme(notification.tenant_id);
    await this.services.providers.email.send(
      templateName,
      {
        attachments: notification.attachments,
        bcc: notification.bcc,
        subject: notification.subject,
        to: notification.to,
      },
      {
        tenant: {
          name: theme.projectName,
          logoUrl: theme.projectLogo,
          colors: {
            primary: theme.projectColor,
          },
        },
        ...notification.payload,
      }
    );
  }

  private async getTheme(tenantId: string) {
    const theme = await this.tenantService.getMailThemeData(tenantId);
    // TODO revisit this
    if (!theme.projectName) {
      theme.projectName = 'Identifee';
    }
    if (!theme.projectColor) {
      theme.projectColor = '#111b51';
    }
    if (!theme.projectLogo) {
      theme.projectLogo = `${PUBLIC_URL}/img/logo-white.png`;
    }

    return theme;
  }
}
