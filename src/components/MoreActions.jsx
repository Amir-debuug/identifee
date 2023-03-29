import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { isPermissionAllowed } from '../utils/Utils';

const MoreActions = ({
  icon = 'more_vert',
  items,
  onHandleRemove,
  onHandleDownload,
  onHandleEdit,
  onHandleAdd,
  toggleClassName,
  iconStyle,
  permission = {},
  menuWidth = 160,
  ...restProps
}) => {
  const onClickFire = {
    remove: onHandleRemove,
    edit: onHandleEdit,
    add: onHandleAdd,
    download: onHandleDownload,
  };

  return (
    <>
      {permission?.collection ? (
        isPermissionAllowed(permission?.collection, permission?.action) && (
          <Dropdown
            drop="down"
            style={{ opacity: 1 }}
            className="idf-dropdown-item-list"
          >
            <Dropdown.Toggle
              className={`${toggleClassName} add-more-btn icon-hover-bg rounded-circle dropdown-hide-arrow`}
              variant="outline-link"
              id="dropdown"
              {...restProps}
            >
              <span>
                <span className={`material-icons-outlined ${iconStyle}`}>
                  {icon}
                </span>
              </span>
            </Dropdown.Toggle>

            {items.length > 0 && (
              <Dropdown.Menu
                align="right"
                className="border border-1 py-1"
                style={{ width: menuWidth }}
              >
                {items?.map((data) => (
                  <>
                    {permission?.collection ? (
                      isPermissionAllowed(
                        permission?.collection,
                        permission?.action
                      ) && (
                        <Dropdown.Item
                          key={data.id}
                          className={`pl-2 text-black ${data.className}`}
                          onClick={onClickFire[data.id]}
                        >
                          <i
                            className={`material-icons-outlined dropdown-item-icon ${data.className}`}
                          >
                            {data.icon}
                          </i>
                          {data.name}
                        </Dropdown.Item>
                      )
                    ) : (
                      <Dropdown.Item
                        key={data.id}
                        className={`pl-2 text-black ${data.className}`}
                        onClick={onClickFire[data.id]}
                      >
                        <i
                          className={`material-icons-outlined dropdown-item-icon ${data.className}`}
                        >
                          {data.icon}
                        </i>
                        {data.name}
                      </Dropdown.Item>
                    )}
                  </>
                ))}
              </Dropdown.Menu>
            )}
          </Dropdown>
        )
      ) : (
        <Dropdown drop="down" className="idf-dropdown-item-list">
          <Dropdown.Toggle
            className={`${toggleClassName} add-more-btn icon-hover-bg rounded-circle dropdown-hide-arrow`}
            variant="outline-link"
            id="dropdown"
            {...restProps}
          >
            <span>
              <span className={`material-icons-outlined ${iconStyle}`}>
                {icon}
              </span>
            </span>
          </Dropdown.Toggle>

          {items.length > 0 && (
            <Dropdown.Menu
              align="right"
              className="border border-1 py-1"
              style={{ width: menuWidth }}
            >
              {items?.map((data) => (
                <>
                  {permission?.collection ? (
                    isPermissionAllowed(
                      permission?.collection,
                      permission?.action
                    ) && (
                      <Dropdown.Item
                        key={data.id}
                        className={`pl-2 text-black ${data.className}`}
                        onClick={onClickFire[data.id]}
                      >
                        <i
                          className={`material-icons-outlined dropdown-item-icon ${data.className}`}
                        >
                          {data.icon}
                        </i>
                        {data.name}
                      </Dropdown.Item>
                    )
                  ) : (
                    <Dropdown.Item
                      key={data.id}
                      className={`pl-2 text-black ${data.className}`}
                      onClick={onClickFire[data.id]}
                    >
                      <i
                        className={`material-icons-outlined dropdown-item-icon ${data.className}`}
                      >
                        {data.icon}
                      </i>
                      {data.name}
                    </Dropdown.Item>
                  )}
                </>
              ))}
            </Dropdown.Menu>
          )}
        </Dropdown>
      )}
    </>
  );
};

MoreActions.defaultProps = {
  toggleClassName: '',
};

export default MoreActions;
