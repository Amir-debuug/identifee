import React, { useEffect, useState } from 'react';
import { Spinner } from 'reactstrap';
import { Card } from 'react-bootstrap';
import tenantService from '../../services/tenant.service';
import { paginationDefault } from '../../utils/constants';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import stringConstants from '../../utils/stringConstants.json';
import { sortingTable } from '../../utils/sortingTable';
import Table from '../GenericTable';
import LayoutHead from '../commons/LayoutHead';
import CreateTenantModal from './CreateTenantModal';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import { DATE_FORMAT } from '../../utils/Utils';
import MoreActions from '../MoreActions';
import TableSkeleton from '../commons/TableSkeleton';
import authService from '../../services/auth.service';
import { DataFilters } from '../DataFilters';

const constants = stringConstants.tenants;
const limit = 10;
const includeOwners = true;
const TenantTable = ({ paginationPage }) => {
  const [showLoading, setShowLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dataInDB, setDataInDB] = useState(false);
  const [order, setOrder] = useState([]);
  const [selectedEditData, setSelectedEditData] = useState('');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [allTenants, setAllTenants] = useState([]);
  const [showTooltip, setShowTooltip] = useState(true);
  const [createTenantResponse, setCreateTenantResponse] = useState();
  const [filter, setFilter] = useState({});
  const [spinner, setSpinner] = useState(false);
  const [spinnerId, setSpinnerId] = useState();
  const defaultComponentForm = {
    name: '',
    module: '',
    measures: [],
    dimensions: [],
    timeDimensions: [],
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultComponentForm,
  });

  const getActionItemsByUserStatus = () => {
    const actions = [
      {
        id: 'edit',
        name: 'Edit',
        icon: 'edit',
        onClick: handleEditModalShow,
      },
      {
        id: 'add',
        name: 'Ghost Login',
        icon: 'login',
        onClick: ghoostLogin,
      },
    ];
    return actions;
  };
  const getTenants = async () => {
    setShowLoading(true);
    try {
      const tenants = await tenantService.getTenants(
        order,
        { ...pagination, limit },
        includeOwners,
        { ...filter }
      );
      setPagination(tenants.pagination);
      setDataInDB(Boolean(tenants?.pagination?.totalPages));
      setAllTenants(tenants.data);
      setShowLoading(false);
    } catch (err) {
      setErrorMessage(constants.create?.groupCreatedFailed);
    }
  };
  const changePaginationPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    getTenants();
  }, []);

  useEffect(() => {
    getTenants();
  }, [pagination?.page, order, filter]);

  useEffect(() => {
    paginationPage?.page === 1 && changePaginationPage(1);
  }, [paginationPage]);

  const validationConfig = {
    name: {
      required: 'Component Name is required.',
      inline: false,
    },
    module: {
      required: true,
    },
    measures: {
      required: true,
    },
    dimensions: {
      required: true,
    },
    timeDimensions: {
      required: true,
    },
  };
  const ghoostLogin = async (item) => {
    if (item.users.length) {
      try {
        setSpinner(true);
        const impersonateUser = await authService.impersonate(item.users[0].id);
        setSpinner(false);
        window.open(
          `https://${item.domain}/login?access_token=${impersonateUser.access_token}&refresh_token=${impersonateUser.refresh_token}`,
          '_blank'
        );
      } catch (e) {
        setErrorMessage(constants.edit.ghost);
        setSpinner(false);
      }
    } else {
      setErrorMessage(constants.edit.userError);
    }
  };
  const handleEditModalShow = async (item) => {
    setSpinner(true);
    const singleTenant = await tenantService.getSingleTenant(item.id);
    setSpinner(false);
    singleTenant &&
      setSelectedEditData({
        name: singleTenant?.name || '',
        description: singleTenant?.description || '',
        id: singleTenant?.id || '',
        domain: singleTenant?.domain || '',
        ownerEmail: singleTenant?.ownerEmail || '',
        modules: singleTenant?.modules || '',
        tenantInfo: singleTenant?.domain || '',
        colors: singleTenant?.colors || '',
        icon: singleTenant?.icon || '',
        logo: singleTenant?.logo || '',
        use_logo: singleTenant?.use_logo || '',
      });
    setShowCreateRoleModal(true);
  };
  const handleUpdate = async (data) => {
    try {
      setShowLoading(true);
      const createResponce = await tenantService.updateTenant(
        data,
        selectedEditData.id
      );

      if (createResponce) {
        getTenants();
        setShowLoading(false);
        setSuccessMessage(constants.edit.TenantUpdateSuccess);
        setShowCreateRoleModal(false);
      } else {
        setShowLoading(false);
        setErrorMessage(constants.edit.TenantUpdateFailed);
      }
    } catch (error) {}
  };
  const handlePropagation = (e, id) => {
    e.stopPropagation();
    setSpinnerId(id);
  };
  const columns = [
    {
      key: 'name',
      orderBy: 'name',
      component: 'Tenant Name',
    },
    {
      key: 'domain',
      orderBy: 'domain',
      component: 'Tenant Domain',
    },
    {
      key: 'users',
      orderBy: 'users',
      component: 'Users',
    },
    {
      key: 'last_modified',
      orderBy: 'last_modified',
      component: 'Last Modified',
    },
    {
      key: 'action',
      orderBy: 'action',
      component: 'Actions',
    },
  ];
  const data = allTenants?.map((tenant, id) => ({
    ...tenant,
    dataRow: [
      {
        key: 'name',
        component: <span className="pl-2">{tenant?.name}</span>,
      },
      {
        key: 'domain',
        component: <span>{tenant?.domain}</span>,
      },
      {
        key: 'users',
        component: <span>{tenant?.users.length}</span>,
      },
      {
        key: 'last_modified',
        component: (
          <span>{moment(tenant?.updated_at).format(DATE_FORMAT)}</span>
        ),
      },
      {
        key: 'action',
        component: (
          <a
            onClick={(e) => {
              handlePropagation(e, id);
            }}
          >
            {spinner && id === spinnerId ? (
              <Spinner color="primary" size="sm" className="m-1" />
            ) : (
              <MoreActions
                items={getActionItemsByUserStatus()}
                onHandleEdit={() => {
                  handleEditModalShow({ ...tenant, title: name });
                }}
                onHandleAdd={() => {
                  ghoostLogin({ ...tenant, title: name });
                }}
              />
            )}
          </a>
        ),
      },
    ],
  }));

  const handleCreateTenant = async (data) => {
    setShowLoading(true);
    try {
      if (!data?.colors) {
        setShowLoading(false);
        setErrorMessage('Please select color!');
        setCreateTenantResponse(false);
        return false;
      } else {
        const createResponce = await tenantService.createTenant(data);
        if (!createResponce.response) {
          getTenants();
          setShowLoading(false);
          setSuccessMessage(constants.create.TenantCreatedSuccess);
          setShowCreateRoleModal(false);
          setCreateTenantResponse(true);
        } else {
          setShowLoading(false);
          createResponce.response.request.status === 500
            ? setErrorMessage(constants.create.TenantCreatedFailed)
            : setErrorMessage(createResponce.response?.data?.error);
          setCreateTenantResponse(false);
          return false;
        }
        return createTenantResponse;
      }
    } catch (error) {}
  };

  const sortTable = ({ name }) => {
    if (name === 'last_modified') name = 'updated_at';
    if (name === 'action') return null;
    sortingTable({ name, order, setOrder });
  };
  const loader = () => {
    if (showLoading) return <TableSkeleton cols={4} rows={10} />;
  };
  return (
    <>
      <LayoutHead
        onHandleCreate={() => setShowCreateRoleModal(true)}
        buttonLabel={constants.edit.add}
        selectedData={selectedData}
        onDelete={true}
        headingTitle=""
        dataInDB={dataInDB}
      />
      <Card className="mb-5">
        <Card.Header>
          <DataFilters
            filterSelected={filter}
            setFilterSelected={setFilter}
            searchPlaceholder="Search tenant"
            paginationPage={pagination}
            setPaginationPage={setPagination}
          />
        </Card.Header>
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
                  columns={columns}
                  data={data}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={changePaginationPage}
                  emptyDataText="No Tenant available yet."
                  onClick={handleEditModalShow}
                  title="Tenant"
                  dataInDB={dataInDB}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  toggle={() => setShowCreateRoleModal(true)}
                  sortingTable={sortTable}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      {showCreateRoleModal && (
        <CreateTenantModal
          showModal={showCreateRoleModal}
          setShowModal={setShowCreateRoleModal}
          handleCreateTenant={handleCreateTenant}
          showLoading={showLoading}
          errors={errors}
          config={validationConfig}
          register={register}
          handleSubmit={handleSubmit}
          reset={reset}
          setValue={setValue}
          selectedEditData={selectedEditData}
          setSelectedEditData={setSelectedEditData}
          handleUpdateTenant={handleUpdate}
        />
      )}
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default TenantTable;
