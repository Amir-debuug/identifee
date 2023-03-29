import { Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import React, { useState } from 'react';
import { isPermissionAllowed } from '../../utils/Utils';

const TabItem = ({
  item,
  activeTab,
  toggle,
  animateStyle,
  setAnimateStyle,
  itemClasses = 'px-3 py-2',
}) => {
  return (
    <NavItem
      onMouseOver={(e) => {
        setAnimateStyle({
          transform: `translateX(${e.target.offsetLeft}px)`,
          width: e.target.offsetWidth,
          height: e.target.offsetHeight - 10,
        });
      }}
      onMouseLeave={() => setAnimateStyle({ ...animateStyle, width: 0 })}
      key={item.tabId}
      className="py-0 tab-title"
    >
      <NavLink
        className={`${itemClasses} ${classnames({
          active: activeTab === item.tabId,
        })}`}
        onClick={() => {
          toggle(item);
        }}
      >
        {item.title}
      </NavLink>
    </NavItem>
  );
};

const AnimatedTabs = ({
  tabClasses,
  tabItemClasses,
  tabsData,
  activeTab,
  toggle,
  permissionCheck,
  requiredAdminAccess,
}) => {
  const [animateStyle, setAnimateStyle] = useState({});

  return (
    <Nav className={`border-bottom-0 position-relative ${tabClasses}`} tabs>
      {animateStyle.width > 0 && (
        <div
          className="position-absolute rounded bg-gray-300"
          style={{
            transition: 'all ease-in 150ms',
            bottom: '3px',
            ...animateStyle,
          }}
        ></div>
      )}
      {tabsData.map((item) => (
        <>
          {permissionCheck && item.permission ? (
            <>
              {isPermissionAllowed(
                item.permission.collection,
                item.permission.action
              ) && (
                <TabItem
                  activeTab={activeTab}
                  item={item}
                  toggle={toggle}
                  animateStyle={animateStyle}
                  setAnimateStyle={setAnimateStyle}
                  itemClasses={tabItemClasses}
                />
              )}
            </>
          ) : (
            <>
              {requiredAdminAccess === true ? (
                <TabItem
                  activeTab={activeTab}
                  item={item}
                  toggle={toggle}
                  animateStyle={animateStyle}
                  setAnimateStyle={setAnimateStyle}
                  itemClasses={tabItemClasses}
                />
              ) : (
                <TabItem
                  activeTab={activeTab}
                  item={item}
                  toggle={toggle}
                  animateStyle={animateStyle}
                  setAnimateStyle={setAnimateStyle}
                  itemClasses={tabItemClasses}
                />
              )}
            </>
          )}
        </>
      ))}
    </Nav>
  );
};

export default AnimatedTabs;
