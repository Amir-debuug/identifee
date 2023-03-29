import { Biz, UserQuery } from './utils';
import { URL } from 'url';

const { REACT_APP_CLIENT_PORTAL_URL } = process.env;

export type CreateGuestTokenBiz = {
  email: string;
  redirect_url: string;
};

export class AuthBiz extends Biz {
  /**
   * Contact token generation will only be sent as a magic link to the contact's
   * email.
   *
   * The token pair will not be returned as a standard login response.
   */
  async generateGuestToken(
    override: UserQuery | undefined,
    payload: CreateGuestTokenBiz
  ) {
    const associatedContacts = await this.services.biz.contact.getAllByEmail(
      undefined,
      payload.email
    );
    if (associatedContacts.length === 0) {
      return;
    }

    let redirectUrl = payload.redirect_url;
    try {
      new URL(redirectUrl);
    } catch (err) {
      redirectUrl = `${REACT_APP_CLIENT_PORTAL_URL}${redirectUrl}`;
    }
    const organizationContacts = associatedContacts
      .filter((contact) => contact.organization_id)
      .map((contact) => {
        const token = this.services.util.jwt.generate(
          {
            scope: 'guest',
            contact_id: contact.id,
            email: payload.email,
            resource_access: {
              organization: [
                {
                  id: contact.organization_id!, // already filtered falsey
                },
              ],
            },
            shared_by_id: contact.created_by, // TODO need to drop this
            tenant_id: contact.tenant_id,
          },
          { expiresIn: '1d' }
        );
        return {
          token,
          url: `${redirectUrl}?token=${token}`,
          name: contact.organization.name || '',
        };
      });

    if (organizationContacts.length === 0) {
      return;
    }

    await this.services.biz.notification.sendEmail({
      event: 'CONTACT_INVITED',
      payload: {
        organizations: organizationContacts,
      },
      subject: `You've been invited to an organization`,
      tenant_id: associatedContacts[0].tenant_id, // TODO revisit this..
      to: payload.email,
    });
  }
}
