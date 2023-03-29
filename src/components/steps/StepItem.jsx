import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import FeedNote from './feedTypes/FeedNote';
import FeedFile from './feedTypes/FeedFile';
import FeedFileDeleted from './feedTypes/FeedFileDeleted';
import FeedDeletion from './feedTypes/FeedDeletion';
import FeedActivity, { items } from './feedTypes/FeedActivity';
import FeedCreation from './feedTypes/FeedCreation';
import FeedUpdated from './feedTypes/FeedUpdated';
import FeedLinked from './feedTypes/FeedLinked';
import FeedLink from './feedTypes/FeedLink';
import {
  checkDate,
  DATE_FORMAT,
  DATE_FORMAT_TIME_WO_SEC,
  isPermissionAllowed,
  setDateFormat,
} from '../../utils/Utils';
import routes from '../../utils/routes.json';
import {
  ACTIVITY_FEED_TYPES,
  ACTIVITY_FEED_THEMES,
} from '../../utils/constants';
import Comments from './Comments';
import FeedReport from './feedTypes/FeedReport';
import FeedLesson from './feedTypes/FeedLesson';
import FeedCourse from './feedTypes/FeedCourse';
import MaterialIcon from '../commons/MaterialIcon';
import MoreActions from '../MoreActions';
import MentionsInput from '../mentions/MentionsInput';
import feedService from '../../services/feed.service';
import stringConstants from '../../utils/stringConstants.json';
import Avatar from '../Avatar';
import { AlertMessageContext } from '../../contexts/AlertMessageContext';
import Guests from '../ActivityTimeline/Guests';
import IdfTooltip from '../idfComponents/idfTooltip';
const constants = stringConstants.deals.contacts.profile;

const ResourceLink = ({ data }) => {
  if (data?.contact) {
    return (
      <>
        <span className="mx-1">&bull;</span>
        <Link
          to={`${routes.contacts}/${data.contact_id}/profile`}
          className="text-block"
        >
          <span>{`${data?.contact?.first_name} ${data?.contact?.last_name}`}</span>
        </Link>
      </>
    );
  } else if (data?.organization) {
    return (
      <>
        <span className="mx-1">&bull;</span>
        <Link
          to={`/${routes.companies}/${data.organization_id}/organization/profile`}
          className="text-block"
        >
          <span>{data?.organization?.name}</span>
        </Link>
      </>
    );
  }
  return null;
};

const NoteItem = ({
  data,
  feedInfo,
  feedId,
  getProfileInfo,
  isOwner,
  me,
  refreshFeed,
}) => {
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);

  const closeAddComment = () => {
    setNote(null);
  };

  const onHandleEdit = () => {
    setIsLoading(false);
    setNote(data);
  };

  const handleUpdate = async (raw) => {
    try {
      const { id } = note;
      await feedService.updateNote(feedId, id, raw);

      setNote(null);
      setSuccessMessage(constants.noteUpdated);
      refreshFeed();
    } catch (error) {
      if (error.response.status === 401) {
        setNote(null);
        return setErrorMessage(constants.unathorizedError);
      }

      setErrorMessage(constants.noteError);
    }
  };
  return (
    <div className="border-bottom p-3 bg-hover-gray">
      <div className="d-flex align-items-start gap-2">
        <div style={{ width: 30 }}>
          <Avatar user={feedInfo?.created_by_info} defaultSize="xs" />
        </div>
        <div className="flex-grow-1">
          <h5 className="mb-1 d-flex align-items-center gap-2">
            <span>
              {feedInfo?.created_by && (
                <Link
                  to={`${routes.contacts}/${feedInfo?.created_by}/profile`}
                  className="text-block"
                >
                  <span>{`${
                    feedInfo?.created_by_info?.first_name || ''
                  } `}</span>
                  <span>{feedInfo?.created_by_info?.last_name || ''}</span>
                </Link>
              )}
            </span>
            <div className="step-text font-size-xs d-flex align-items-center font-weight-normal text-muted">
              <span>
                {setDateFormat(feedInfo.updated_at, DATE_FORMAT_TIME_WO_SEC)}
              </span>
              <ResourceLink data={feedInfo} />
            </div>
          </h5>
          <p className="mb-1">
            {note === null ? (
              <>
                {data?.description && !data?.note ? (
                  <div dangerouslySetInnerHTML={{ __html: data.description }} />
                ) : (
                  <MentionsInput defaultState={data.note} readOnly />
                )}
              </>
            ) : (
              <div className="pl-0 pt-0 pb-0">
                <MentionsInput
                  defaultState={note?.description || note?.note}
                  type={`comment`}
                  handleSubmit={handleUpdate}
                  submitLabel={`Update`}
                  isLoading={isLoading}
                  onHandleCancel={closeAddComment}
                />
              </div>
            )}
          </p>
          {isPermissionAllowed('notes', 'create') && (
            <Comments data={feedInfo} me={me} />
          )}
        </div>
        {isOwner && (
          <div onClick={(e) => e.stopPropagation()}>
            <MoreActions
              permission={{
                collection: 'notes',
                action: 'edit',
              }}
              items={items()}
              onHandleEdit={onHandleEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityItem = ({
  data,
  id,
  deal,
  activity_id,
  feedInfo,
  me,
  handleEditActivity,
  refreshFeed,
  isOwner,
}) => {
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const isJson = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };
  const notesData = isJson(data?.notes);
  const dueDate = checkDate(data);
  const markAsDone = async () => {
    try {
      await feedService.updateActivity({ done: true, feedId: id });
      setSuccessMessage(constants.updatedActivity);
      refreshFeed();
    } catch (error) {
      setErrorMessage(constants.errorUpdatedActivity);
    }
  };
  return (
    <div className="border-bottom p-3 hover-actions bg-hover-gray">
      <div className="d-flex align-items-start">
        <div className="d-flex flex-grow-1 gap-2 position-relative">
          {data.done && (
            <div className="action-items position-absolute top-0 badge px-2 badge-success badge-pill right-0">
              <div className="d-flex align-items-center gap-1">
                <MaterialIcon icon="task_alt" clazz="mr-1" />
                <span>Completed</span>
              </div>
            </div>
          )}
          <MaterialIcon icon={data.type} clazz="fs-4 text-gray-900" />
          <div className="flex-grow-1">
            <h5
              className={`mb-1 d-flex align-items-center gap-2 font-weight-semi-bold`}
            >
              <span className={data.done ? 'text-strikethrough' : ''}>
                {data.name}
              </span>
              <p className="step-text font-size-xs mb-0 font-weight-normal text-muted">
                <span>
                  {setDateFormat(feedInfo.updated_at, DATE_FORMAT_TIME_WO_SEC)}
                </span>
                <span className="mx-1">&bull;</span>
                {data?.ownerUser && (
                  <Link
                    to={`${routes.contacts}/${data?.created_by}/profile`}
                    className="text-block"
                  >
                    <span>{`${data?.ownerUser?.first_name || ''} `}</span>
                    <span>{data?.ownerUser?.last_name || ''}</span>
                  </Link>
                )}
                <ResourceLink data={data} />
              </p>
            </h5>
            <div className="w-100">
              {notesData && !data?.rich_note ? (
                <p className="mb-1">
                  {notesData?.blocks?.length > 0
                    ? notesData?.blocks[0]?.text
                    : notesData}
                </p>
              ) : (
                <div className="pl-0 pt-0 pb-0">
                  {notesData && (
                    <MentionsInput
                      className="pt-1 pb-0 px-4"
                      defaultState={notesData}
                      readOnly
                    />
                  )}
                </div>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              {deal && (
                <p
                  className="cursor-pointer mb-1 d-flex text-black align-items-center gap-1 font-size-sm2"
                  onClick={() =>
                    history.push(`${routes.dealsPipeline}/${deal.id}`)
                  }
                >
                  <MaterialIcon icon="monetization_on" clazz="mr-1" />
                  <span className="text-capitalize">{deal.name}</span>
                </p>
              )}
              {data.contact_info && (
                <a
                  href=""
                  className="cursor-pointer mb-1 d-flex text-black align-items-center gap-1 font-size-sm2"
                  onClick={() =>
                    history.push(`/contacts/${data.contact_info.id}/profile`)
                  }
                >
                  <MaterialIcon icon="person" clazz="mr-1" />
                  <span>
                    {data.contact_info.first_name} {data.contact_info.last_name}
                  </span>
                </a>
              )}
            </div>
            {data?.start_date && (
              <p className={`mb-0 font-size-sm2 ${dueDate}`}>
                {dueDate === 'text-success' ? (
                  ` Today ${setDateFormat(data.start_date, 'h:mm A')}`
                ) : dueDate === 'text-primary' ? (
                  ` Tomorrow ${setDateFormat(data.start_date, 'h:mm A')}`
                ) : (
                  <div className="d-flex align-items-center gap-1">
                    {setDateFormat(data.start_date, DATE_FORMAT)}
                    {dueDate === 'text-danger' &&
                      (!data.done ? (
                        <IdfTooltip text="Not completed">
                          <MaterialIcon
                            filled
                            clazz="text-size-md"
                            icon="flag"
                          />
                        </IdfTooltip>
                      ) : (
                        <IdfTooltip text="Not completed">
                          <MaterialIcon
                            filled
                            clazz="text-size-md"
                            icon="task_alt"
                          />
                        </IdfTooltip>
                      ))}
                  </div>
                )}
              </p>
            )}
            <Guests timeline={{ item: feedInfo }} fromNavbar={false} />
            {isPermissionAllowed('activities', 'create') && (
              <Comments data={feedInfo} me={me} />
            )}
          </div>
        </div>
        {isOwner && (
          <MoreActions
            permission={{
              collection: 'activities',
              action: 'edit',
            }}
            items={[
              {
                id: 'remove',
                icon: 'task_alt',
                name: 'Mark as completed',
                className: data.done ? 'd-none' : '',
              },
              {
                id: 'edit',
                icon: 'edit',
                name: 'Edit',
              },
            ]}
            onHandleEdit={() => handleEditActivity(activity_id)}
            onHandleRemove={markAsDone}
            menuWidth={180}
          />
        )}
      </div>
    </div>
  );
};

const StepItem = ({
  data,
  isDeal,
  feedId,
  isContact,
  setRefreshRecentFiles,
  getProfileInfo,
  ids,
  deal,
  organization,
  organizationId,
  dataType,
  me,
  layout = 'old',
  layoutType,
  handleEditActivity,
  refreshFeed,
}) => {
  // if current user has admin_access or the item is created by the user then allow editing only
  const isOwner = me?.role?.admin_access || data?.created_by === me?.id;
  const renderContent = (type, objectData, id, activity_id) => {
    if (layout === 'new') {
      switch (layoutType) {
        case 'note':
          return (
            <NoteItem
              feedInfo={data}
              data={objectData}
              feedId={feedId}
              getProfileInfo={getProfileInfo}
              isOwner={isOwner}
              me={me}
              refreshFeed={refreshFeed}
            />
          );
        case 'activity':
          return (
            <ActivityItem
              data={objectData}
              id={id}
              isContact={isContact}
              isDeal={isDeal}
              getProfileInfo={getProfileInfo}
              ids={ids}
              deal={deal}
              dataType={dataType}
              organization={organization}
              activity_id={id}
              isOwner={isOwner}
              feedInfo={data}
              me={me}
              handleEditActivity={handleEditActivity}
              refreshFeed={refreshFeed}
            />
          );
      }
    } else {
      switch (type) {
        case ACTIVITY_FEED_TYPES.note:
          return (
            <FeedNote
              data={objectData}
              feedId={feedId}
              getProfileInfo={getProfileInfo}
              isOwner={isOwner}
            />
          );

        case ACTIVITY_FEED_TYPES.file:
          return (
            <FeedFile
              data={objectData}
              setRefreshRecentFiles={setRefreshRecentFiles}
              organizationId={organizationId}
              isOwner={isOwner}
            />
          );

        case ACTIVITY_FEED_TYPES.fileDeleted:
          return <FeedFileDeleted data={objectData} />;

        case ACTIVITY_FEED_TYPES.deletion:
          return <FeedDeletion data={objectData} />;

        case ACTIVITY_FEED_TYPES.report:
          return (
            <FeedReport data={objectData} organizationId={organizationId} />
          );

        case ACTIVITY_FEED_TYPES.call:
        case ACTIVITY_FEED_TYPES.event:
        case ACTIVITY_FEED_TYPES.task:
          return (
            <FeedActivity
              data={objectData}
              id={id}
              isContact={isContact}
              getProfileInfo={getProfileInfo}
              ids={ids}
              deal={deal}
              dataType={dataType}
              organization={organization}
              activity_id={activity_id}
              isOwner={isOwner}
              feedInfo={data}
            />
          );

        case ACTIVITY_FEED_TYPES.creation:
          return <FeedCreation {...objectData} isDeal={isDeal} />;

        case ACTIVITY_FEED_TYPES.updated:
          return <FeedUpdated {...objectData} />;

        case ACTIVITY_FEED_TYPES.contactLinked:
        case ACTIVITY_FEED_TYPES.contactUnlinked:
          return (
            <FeedLinked
              data={objectData}
              profileUrl={`${routes.contacts}/${objectData.id}/profile`}
            />
          );

        case ACTIVITY_FEED_TYPES.organizationLinked:
        case ACTIVITY_FEED_TYPES.organizationUnlinked:
          return (
            <FeedLinked
              data={objectData}
              profileUrl={`/${routes.companies}/${objectData.id}/organization/profile`}
            />
          );

        case ACTIVITY_FEED_TYPES.lessonCompleted:
        case ACTIVITY_FEED_TYPES.lessonStarted:
          return <FeedLesson data={objectData} />;

        case ACTIVITY_FEED_TYPES.courseCompleted:
        case ACTIVITY_FEED_TYPES.courseStarted:
          return <FeedCourse data={objectData} />;

        case ACTIVITY_FEED_TYPES.link:
          return <FeedLink data={objectData} isOwner={isOwner} />;

        default:
          return null;
      }
    }
  };

  const getSummary = (summaryInfo) => {
    const { name } = summaryInfo.object_data;
    if (
      !isDeal &&
      summaryInfo?.deal_id &&
      summaryInfo.type === ACTIVITY_FEED_TYPES.updated
    ) {
      return (
        <span>
          Your deal
          <Link
            to={`${routes.pipeline}/${summaryInfo.deal_id}`}
            className="text-block"
          >
            {` "${name}" `}
          </Link>
          {summaryInfo.summary === 'Deal updated'
            ? 'was updated'
            : summaryInfo.summary}
        </span>
      );
    }
    return <span>{summaryInfo.summary}</span>;
  };

  let stepItemDate;
  const getHoursDifference = () => {
    const dif = now.getHours() - stepItemDate.getHours();
    return dif === 0
      ? 'Just Now'
      : dif === 1
      ? 'An hour ago'
      : `${dif} hours ago`;
  };
  const getNearTimeDifference = () => {
    return (
      now.getFullYear === stepItemDate.getFullYear &&
      now.getMonth() === stepItemDate.getMonth() &&
      (now.getDate() === stepItemDate.getDate()
        ? getHoursDifference()
        : now.getDate() - 1 === stepItemDate.getDate() &&
          now.getHours() - stepItemDate.getHours() < 2 &&
          'One day ago')
    );
  };

  const updateStepItemDate = (date) => {
    stepItemDate = new Date(date);
  };
  const now = new Date();

  return (
    <>
      {layout === 'new' &&
      (layoutType === 'activity' || layoutType === 'note') ? (
        <li className="step-item p-0 m-0">
          {renderContent(
            data.type,
            layoutType !== 'activity' ? data?.object_data : data,
            data.id
          )}
        </li>
      ) : (
        <li className="step-item">
          <div className="step-content-wrapper">
            <span
              className={`step-icon ${ACTIVITY_FEED_THEMES[data?.type]?.color}`}
            >
              <i className="material-icons-outlined">
                {ACTIVITY_FEED_THEMES[data?.type]?.icon}
              </i>
            </span>

            <div className="step-content">
              <h5>{getSummary(data)}</h5>
              <p className="step-text font-size-xs text-muted">
                {updateStepItemDate(data.updated_at)}
                <span>
                  {getNearTimeDifference() ||
                    setDateFormat(data.updated_at, 'MMM DD YYYY h:mm A')}
                </span>
                <span className="mx-1">&bull;</span>
                {data?.created_by && (
                  <Link
                    to={`${routes.contacts}/${data?.created_by}/profile`}
                    className="text-block"
                  >
                    <span>{`${data?.created_by_info?.first_name || ''} `}</span>
                    <span>{data?.created_by_info?.last_name || ''}</span>
                  </Link>
                )}
                {data?.updated_by_info && (
                  <>
                    <span className="mx-1">&bull; Last updated by</span>
                    <Link
                      to={`${routes.contacts}/${data?.created_by}/profile`}
                      className="text-block"
                    >
                      <span>{`${
                        data?.updated_by_info?.first_name || ''
                      } `}</span>
                      <span>{data?.updated_by_info?.last_name || ''}</span>
                    </Link>
                  </>
                )}
                <ResourceLink data={data} />
              </p>
              {renderContent(data.type, data, data.id, data.activity_id)}
              {isPermissionAllowed('activities', 'create') && (
                <Comments data={data} me={me} />
              )}
            </div>
          </div>
        </li>
      )}
    </>
  );
};

StepItem.defaultProps = {
  showOrganizationInfo: false,
  isDeal: false,
  isContact: false,
  isOrganization: false,
};

export default StepItem;
