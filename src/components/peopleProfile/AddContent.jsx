import React, { useContext, useState } from 'react';

import AddNote from './contentFeed/AddNote';
import AddFile from './contentFeed/AddFile';
import stringConstants from '../../utils/stringConstants.json';
import AddDataReport from './contentFeed/AddDataReport';
import { isModuleAllowed, isPermissionAllowed } from '../../utils/Utils';
import { AddActivityButtonsGroup } from '../addActivityButtonsGroup';
import Steps from '../steps/Steps';
import ActivityTimeline from '../ActivityTimeline/ActivityTimeline';
import DealProductsV2 from '../../views/Deals/pipelines/DealProductsV2';
import { TenantContext } from '../../contexts/TenantContext';
import AnimatedTabs from '../commons/AnimatedTabs';

const constants = stringConstants.deals.contacts.profile;
const TABS = {
  Data: 1,
  Timeline: 2,
  Notes: 3,
  Activities: 4,
  Files: 5,
  Products: 6,
};

const AddContent = ({
  contactId,
  getProfileInfo,
  organizationId,
  dealId,
  getDeal,
  dataSection,
  profileInfo,
  contactIs,
  refreshRecentFiles,
  setRefreshRecentFiles,
  contactInfo,
  dataType,
  isPrincipalOwner,
  me,
  deal,
  organization,
  activityIdOpen,
  isDeal,
  isContact,
}) => {
  const { tenant } = useContext(TenantContext);

  const [activeTab, setActiveTab] = useState(
    dataType === 'organization' &&
      isModuleAllowed(tenant.modules, 'business_intelligence')
      ? TABS.Data
      : TABS.Timeline
  );
  const [openNote, setOpenNote] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const organizationTabs = [
    {
      tabId: TABS.Data,
      icon: 'text_snippet',
      title: 'Data',
    },
  ];
  const dealTabs = [
    {
      tabId: TABS.Products,
      icon: 'text_snippet',
      title: 'Products',
    },
  ];
  const contactTabs = [
    {
      tabId: TABS.Timeline,
      icon: 'text_snippet',
      title: 'Timeline',
    },
    {
      tabId: TABS.Notes,
      icon: 'text_snippet',
      title: constants.notesLabel,
    },
    {
      tabId: TABS.Activities,
      icon: 'event',
      title: 'Activities',
    },
    {
      tabId: TABS.Files,
      icon: 'attachment',
      title: constants.filesLabel,
    },
  ];
  const tabsByType = {
    organization: isModuleAllowed(tenant.modules, 'business_intelligence')
      ? [...organizationTabs, ...contactTabs]
      : [...contactTabs],
    contact: [...contactTabs],
    deal: [...contactTabs, ...dealTabs],
  };
  const [tabs] = useState(tabsByType[dataType]);

  const notePlaceholder = (
    <div
      className="cursor-pointer text-muted"
      style={{ backgroundColor: 'lightyellow' }}
    >
      {openNote ? '' : 'Start writing a note...'}
    </div>
  );

  const handleRefreshFeed = () => {
    setRefresh((prevState) => prevState + 1);
  };

  const renderContent = () => {
    if (activeTab === TABS.Data) {
      return (
        <>
          {isPermissionAllowed('reports', 'create') &&
            isModuleAllowed(tenant.modules, 'business_intelligence') && (
              <AddDataReport
                getProfileInfo={getProfileInfo}
                organizationId={organizationId}
                profileInfo={profileInfo}
                isPrincipalOwner={isPrincipalOwner}
              />
            )}
        </>
      );
    } else if (activeTab === TABS.Notes) {
      return (
        <div className="px-4 py-2" onClick={() => setOpenNote(true)}>
          {isPermissionAllowed('notes', 'create') && (
            <AddNote
              setOverlay={setOpenNote}
              contactId={contactId}
              organizationId={organizationId}
              getProfileInfo={() => {
                getProfileInfo();
                handleRefreshFeed();
              }}
              dealId={dealId}
              getDeal={getDeal}
              placeholder={notePlaceholder}
            />
          )}
          <Steps
            organizationId={organizationId}
            getProfileInfo={getProfileInfo}
            openActivityId={activityIdOpen}
            organization={organization}
            dataType={dataType}
            setRefreshRecentFiles={setRefreshRecentFiles}
            me={me}
            filteredBy={{ type: ['note'] }}
            layout="new"
            layoutType="note"
            isDeal={isDeal}
            deal={deal}
            dealId={deal?.id}
            isContact={isContact}
            contactId={contactId}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        </div>
      );
    } else if (activeTab === TABS.Activities) {
      return (
        <div className="p-0">
          {isPermissionAllowed('activities', 'create') && (
            <AddActivityButtonsGroup
              componentId="new-activity"
              contactId={contactId}
              dataType={dataType}
              organizationId={organizationId}
              dealId={dealId}
              getProfileInfo={() => {
                getProfileInfo();
                handleRefreshFeed();
              }}
              contactIs={contactIs}
              contactInfo={contactInfo}
              profileInfo={profileInfo}
              deal={deal}
              organization={organization}
              activityIdOpen={activityIdOpen}
              me={me}
              isDeal={isDeal}
              setRefreshRecentFiles={setRefreshRecentFiles}
              isContact={isContact}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          )}
        </div>
      );
    } else if (activeTab === TABS.Files) {
      return (
        <>
          <AddFile
            contactId={contactId}
            organizationId={organizationId}
            getProfileInfo={getProfileInfo}
            dealId={dealId}
            getDeal={getDeal}
            refreshRecentFiles={refreshRecentFiles}
            setRefreshRecentFiles={setRefreshRecentFiles}
            me={me}
          />
        </>
      );
    } else if (activeTab === TABS.Products) {
      return <DealProductsV2 deal={deal} mode={1} getDeal={getDeal} />;
    } else if (activeTab === TABS.Timeline) {
      return (
        // hehehe :P passing id like that
        <ActivityTimeline
          id={
            dataType === 'deal'
              ? dealId
              : dataType === 'contact'
              ? contactId
              : organizationId
          }
          type={dataType}
        />
      );
    } else {
      return <span>Invalid tab</span>;
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header px-0 pt-0 border-bottom-0">
          <div className="border-bottom w-100">
            <AnimatedTabs
              tabClasses={
                'nav-justified link-active-wrapper w-100 nav-sm-down-break'
              }
              tabsData={tabs}
              activeTab={activeTab}
              toggle={(tab) => setActiveTab(tab.tabId)}
              tabItemClasses="p-3"
            />
          </div>
        </div>
        {isPermissionAllowed('contacts', 'create') ? (
          <div className="p-0">{renderContent()}</div>
        ) : (
          <div className="my-5 text-center">
            <h2>Can&apos;t Access</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddContent;
