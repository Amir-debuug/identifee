import React, { useContext, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { COMPANY_DELETED } from '../../utils/constants';
import stringConstants from '../../utils/stringConstants.json';
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
const constants = stringConstants.calls;
const CallTable = ({
  paginationPage,
  users,
  contacts,
  deals,
  order,
  setOrder,
  pagination,
  tabType,
  isFilterCheck,
  showLoading,
  dataInDB,
  setPagination,
  selectedData,
  setSelectedData,
  setShowDeleteOrgModal,
  deleteResults,
  showDeleteOrgModal,
  setDeleteResults,
  handleClearSelection,
  selectAll,
  getData,
  allData,
  setSelectAll,
  handleEditActivity,
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
  const markAsDone = async (id) => {
    try {
      await activityService.markAsCompleted(id);
      getData('call');
      setSuccessMessage(constants.completed);
    } catch (error) {
      setErrorMessage(constants.errorCallActivity);
    }
  };
  const cancelCall = async (id) => {
    try {
      await activityService.cancelActivity(id);
      getData('call');
      setSuccessMessage(constants.canceled);
    } catch (error) {
      setErrorMessage(constants.errorCallActivity);
    }
  };
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
            <Avatar user={ownerUser} defaultSize="xs" />
            <span>{ownerUser?.name}</span>
          </div>
        </Link>
      );
    }
  };
  const columns = [
    {
      key: 'user',
      orderBy: 'name',
      component: 'To/From',
    },
    {
      key: 'call_type',
      orderBy: 'call_type',
      component: 'Call Type',
    },
    {
      key: 'call_start_time',
      orderBy: 'call_start_time',
      component: 'Call Start Time',
    },
    {
      key: 'status',
      orderBy: 'status',
      component: 'Status',
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
  const data = allData?.map((call) => ({
    ...call,
    dataRow: [
      {
        key: 'name',
        component: <span className="pl-2 fw-bold">{call?.name}</span>,
      },
      {
        key: 'call_type',
        component: <span>{call?.type}</span>,
      },
      {
        key: 'start_date',
        component: <span>{moment(call?.start_date).format(DATE_FORMAT)}</span>,
      },
      {
        key: 'status',
        component: <span>{call?.done ? 'Completed' : 'In Progress'}</span>,
      },
      {
        key: 'related_to',
        component: getAction(call),
      },
      {
        key: 'owner',
        component: getUserAction(call),
      },
      {
        key: 'action',
        component: (
          <div className="d-flex align-items-center">
            <TableActions
              item={{ ...call, title: name }}
              actions={tableActions}
            />
            <a className={`icon-hover-bg cursor-pointer`}>
              <MoreActions
                icon="more_vert"
                items={[
                  {
                    id: 'edit',
                    icon: 'check_circle',
                    name: 'Mark as done',
                    className: call.done
                      ? 'd-none'
                      : call.canceledOn
                      ? 'd-none'
                      : '',
                  },
                  {
                    id: 'download',
                    icon: 'call',
                    name: 'Cancel Call',
                    className: call.canceledOn
                      ? 'd-none'
                      : call.done
                      ? 'd-none'
                      : '',
                  },
                  {
                    id: 'add',
                    icon: 'update',
                    name: 'Reschedule Call',
                    className: call.done
                      ? 'd-none'
                      : call.canceledOn
                      ? 'd-none'
                      : '',
                  },
                  {
                    id: 'remove',
                    icon: 'delete',
                    name: 'Delete',
                  },
                ]}
                onHandleRemove={() => handleDelete(call)}
                onHandleEdit={() => markAsDone(call.id)}
                onHandleDownload={() => cancelCall(call.id)}
                onHandleAdd={() => handleEditActivity(call)}
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
        getData('call');
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
                  emptyDataText="No call available yet."
                  // onClick={handleEditModalShow}
                  title="call"
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

export default CallTable;
