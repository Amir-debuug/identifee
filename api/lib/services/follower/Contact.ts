import { ContactFollowers } from 'lib/database';
import { ContactFollowersModel } from 'lib/database/models/contactsFollowers';
import { UserContext } from 'lib/middlewares/openapi';
import { Follower } from './Follower';

export class ContactFollowerService extends Follower<
  'contact',
  'contact_id',
  ContactFollowersModel
> {
  constructor(user: UserContext) {
    super(ContactFollowers, user, 'contact', 'contact_id');
  }
}
