import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { useHistory } from 'react-router';
import stringConstants from '../../utils/stringConstants.json';
import Heading from '../../components/heading';
import { TabsContext } from '../../contexts/tabsContext';
import TaskTable from '../../components/ActivitiesTable/TaskTable';
import CallTable from '../../components/ActivitiesTable/CallTable';
import EventTable from '../../components/ActivitiesTable/EventTable';
import RightPanelModal from '../../components/modal/RightPanelModal';
import fieldService from '../../services/field.service';
import { overflowing } from '../../utils/Utils';
import Loading from '../../components/Loading';
import AddActivity from '../../components/peopleProfile/contentFeed/AddActivity';
import { groupBy } from 'lodash';
import {
  CallFiltersList,
  EventFiltersList,
  paginationDefault,
  TaskFiltersList,
} from '../../utils/constants';
import LayoutHead from '../../components/commons/LayoutHead';
import ButtonFilterDropdown from '../../components/commons/ButtonFilterDropdown';
import ButtonIcon from '../../components/commons/ButtonIcon';
import activityService from '../../services/activity.service';
import { AlertMessageContext } from '../../contexts/AlertMessageContext';
import AnimatedTabs from '../../components/commons/AnimatedTabs';
const constants = stringConstants.tasks;

const defaultTaskFilter = {
  key: 'AllTasks',
  name: 'All Tasks',
  filter: '',
};
const defaultCallFilter = {
  key: 'AllCall',
  name: 'All Calls',
  filter: '',
};
const defaultEventFilter = {
  key: 'AllEvents',
  name: 'All Events',
  filter: '',
};
const limit = 10;
const AllActivities = () => {
  const [isShow, setShowModal] = useState(false);
  const { setErrorMessage } = useContext(AlertMessageContext);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [btnType, setIsBtnType] = useState();
  const [tabType, setIsTabType] = useState('task');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const history = useHistory();
  const [order, setOrder] = useState([]);
  const [filterSelected, setFilterSelected] = useState({});
  const [contacts, setContacts] = useState();
  const [deals, setDeals] = useState();
  const [allData, setAllData] = useState([]);
  const [organizations, setOrganizations] = useState();
  const { activatedTab, setActivatedTab } = useContext(TabsContext);
  const [showLoading, setShowLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const [dataInDB, setDataInDB] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterTabs, setFilterTabs] = useState('filters');
  const [deleteResults, setDeleteResults] = useState();
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [getActivityId, setGetActivityId] = useState();
  const [isFilterCheck, setIsFilterCheck] = useState(
    tabType === 'task'
      ? TaskFiltersList[0]
      : tabType === 'call'
      ? CallFiltersList[0]
      : EventFiltersList[0]
  );
  const [activityData, setActivityData] = useState();
  const [filterOptionSelected, setFilterOptionSelected] = useState(
    tabType === 'task'
      ? defaultTaskFilter[0]
      : tabType === 'call'
      ? defaultCallFilter[0]
      : defaultEventFilter[0]
  );
  useEffect(() => {
    setActiveTab(1);
    if (activatedTab[location.pathname]) {
      setActiveTab(activatedTab[location.pathname]);
    }
    const tab = new URLSearchParams(history.location.search).get('tab');
    if (tab === 'call') {
      setActiveTab(2);
    } else if (tab === 'event') {
      setActiveTab(3);
    }
  }, []);
  const getData = async (dataType) => {
    setShowLoading(true);
    const params = {
      ...isFilterCheck?.filter,
      order,
    };
    try {
      const data = await activityService.getActivity(params, {
        type: dataType,
        ...pagination,
        limit,
      });
      setPagination(data?.pagination);
      setDataInDB(Boolean(data?.pagination?.totalPages));
      setAllData(data?.data);
      setShowLoading(false);
    } catch (err) {
      setErrorMessage(constants.create?.groupCreatedFailed);
    }
  };
  useEffect(() => {
    setIsFilterCheck(
      tabType === 'task'
        ? defaultTaskFilter
        : tabType === 'call'
        ? defaultCallFilter
        : defaultEventFilter
    );
  }, [tabType, activeTab]);
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async (item) => {
    setLoading(true);
    const { data } = await fieldService.getFields(item, {
      preferred: true,
    });
    groupBySection(data);
    setLoading(false);
  };
  const handleClearSelection = () => {
    setSelectAll(false);
    setSelectedData([]);
  };
  const handleEditActivity = async (singleItem) => {
    const singleData = await activityService.getSingleActivity(singleItem?.id);
    setContacts(singleData?.data?.contact);
    setDeals(singleData?.data?.deal);
    setOrganizations(singleData?.data?.organization);
    setActivityData({
      type: singleData?.data?.type,
      owner: singleData?.data?.owner,
      start_date: singleData?.data?.start_date,
      location: singleData?.data?.location,
      conference_link: singleData?.data?.conference_link,
      free_busy: singleData?.data?.free_busy,
      notes: singleData?.data?.notes,
      name: singleData?.data?.name,
      end_date: singleData?.data?.end_date,
      done: singleData?.data?.done,
      priority: singleData?.data?.priority,
      online_meet: singleData?.data?.online_meet,
    });
    setIsBtnType(singleData?.data?.type);
    setShowModal(true);
    setGetActivityId(singleItem);
    const { data } = await fieldService.getFields(singleItem.type, {
      usedFields: true,
    });
    groupBySection(data);
  };
  const tabsData = [
    {
      title: 'Task',
      key: 'task',
      component: (
        <TaskTable
          getData={getData}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          setShowLoading={setShowLoading}
          setDataInDB={setDataInDB}
          tabType={tabType}
          allData={allData}
          handleEditActivity={handleEditActivity}
          isFilterCheck={isFilterCheck}
          deleteResults={deleteResults}
          showDeleteOrgModal={showDeleteOrgModal}
          setDeleteResults={setDeleteResults}
          setShowDeleteOrgModal={setShowDeleteOrgModal}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          order={order}
          handleClearSelection={handleClearSelection}
          setOrder={setOrder}
          pagination={pagination}
          showLoading={showLoading}
          dataInDB={dataInDB}
          setPagination={setPagination}
        />
      ),
      tabId: 1,
    },
    {
      title: 'Call',
      key: 'call',
      component: (
        <CallTable
          setDataInDB={setDataInDB}
          tabType={tabType}
          getData={getData}
          allData={allData}
          isFilterCheck={isFilterCheck}
          setOpenFilter={setOpenFilter}
          setShowLoading={setShowLoading}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          openFilter={openFilter}
          deleteResults={deleteResults}
          showDeleteOrgModal={showDeleteOrgModal}
          filterTabs={filterTabs}
          setDeleteResults={setDeleteResults}
          setShowDeleteOrgModal={setShowDeleteOrgModal}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          setFilterTabs={setFilterTabs}
          filterOptionSelected={filterOptionSelected}
          setFilterOptionSelected={setFilterOptionSelected}
          order={order}
          handleEditActivity={handleEditActivity}
          handleClearSelection={handleClearSelection}
          setOrder={setOrder}
          filterSelected={filterSelected}
          setFilterSelected={setFilterSelected}
          pagination={pagination}
          showLoading={showLoading}
          dataInDB={dataInDB}
          setPagination={setPagination}
        />
      ),
      tabId: 2,
    },
    {
      title: 'Event',
      key: 'event',
      component: (
        <EventTable
          getData={getData}
          selectedData={selectedData}
          allData={allData}
          setShowLoading={setShowLoading}
          setSelectedData={setSelectedData}
          openFilter={openFilter}
          setDataInDB={setDataInDB}
          tabType={tabType}
          isFilterCheck={isFilterCheck}
          setOpenFilter={setOpenFilter}
          handleEditActivity={handleEditActivity}
          deleteResults={deleteResults}
          showDeleteOrgModal={showDeleteOrgModal}
          filterTabs={filterTabs}
          setDeleteResults={setDeleteResults}
          setShowDeleteOrgModal={setShowDeleteOrgModal}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          setFilterTabs={setFilterTabs}
          filterOptionSelected={filterOptionSelected}
          setFilterOptionSelected={setFilterOptionSelected}
          order={order}
          handleClearSelection={handleClearSelection}
          setOrder={setOrder}
          filterSelected={filterSelected}
          setFilterSelected={setFilterSelected}
          pagination={pagination}
          showLoading={showLoading}
          dataInDB={dataInDB}
          setPagination={setPagination}
        />
      ),
      tabId: 3,
    },
  ];

  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);
      setIsTabType(tab.key);
      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
      setIsFilterCheck(
        tabType === 'task'
          ? defaultTaskFilter
          : tabType === 'call'
          ? defaultCallFilter
          : defaultEventFilter
      );
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setIsBtnType('');
  };
  const loader = () => {
    if (loading) return <Loading />;
  };
  const handleDelete = (data) => {
    setShowDeleteOrgModal(true);
    setDeleteResults(data);
  };
  const handleClick = (type) => {
    getFields(type);
    setShowModal(true);
    setIsBtnType(type);
  };
  const handleFilterSelect = (item) => {
    setIsFilterCheck(item);
    setPagination((prevState) => ({
      ...prevState,
      page: 1,
    }));
  };
  console.log(deals, contacts, organizations);
  return (
    <>
      <div className="justify-content-between d-flex w-100 mt-3 mx-3 align-items-center">
        <Heading pageHeaderDivider="mb-0 w-50" useBc={true} showGreeting>
          <AnimatedTabs
            tabsData={tabsData}
            activeTab={activeTab}
            toggle={toggle}
          />
        </Heading>
        <div className="d-flex align-items-center">
          <LayoutHead
            selectedData={selectedData}
            onDelete={handleDelete}
            allRegister={`${pagination?.count || 0} ${
              tabType.charAt(0).toUpperCase() + tabType.slice(1)
            }`}
            permission={{
              collection: 'activities',
              action: 'delete',
            }}
            onClear={handleClearSelection}
          >
            <ButtonFilterDropdown
              options={
                tabType === 'task'
                  ? TaskFiltersList
                  : tabType === 'call'
                  ? CallFiltersList
                  : EventFiltersList
              }
              openFilter={openFilter}
              btnToggleStyle="py-2 btn-sm"
              setOpenFilter={setOpenFilter}
              filterOptionSelected={isFilterCheck}
              filterSelected={filterSelected}
              filterTabs={filterTabs}
              handleFilterSelect={(e, item) => handleFilterSelect(item)}
              setFilterOptionSelected={setFilterOptionSelected}
              setFilterSelected={setIsFilterCheck}
              setFilterTabs={setFilterTabs}
              defaultSelection={
                tabType === 'task'
                  ? defaultTaskFilter
                  : tabType === 'call'
                  ? defaultCallFilter
                  : defaultEventFilter
              }
            />
            <div className="d-flex align-items-center">
              <ButtonIcon
                label="Call"
                icon="add"
                onClick={() => handleClick('call')}
                classnames="btn-sm px-3 mx-2"
                color="primary"
              />
              <ButtonIcon
                label="Task"
                icon="add"
                onClick={() => handleClick('task')}
                color="primary"
                classnames="btn-sm px-3 mr-2"
              />
              <ButtonIcon
                label="Event"
                icon="add"
                onClick={() => handleClick('evnet')}
                color="primary"
                classnames="btn-sm px-3"
              />
            </div>
          </LayoutHead>
        </div>
      </div>
      <TabContent className="w-100 px-3">
        <TabPane className="position-relative p-0">
          {tabsData.find((item) => item.tabId === activeTab)?.component}
        </TabPane>
      </TabContent>
      {isShow && (
        <RightPanelModal
          showModal={isShow}
          setShowModal={() => closeModal()}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={540}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center text-capitalize">
              {activityData ? (
                <h3 className="mb-0">Edit {btnType}</h3>
              ) : (
                <h3 className="mb-0">Add {btnType}</h3>
              )}
            </div>
          }
        >
          {loading ? (
            loader()
          ) : (
            <AddActivity
              btnType={btnType}
              activityData={activityData}
              feedInfo={activityData}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
              getActivityId={getActivityId}
              isModal={isShow}
              getData={getData}
              feedId={getActivityId?.feed_id}
              dataType={
                deals
                  ? 'deal'
                  : contacts
                  ? 'contact'
                  : organizations
                  ? 'organization'
                  : ''
              }
              deal={deals}
              contactInfo={contacts}
              organization={organizations}
              allFields={isFieldsData}
              closeModal={() => {
                setShowModal(false);
                overflowing();
                closeModal();
              }}
            />
          )}
        </RightPanelModal>
      )}
    </>
  );
};

export default AllActivities;
