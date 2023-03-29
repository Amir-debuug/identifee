import React, { useState } from 'react';
import AddActivity from './peopleProfile/contentFeed/AddActivity';
import fieldService from '../services/field.service';
import Loading from './Loading';
import RightPanelModal from './modal/RightPanelModal';
import { Card, CardBody, CardHeader } from 'reactstrap';
import ButtonFilterDropdown from './commons/ButtonFilterDropdown';
import ButtonIcon from './commons/ButtonIcon';
import Steps from './steps/Steps';
import { overflowing } from '../utils/Utils';
import { groupBy } from 'lodash';

const activityFiltersList = [
  { key: 'all', name: 'All Activities' },
  { key: 'open', name: 'Open Activities' },
  { key: 'closed', name: 'Closed Activities' },
];
export const AddActivityButtonsGroup = ({
  componentId,
  contactId,
  organizationId,
  dealId,
  getProfileInfo,
  contactIs,
  contactInfo,
  profileInfo,
  dataType,
  deal,
  organization,
  setRefreshRecentFiles,
  activityIdOpen,
  me,
  step,
  isDeal,
  isContact,
  refresh,
  setRefresh,
}) => {
  const [isShow, setShowModal] = useState(false);
  const [btnType, setIsBtnType] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldsBySection, setFieldsBySection] = useState([]);
  const [activityFilter, setActivityFilter] = useState(activityFiltersList[0]);
  const [filterBy, setFilterBy] = useState({ type: ['task', 'event', 'call'] });
  const groupBySection = (fieldsList) => {
    setFieldsBySection(groupBy(fieldsList, 'section'));
  };
  const getFields = async (type) => {
    setLoading(true);
    const { data } = await fieldService.getFields(type, {
      preferred: true,
    });
    if (data?.length > 0) {
      groupBySection(data);
      setLoading(false);
    } else {
      const { data } = await fieldService.createDefaultFields(type);
      groupBySection(data);
      setLoading(false);
    }
  };
  const handleShow = (item) => {
    getFields(item);
    setShowModal(true);
    setIsBtnType(item);
  };
  const closeModal = () => {
    setShowModal(false);
    setIsBtnType('');
  };
  const loader = () => {
    if (loading) return <Loading />;
  };

  return (
    <Card className="p-0 border-0 rounded-0 shadow-0">
      <CardHeader className="justify-content-between px-3 pt-0">
        <ButtonFilterDropdown
          buttonText="Dashboards"
          options={activityFiltersList}
          filterOptionSelected={activityFilter}
          handleFilterSelect={(e, item) => {
            setActivityFilter(item);
            const { key } = item;
            if (key === 'all') {
              setFilterBy({ type: ['task', 'event', 'call'] });
            } else {
              setFilterBy({
                type: ['task', 'event', 'call'],
                done: key === 'closed',
              });
            }
          }}
          menuClass="drop-menu-card"
        />
        <div className="d-flex align-items-center gap-2">
          {['Call', 'Task', 'Event'].map((btn) => (
            <ButtonIcon
              key={btn}
              color="outline-primary"
              classnames="btn-sm rounded-pill pr-3 font-size-sm font-weight-medium"
              icon="add"
              onclick={() => handleShow(btn.toLowerCase())}
              label={btn}
            />
          ))}
        </div>
      </CardHeader>
      {!step && (
        <CardBody className={`p-3 pt-0 ${step ? 'shadow-none' : ''}`}>
          <Steps
            organizationId={organizationId}
            getProfileInfo={getProfileInfo}
            openActivityId={activityIdOpen}
            organization={organization}
            dataType={dataType}
            setRefreshRecentFiles={setRefreshRecentFiles}
            me={me}
            filteredBy={filterBy}
            layout="new"
            layoutType="activity"
            isDeal={isDeal}
            deal={deal}
            dealId={deal?.id}
            isContact={isContact}
            contactId={contactId}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        </CardBody>
      )}
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
              <h3 className="mb-0">Add {btnType}</h3>
            </div>
          }
        >
          {loading ? (
            loader()
          ) : (
            <AddActivity
              dataType={dataType}
              btnType={btnType}
              componentId={componentId}
              contactId={contactId}
              organizationId={organizationId}
              dealId={dealId}
              getProfileInfo={getProfileInfo}
              contactIs={contactIs}
              isModal={isShow}
              contactInfo={contactInfo}
              profileInfo={profileInfo}
              deal={deal}
              allFields={fieldsBySection}
              closeModal={() => {
                overflowing();
                closeModal();
              }}
              organization={organization}
            />
          )}
        </RightPanelModal>
      )}
    </Card>
  );
};
