import { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';

import './ActivitiesHistory.css';
import AddActivity from '../peopleProfile/contentFeed/AddActivity';
import Activity from '../steps/Activity';
import stringConstants from '../../utils/stringConstants.json';
import RightPanelModal from '../modal/RightPanelModal';
import fieldService from '../../services/field.service';
import Loading from '../Loading';
import { groupBy } from 'lodash';
import { overflowing } from '../../utils/Utils';

const ActivitiesHistory = ({
  className,
  icon,
  contactId,
  organization,
  deal,
  organizationId,
  dealId,
  owner,
  limit = 3,
  response,
  activities = [],
}) => {
  const withoutActivities = 'activities-without-activities';
  const activitiesPlanned = 'activities-planned';
  const activitiesOverdue = 'activities-overdue';
  const constants = stringConstants.deals.contacts.profile;
  const isMounted = useRef(false);
  const [showModalActivity, setShowModalActivity] = useState(false);
  const [title, setTitle] = useState(constants.withoutPlanned);
  const [btn, setBtn] = useState(null);
  const [currentFeed, setCurrentFeed] = useState(null);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [btnType, setIsBtnType] = useState('');
  const [loading, setLoading] = useState(false);
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async (item) => {
    setLoading(true);
    const fieldsData = await fieldService.getFields(item, {
      preferred: true,
    });
    groupBySection(fieldsData?.data);
    setLoading(false);
  };
  const EditFields = async (item) => {
    setLoading(true);
    const fieldsData = await fieldService.getFields(item, {
      usedField: true,
    });
    setIsFieldsData(fieldsData?.data);
    setLoading(false);
  };
  const confirm = (msg) => {
    setShowModalActivity(false);
    response(msg);
  };

  useEffect(() => {
    const el = document.getElementById(`btn-${dealId}`);
    el.classList.add(withoutActivities);
    setBtn(el);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (activities.length) {
        for (let i = 0; i < activities.length; i++) {
          const activity = activities[i];
          if (new Date(activity.start_date) < new Date()) {
            setTitle(constants.overdue);
            btn.classList.replace(withoutActivities, activitiesOverdue);
            break;
          } else if (
            new Date(activity.start_date).getDay() === new Date().getDay()
          ) {
            if (new Date(activity.start_date) >= new Date()) {
              setTitle(constants.today);
              btn.classList.replace(withoutActivities, activitiesPlanned);
              break;
            }
          } else if (i === activities.length - 1) {
            if (constants.today !== title) {
              setTitle(constants.planned);
              btn.classList.replace(withoutActivities, activitiesPlanned);
              break;
            }
          }
        }
      }
    } else isMounted.current = true;
  }, [activities, isMounted.current]);

  const onHandleShowEditActivity = (data) => {
    setCurrentFeed(data);
    setShowModalActivity(true);
    EditFields(data?.feed?.object_data.type);
  };
  const handleShow = (item) => {
    getFields(item);
    setIsBtnType(`${item}`);
    setCurrentFeed(null);
    setShowModalActivity(true);
  };
  const handleCloseModal = () => {
    setShowModalActivity(false);
    setIsFieldsData([]);
  };
  const loader = () => {
    if (loading) return <Loading />;
  };
  return (
    <div className="activities-btn">
      <Dropdown>
        <Dropdown.Toggle
          id={`btn-${dealId}`}
          className={
            'btn-ghost-secondary dropdown-hide-arrow close-button pt-0 position-relative'
          }
          style={{ border: 0, top: '-5px' }}
        >
          <span className={className}>{icon}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu className={`modal-history-activities z-index-99`}>
          <div>
            {activities.length
              ? activities.map((item, i) => {
                  if (i < limit) {
                    return (
                      <Activity
                        key={item.id}
                        data={item}
                        confirm={confirm}
                        onHandleEdit={onHandleShowEditActivity}
                      />
                    );
                  } else return null;
                })
              : null}
          </div>
          <div className="schedule max-w-200 px-0">
            <button
              className="btn btn-light px-2 font-size-sm2 rounded btn-block w-100"
              onClick={() => {
                handleShow('task');
              }}
            >
              <span className={className}>{'task_alt'}</span>
              <span className="ml-1">Create a Task</span>
            </button>
            <button
              className="btn btn-light px-2 font-size-sm2 rounded btn-block w-100"
              onClick={() => {
                handleShow('event');
              }}
            >
              <span className={className}>{'event'}</span>
              <span className="ml-1">Create an Event</span>
            </button>
            <button
              className="btn btn-light px-2 font-size-sm2 rounded btn-block w-100"
              onClick={() => {
                handleShow('call');
              }}
            >
              <span className={className}>{'phone'}</span>
              <span className="ml-1">Log a Call</span>
            </button>
          </div>
        </Dropdown.Menu>
      </Dropdown>
      <RightPanelModal
        showModal={showModalActivity}
        setShowModal={() => {
          overflowing();
          handleCloseModal();
        }}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={540}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center">
            <h3 className="mb-0">
              {currentFeed?.feed_id ? `Edit ${btnType}` : `Add ${btnType}`}
            </h3>
          </div>
        }
      >
        {loading ? (
          loader()
        ) : (
          <AddActivity
            organizationId={organizationId}
            dealId={dealId}
            contactIs={'organization'}
            getProfileInfo={confirm}
            isModal={true}
            btnType={btnType}
            dataType={'deal'}
            allFields={isFieldsData}
            feedInfo={currentFeed}
            feedId={currentFeed?.feed_id}
            activityData={currentFeed?.feed?.object_data}
            closeModal={() => setShowModalActivity(false)}
            organization={organization}
            deal={deal}
            owner={owner}
          />
        )}
      </RightPanelModal>
    </div>
  );
};

export default ActivitiesHistory;
