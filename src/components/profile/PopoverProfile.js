import React from 'react';
import Avatar from '../Avatar';
import routes from '../../utils/routes.json';
import MaterialIcon from '../commons/MaterialIcon';
import { formatPhoneNumber } from '../../utils/Utils';

const ContactItem = ({ icon, text }) => {
  return (
    <>
      <p className="m-0 px-0 lead fs-7 d-flex align-items-center">
        <div
          className="bg-gray-300 rounded-circle d-flex align-items-center justify-content-center text-center"
          style={{ height: 18, width: 18 }}
        >
          <MaterialIcon icon={icon} clazz="font-size-xs" />
        </div>
        <p className="mb-0 text-nowrap ml-1">{text}</p>
      </p>
    </>
  );
};

// this component is specific to show profile like in figma design when hover/click user-name in Followers/Additional Owners sections
export default function PopoverProfile({ user, Route, contact, orgName }) {
  return (
    <div className="p-2" style={{ minWidth: 300 }}>
      <div className="profile-popover d-flex">
        <div
          className="avatar avatar-sm avatar-circle mr-3"
          onClick={() => {
            window.location.href = Route;
          }}
        >
          <Avatar user={user} />
        </div>
        <div className="pr-2 flex-grow-1">
          <h5 className="mb-0">
            <a
              href={`${routes.contacts}/${user.id}/profile`}
              className="text-block popover-link"
            >
              {user.first_name} {user.last_name}
            </a>
          </h5>
          {user.title && (
            <p className="mb-0 font-weight-normal text-nowrap text-muted fs-8">
              {user.title}
            </p>
          )}
          <p className="text-muted font-weight-normal text-nowrap mb-0">
            {user.description || ' '}
          </p>
          {(user.email || user.email_work) && (
            <ContactItem icon="mail" text={user.email || user.email_work} />
          )}
          {user.phone_work && (
            <ContactItem
              icon="phone"
              text={formatPhoneNumber(user.phone_work)}
            />
          )}
          {contact && orgName && <ContactItem icon="business" text={orgName} />}
        </div>
      </div>
    </div>
  );
}
