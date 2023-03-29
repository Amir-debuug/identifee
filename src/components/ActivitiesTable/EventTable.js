import React, { useContext, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { COMPANY_DELETED } from '../../utils/constants';
import { sortingTable } from '../../utils/sortingTable';
import routes from '../../utils/routes.json';
import Table from '../GenericTable';
import TableSkeleton from '../commons/TableSkeleton';
import activityService from '../../services/activity.service';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import moment from 'moment';
import Avatar from '../Avatar';
import { DATE_FORMAT } from '../../utils/Utils';
import { Link } from 'react-router-dom';
import MaterialIcon from '../commons/MaterialIcon';
import MoreActions from '../MoreActions';
import TableActions from '../commons/TableActions';
import { AlertMessageContext } from '../../contexts/AlertMessageContext';
const EventTable = ({
  paginationPage,
  users,
  contacts,
  deals,
  tabType,
  isFilterCheck,
  setShowLoading,
  setDataInDB,
  order,
  setOrder,
  pagination,
  showLoading,
  dataInDB,
  setPagination,
  selectedData,
  setSelectedData,
  handleEditActivity,
  setShowDeleteOrgModal,
  deleteResults,
  showDeleteOrgModal,
  setDeleteResults,
  getData,
  allData,
  handleClearSelection,
  selectAll,
  setSelectAll,
  organizations,
}) => {
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [showTooltip, setShowTooltip] = useState(true);
  useEffect(() => {
    getData(tabType);
  }, [pagination?.page, order, isFilterCheck?.filter, tabType]);

  const changePaginationPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    paginationPage?.page === 1 && changePaginationPage(1);
  }, [paginationPage]);
  const getAction = (content) => {
    if (content?.organization) {
      return (
        <Link
          to={`${routes.companies}/${content?.organization?.id}/organization/profile`}
          className="text-black fw-bold"
        >
          {content?.organization && (
            <>
              <MaterialIcon icon="domain" /> {content?.organization?.name}
            </>
          )}
        </Link>
      );
    } else if (content?.contact) {
      const name = `${content?.contact?.first_name} ${content?.contact?.last_name}`;
      return (
        <Link
          to={`${routes.contacts}/${content?.contact?.id}/profile`}
          className="text-black fw-bold"
        >
          {content && (
            <>
              <MaterialIcon icon="people" /> {name}
            </>
          )}
        </Link>
      );
    } else if (content?.deal) {
      return (
        <Link
          to={`${routes.dealsPipeline}/${content?.deal?.id}`}
          className="text-black fw-bold"
        >
          {content?.deal && (
            <>
              <MaterialIcon icon="monetization_on" /> {content?.deal?.name}
            </>
          )}
        </Link>
      );
    }
  };
  const getUserAction = (content) => {
    if (content?.ownerUser) {
      const ownerUser = content?.ownerUser;
      return (
        <Link
          to={`${routes.users}/${ownerUser?.id}`}
          className="text-black fw-bold"
        >
          <div className="d-flex align-items-center gap-1">
            <Avatar user={ownerUser} defaultSize="xs" />{' '}
            <span>{ownerUser?.name}</span>
          </div>
        </Link>
      );
    }
  };
  const columns = [
    {
      key: 'name',
      orderBy: 'name',
      component: 'Title ',
    },
    {
      key: 'from',
      orderBy: 'from',
      component: 'From',
    },
    {
      key: 'to',
      orderBy: 'to',
      component: 'To',
    },
    {
      key: 'related_to',
      orderBy: 'related_to',
      component: 'Related To',
    },
    {
      key: 'owner',
      orderBy: 'owner',
      component: 'Owner',
    },
    {
      key: 'action',
      orderBy: 'action',
      component: 'Action',
    },
  ];
  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      onClick: handleEditActivity,
    },
  ];
  const data = allData?.map((event) => ({
    ...event,
    dataRow: [
      {
        key: 'name',
        component: <span className="pl-2 fw-bold">{event?.name}</span>,
      },
      {
        key: 'start_date',
        component: <span>{moment(event?.start_date).format(DATE_FORMAT)}</span>,
      },
      {
        key: 'end_date',
        component: <span>{moment(event?.end_date).format(DATE_FORMAT)}</span>,
      },
      {
        key: 'related_to',
        component: getAction(event),
      },
      {
        key: 'owner',
        component: getUserAction(event),
      },
      {
        key: 'action',
        component: (
          <div className="d-flex align-items-center">
            <TableActions
              item={{ ...event, title: name }}
              actions={tableActions}
            />
            <a className={`icon-hover-bg cursor-pointer`}>
              <MoreActions
                icon="more_vert"
                items={[
                  {
                    id: 'remove',
                    icon: 'delete',
                    name: 'Delete',
                  },
                ]}
                onHandleRemove={() => handleDelete(event)}
                toggleClassName="w-auto p-0 h-auto"
              />
            </a>
          </div>
        ),
      },
    ],
  }));

  const sortTable = ({ name }) => {
    if (name === 'action') return null;
    sortingTable({ name, order, setOrder });
  };
  const loader = () => {
    if (showLoading) return <TableSkeleton cols={6} rows={10} />;
  };

  const deleteOrganizations = async () => {
    await activityService
      .deleteActivity(
        selectedData.length > 0 ? selectedData : deleteResults?.id
      )
      .then(() => {
        setSuccessMessage(COMPANY_DELETED);
        getData('event');
        setShowDeleteOrgModal(false);
        handleClearSelection();
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  const openDeleteModal = async () => {
    setShowDeleteOrgModal(true);
    await deleteOrganizations();
  };
  const handleDelete = (data) => {
    setShowDeleteOrgModal(true);
    setDeleteResults(data);
  };
  useEffect(() => {
    if (!showDeleteOrgModal) {
      handleClearSelection();
    }
  }, [!showDeleteOrgModal]);
  return (
    <div>
      <Card className="mb-5">
        <Card.Body className="p-0">
          <div className="table-responsive-md datatable-custom">
            <div
              id="datatable_wrapper"
              className="dataTables_wrapper no-footer"
            >
              {showLoading ? (
                loader()
              ) : (
                <Table
                  checkbox
                  columns={columns}
                  data={data}
                  setDeleteResults={setDeleteResults}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={changePaginationPage}
                  emptyDataText="No event available yet."
                  // onClick={handleEditModalShow}
                  title="event"
                  dataInDB={dataInDB}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  sortingTable={sortTable}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      <DeleteConfirmationModal
        showModal={showDeleteOrgModal}
        setShowModal={setShowDeleteOrgModal}
        setShowRolesData={setSelectedData}
        itemsConfirmation={[deleteResults]}
        itemsReport={[]}
        event={openDeleteModal}
        data={allData}
        setSelectedCategories={() => {}}
      />
    </div>
  );
};

export default EventTable;
