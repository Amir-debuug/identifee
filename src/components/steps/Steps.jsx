import React, { useEffect, useState } from 'react';

import StepItem from './StepItem';
// import feedService from '../../services/feed.service';
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';
import AddActivity from '../peopleProfile/contentFeed/AddActivity';
import fieldService from '../../services/field.service';
import Skeleton from 'react-loading-skeleton';
import LoadMoreButton from '../lesson/LoadMoreButton';
import RightPanelModal from '../modal/RightPanelModal';
import { capitalize, overflowing } from '../../utils/Utils';
import NoDataFound from '../commons/NoDataFound';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';
import { groupBy } from 'lodash';
import activityService from '../../services/activity.service';
import feedService from '../../services/feed.service';

const Steps = ({
  fetchAll,
  contactId,
  organizationId,
  dealId,
  userId,
  isDeal,
  isContact,
  dataType,
  getProfileInfo,
  setRefreshRecentFiles,
  openActivityId,
  limit = 25,
  me,
  filteredBy,
  layout = 'old',
  layoutType,
  refresh,
  setRefresh,
}) => {
  const [activity, setActivity] = useState([]);
  const [activityData, setActivityData] = useState({});
  const [deal, setDeal] = useState({});
  const [organization, setOrganization] = useState({});
  const [contact, setContact] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [showModalActivity, setShowModalActivity] = useState(false);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);

  const getActivity = async (
    type = '',
    page = pagination.page,
    total = pagination.limit,
    done = true,
    fromLoadMore
  ) => {
    if (!fromLoadMore) {
      setLoading(true);
    }
    const params = {
      ...filteredBy,
      userId,
    };

    if (isDeal) {
      params.dealId = dealId;
    } else if (isContact) {
      params.contactId = contactId;
    } else {
      params.organizationId = organizationId;
    }
    params.orderBy = 'created_at';
    params.typeOrder = 'DESC';
    try {
      let result;
      if (layoutType === 'activity') {
        result = await activityService.getActivity(params, {
          page: page || 1,
          limit: total || 10,
        });
        setActivity(result?.data);
      } else {
        result = await feedService.getActivityFeed(params, {
          page: page || 1,
          limit: total || 10,
        });
        setActivity(result?.feed);
      }
      setPagination(result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const EditFields = async (item) => {
    const fieldsData = await fieldService.getFields(item, {
      usedField: true,
    });
    groupBySection(fieldsData?.data);
  };
  const getActivityById = async (activityId) => {
    try {
      const result = await activityService.getSingleActivity(activityId);
      EditFields(result?.data?.type);
      setDeal(result?.data?.deal);
      setOrganization(result?.data?.organization);
      setContact(result?.data?.contact);
      setActivityData({
        id: result?.data?.id,
        type: result?.data?.type,
        owner: result?.data?.owner,
        start_date: result?.data?.start_date,
        location: result?.data?.location,
        conference_link: result?.data?.conference_link,
        free_busy: result?.data?.free_busy,
        notes: result?.data?.notes,
        name: result?.data?.name,
        end_date: result?.data?.end_date,
        done: result?.data?.done,
        guests: result?.data?.guests,
        priority: result?.data?.priority,
        online_meet: result?.data?.online_meet,
      });
      setShowModalActivity(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (filteredBy) {
      getActivity();
    }
  }, [filteredBy]);

  useEffect(() => {
    if (openActivityId) {
      getActivityById(openActivityId);
    }
  }, [openActivityId]);

  useEffect(() => {
    if (refresh > 0) {
      getActivity();
    }
  }, [refresh]);
  const renderStepItemContent = (typeFeed, activities, paginationData) => {
    console.log(activities);
    return (
      <div className="w-100">
        {loading ? (
          <div className="pt-2">
            <Skeleton count={5} height={10} className={'mb-2'} />
          </div>
        ) : (
          <>
            {activities?.length > 0 && (
              <ul className="step step-icon-sm mt-0">
                <TransitionGroup appear={true}>
                  {activities.map((item) => (
                    <Collapse key={item?.id} className="w-100">
                      <StepItem
                        key={item.id}
                        feedId={item.id}
                        getProfileInfo={getProfileInfo}
                        data={item}
                        isDeal={isDeal}
                        isContact={isContact}
                        dataType={dataType}
                        setRefreshRecentFiles={setRefreshRecentFiles}
                        ids={{ contactId, organizationId, dealId }}
                        deal={item.deal}
                        organization={item.organization}
                        organizationId={organizationId}
                        me={me}
                        layout={layout}
                        layoutType={layoutType}
                        handleEditActivity={(activityId) => {
                          getActivityById(activityId);
                        }}
                        refreshFeed={() => {
                          setRefresh((prevState) => prevState + 1);
                        }}
                      />
                    </Collapse>
                  ))}
                </TransitionGroup>
              </ul>
            )}

            <LoadMoreButton
              loading={paginationLoading}
              pagination={paginationData}
              btnContainerStyle="mt-2 mb-0"
              list={activities}
              onClick={() => onHandleChangePage(typeFeed, paginationData)}
            />
          </>
        )}
      </div>
    );
  };

  const onHandleChangePage = async (done, paginationData) => {
    const limitPage = done ? limit : 5;
    setPaginationLoading(true);
    try {
      await getActivity(
        '',
        paginationData.page,
        paginationData.limit + limitPage,
        done,
        true
      );
    } catch (e) {
      console.log(e);
    } finally {
      setPaginationLoading(false);
    }
  };

  const MESSAGES = {
    note: 'This record doesnt have any notes.',
    activity: 'This record doesnt have any activities.',
  };
  return (
    <div>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
      </AlertWrapper>

      {showModalActivity && (
        <RightPanelModal
          showModal={showModalActivity}
          setShowModal={() => {
            overflowing();
            setShowModalActivity(false);
          }}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={540}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center">
              <h3 className="mb-0">Edit {capitalize(activityData?.type)}</h3>
            </div>
          }
        >
          <AddActivity
            feedId={activityData?.id}
            componentId="edit-activity"
            dataType={dataType}
            contactId={contactId}
            btnType={activityData?.type}
            organizationId={organizationId}
            contactInfo={contact}
            dealId={dealId}
            allFields={isFieldsData}
            contactIs={organizationId ? 'organization' : 'profile'}
            getProfileInfo={getProfileInfo}
            isModal={true}
            closeModal={() => {
              overflowing();
              setShowModalActivity(false);
            }}
            activityData={activityData}
            feedInfo={activityData}
            organization={organization}
            deal={deal}
          />
        </RightPanelModal>
      )}
      <div>
        {renderStepItemContent(true, activity, pagination)}
        {!activity?.length && !loading && (
          <NoDataFound
            icon="subject"
            title={
              <div className="font-normal font-size-sm2 text-gray-search">
                {MESSAGES[layoutType]}
              </div>
            }
            containerStyle="text-gray-search my-6 py-6"
          />
        )}
      </div>
    </div>
  );
};

export default Steps;
