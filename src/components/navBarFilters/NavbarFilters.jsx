import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import userService from '../../services/user.service';
import { isModuleAllowed, isPermissionAllowed } from '../../utils/Utils';
import { useTenantContext } from '../../contexts/TenantContext';

import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import AddOrganization from '../organizations/AddOrganization';
import AddNewNoteModal from '../peopleProfile/contentFeed/AddNewNoteModal';
import AddDeal from '../peopleProfile/deals/AddDeal';
import AddPeople from '../peoples/AddPeople';
import AddNewActivityModal from '../steps/feedTypes/AddNewActivityModal';

const DropdownChildren = ({ item }) => {
  return (
    <div className="w-100 d-flex align-items-center justify-content-between text-block px-2">
      <div>
        <i className="material-icons-outlined list-group-icon mr-2">
          {item.icon}
        </i>
        <span className="font-weight-medium">{item.title}</span>
      </div>
      <div>
        <span className="badge badge-soft-dark">Shift</span>
        <span> + </span>
        <span className="badge badge-soft-dark">{item.shortcut}</span>
      </div>
    </div>
  );
};

const NavbarFilters = () => {
  const [openDeal, setOpenDeal] = useState(false);
  const [openOrganization, setOpenOrganization] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [openEvent, setOpenEvent] = useState(false);
  const [openPeople, setOpenPeople] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openList, setOpenList] = useState(false);
  const [me, setMe] = useState(null);
  const [optionList, setOptionList] = useState();
  const { tenant } = useTenantContext();
  const options = [
    {
      title: 'Deal',
      tenantModule: 'deals',
      permission: { collection: 'deals', action: 'create' },
      icon: 'monetization_on',
      shortcut: 'D',
      callbackFunction: setOpenDeal,
      component: (
        <AddDeal
          className="btn-transparent"
          setOpenDeal={setOpenDeal}
          openDeal={openDeal}
          setOpenList={setOpenList}
        />
      ),
    },
    {
      title: 'Contact',
      icon: 'person',
      tenantModule: 'contacts',
      shortcut: 'P',
      permission: { collection: 'contacts', action: 'create' },
      callbackFunction: setOpenPeople,
      component: (
        <AddPeople
          openPeople={openPeople}
          setOpenPeople={setOpenPeople}
          setOpenList={setOpenList}
        />
      ),
    },
    {
      title: 'Company',
      icon: 'business',
      tenantModule: 'companies',
      shortcut: 'O',
      permission: { collection: 'contacts', action: 'create' },
      callbackFunction: setOpenOrganization,
      component: <></>,
    },
    {
      title: 'Task',
      icon: 'task',
      tenantModule: 'activities',
      shortcut: 'T',
      btnType: 'task',
      permission: { collection: 'activities', action: 'create' },
      callbackFunction: setOpenTask,
      component: <></>,
    },
    {
      title: 'Call',
      icon: 'phone',
      tenantModule: 'activities',
      shortcut: 'C',
      btnType: 'call',
      permission: { collection: 'activities', action: 'create' },
      callbackFunction: setOpenActivity,
      component: <></>,
    },
    {
      title: 'Event',
      icon: 'event',
      shortcut: 'E',
      tenantModule: 'activities',
      btnType: 'event',
      permission: { collection: 'activities', action: 'create' },
      callbackFunction: setOpenEvent,
      component: <></>,
    },
    {
      title: 'Note',
      icon: 'text_snippet',
      tenantModule: 'crm',
      shortcut: 'N',
      permission: { collection: 'notes', action: 'create' },
      callbackFunction: setOpenNote,
      component: (
        <AddNewNoteModal
          openNote={openNote}
          setOpenNote={setOpenNote}
          setOpenList={setOpenList}
          fromNavbar={true}
        />
      ),
    },
  ];

  useEffect(() => {
    const getCurrentUser = async () => {
      const self = await userService
        .getUserInfo()
        .catch((err) => console.error(err));

      setMe(self);
    };

    getCurrentUser();
    const listData = options.filter((el) => {
      return isModuleAllowed(tenant.modules, el.tenantModule);
    });
    setOptionList(listData);
  }, []);

  const renderIcon = () => {
    return (
      <span className="material-icons-outlined border-0">
        {openList ? 'close' : 'add'}
      </span>
    );
  };

  return (
    <>
      {openDeal && (
        <AddDeal
          className="btn-transparent"
          setOpenDeal={setOpenDeal}
          openDeal={openDeal}
          setOpenList={setOpenList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
        />
      )}
      {openPeople && (
        <AddPeople
          openPeople={openPeople}
          setOpenPeople={setOpenPeople}
          setOpenList={setOpenList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
        />
      )}
      {openOrganization && (
        <AddOrganization
          openOrganization={openOrganization}
          setOpenOrganization={setOpenOrganization}
          setOpenList={setOpenList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          me={me}
        />
      )}
      {openActivity && (
        <AddNewActivityModal
          openActivity={openActivity}
          setOpenActivity={setOpenActivity}
          setOpenList={setOpenList}
          btnType={'call'}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          shortcut="shift+c"
        />
      )}
      {openTask && (
        <AddNewActivityModal
          openActivity={openTask}
          setOpenActivity={setOpenTask}
          setOpenList={setOpenList}
          btnType={'task'}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          shortcut="shift+t"
        />
      )}
      {openEvent && (
        <AddNewActivityModal
          openActivity={openEvent}
          setOpenActivity={setOpenEvent}
          setOpenList={setOpenList}
          btnType={'event'}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          shortcut="shift+e"
        />
      )}
      <Dropdown
        className="ml-2"
        show={openList}
        onToggle={(isOpen, event, metadata) => {
          if (metadata.source !== 'select') {
            setOpenList(isOpen);
          }
        }}
      >
        <Dropdown.Toggle
          className="btn btn-icon btn-sm rounded-circle dropdown-hide-arrow"
          variant="success"
        >
          {renderIcon()}
        </Dropdown.Toggle>

        <Dropdown.Menu
          id="global-search-drop-list"
          className={`border border-1 p-0 w-260`}
        >
          {optionList?.map((item) => {
            const { component, ...restProps } = item;

            return (
              <>
                {item?.permission ? (
                  <>
                    {isPermissionAllowed(
                      item.permission.collection,
                      item.permission.action
                    ) && (
                      <Dropdown.Item
                        as="span"
                        key={item.shortcut}
                        className="d-flex align-items-center cursor-pointer p-drop-menu px-1"
                        onClick={() => {
                          setOpenList(false);
                          item.callbackFunction(true);
                        }}
                      >
                        {React.cloneElement(
                          component,
                          {
                            errorMessage,
                            setErrorMessage,
                            successMessage,
                            setSuccessMessage,
                            fromNavbar: true,
                            ...restProps,
                          },
                          <DropdownChildren item={item} />
                        )}
                      </Dropdown.Item>
                    )}
                  </>
                ) : (
                  <Dropdown.Item
                    as="span"
                    key={item.shortcut}
                    className="d-flex align-items-center cursor-pointer p-drop-menu px-1"
                    onClick={() => {
                      setOpenList(false);
                      item.callbackFunction(true);
                    }}
                  >
                    {React.cloneElement(
                      component,
                      {
                        errorMessage,
                        setErrorMessage,
                        successMessage,
                        setSuccessMessage,
                        fromNavbar: true,
                        ...restProps,
                      },
                      <DropdownChildren item={item} />
                    )}
                  </Dropdown.Item>
                )}
              </>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>

      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
    </>
  );
};

export default NavbarFilters;
