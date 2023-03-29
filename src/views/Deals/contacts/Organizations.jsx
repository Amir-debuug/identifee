import React, { useState, useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';
import { Card } from 'react-bootstrap';

import Table from '../../../components/GenericTable';
import {
  initialFilters,
  initialFiltersItems,
  organizationColumns,
} from './Contacts.constants';
import organizationService from '../../../services/organization.service';
import {
  ADD_COMPANY,
  OWNER,
  paginationDefault,
  COMPANY_CREATED,
} from '../../../utils/constants';
import OrganizationForm from '../../../components/organizations/OrganizationForm';
import { changePaginationPage, reducer } from './utils';
import userService from '../../../services/user.service';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import routes from '../../../utils/routes.json';
import { orgDynamicFields } from '../../../components/organizations/organizationFormsFields';
import DeleteModal from '../../../components/modal/DeleteModal';

import stringConstants from '../../../utils/stringConstants.json';
import LayoutHead from '../../../components/commons/LayoutHead';
import { sortingTable } from '../../../utils/sortingTable';
import {
  formatPhoneNumber,
  numberWithCommas,
  roundNumbers,
  splitAddress,
} from '../../../utils/Utils';
import FilterTabsButtonDropdown from '../../../components/commons/FilterTabsButtonDropdown';
import fieldService from '../../../services/field.service';
import { useForm } from 'react-hook-form';
import RightPanelModal from '../../../components/modal/RightPanelModal';
import TableSkeleton from '../../../components/commons/TableSkeleton';
import { groupBy } from 'lodash';
import { usePagesContext } from '../../../contexts/pagesContext';
const organizationConstants = stringConstants.deals.organizations;

const ORGANIZATION_FILTER_OPTIONS_LIST = [
  { id: 1, key: 'AllOrganizations', name: 'All Companies' },
  { id: 2, key: 'MyOrganization', name: 'My Companies' },
  { id: 3, key: 'AddedLastWeek', name: 'Added Last Week' },
  { id: 4, key: 'AddedThisWeek', name: 'Added This Week' },
  { id: 5, key: 'RecentlyCreated', name: 'Recently Created' },
  { id: 6, key: 'RecentlyModified', name: 'Recently Modified' },
];
const defaultFilter = {
  id: 3,
  key: 'AllOrganizations',
  name: 'All Companies',
};

const Organizations = () => {
  const organizationObj = {
    name: '',
  };
  const {
    register,
    handleSubmit,
    reset,
    getFieldState,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: organizationObj,
  });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [modal, setModal] = useState(false);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [filterSelected, setFilterSelected] = useState({});
  const [filtersItems, setFiltersItems] = useState(initialFiltersItems);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const [paginationPage, setPaginationPage] = useState(paginationDefault);
  const [order, setOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters] = useReducer(reducer, initialFilters);

  const [modified, setModified] = useState(false);
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [deleteResults, setDeleteResults] = useState([]);
  const [showDeleteReport, setShowDeleteReport] = useState(false);
  const [dataInDB, setDataInDB] = useState(false);
  const [me, setMe] = useState(null);
  const [preOwners, setPreOwners] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterTabs, setFilterTabs] = useState('filters');
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [isFieldsObj, setIsFieldsObj] = useState(organizationObj);
  const { pageContext } = usePagesContext();
  const [filterOptionSelected, setFilterOptionSelected] =
    useState(defaultFilter);

  const handleFilterSelect = (e, status) => {
    setPaginationPage('');
    e.preventDefault();
    setOpenFilter(!openFilter);

    let newFilterSelected = {
      ...filterSelected,
    };

    if (status.key === 'MyOrganization') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { assigned_user_id: [me.id] },
      };
    } else if (status.key === 'AllOrganizations') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { assigned_user_id: null },
      };
    } else if (status.key === 'AddedLastWeek') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { last_week: true },
      };
    } else if (status.key === 'AddedThisWeek') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { this_week: true },
      };
    } else if (status.key === 'RecentlyCreated') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { recent_created: true },
      };
    } else if (status.key === 'RecentlyModified') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { recent_modified: true },
      };
    }

    const hasFilters = Object.keys(newFilterSelected.filter);

    if (!hasFilters.length) delete newFilterSelected.filter;

    setFilterSelected(newFilterSelected);

    setFilterOptionSelected(status);
  };

  async function onGetUsers() {
    const response = await userService
      .getUsers(
        {
          search: '',
          users: [],
          filters: '',
        },
        {}
      )
      .catch((err) => err);

    const { data } = response || {};

    const newFilterOptions = filtersItems.slice();

    newFilterOptions.push({
      id: newFilterOptions.length,
      label: OWNER,
      name: 'assigned_user_id',
      options: data?.users,
      type: 'search',
    });

    setFiltersItems(newFilterOptions);
  }

  const getOrganizations = async (count) => {
    setShowLoading(true);

    const organizations = await organizationService
      .getOrganizations(
        { ...filterSelected, order, deleted: false },
        {
          page: paginationPage.page,
          limit: 15,
        }
      )
      .catch((err) => console.log(err));

    const { data } = organizations || {};

    setAllOrganizations(data?.organizations);
    setPagination(data?.pagination);

    setDataInDB(count ? Boolean(data?.pagination?.count) : false);
    setShowLoading(false);
  };

  useEffect(() => {
    (async () => {
      onGetUsers();
      if (pageContext?.RefreshCompanyList) getOrganizations(true);

      const me = await getCurrentUser().catch((err) => console.log(err));

      setMe(me);
      const getOwnerUserId = {
        ...isFieldsObj,
        assigned_user_id: me?.id,
        user: me,
      };
      setIsFieldsObj(getOwnerUserId);
    })();
  }, [pageContext]);

  useEffect(() => {
    if (paginationPage || modified || order || filterSelected) {
      getOrganizations(true);
    }
  }, [paginationPage, modified, order, filterSelected]);

  const getCurrentUser = async () => {
    const user = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    return user;
  };

  const deleteOrganizations = async (selectedData) => {
    await organizationService
      .deleteOrganizations(selectedData)
      .then((response) => {
        setDeleteResults(response);
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };
  const handleDelete = async () => {
    await deleteOrganizations(selectedData);
    setSelectedData([]);
    setShowDeleteReport(true);
  };

  const openDeleteModal = () => {
    setShowDeleteOrgModal(true);
  };

  const data = allOrganizations?.map((organization) => {
    return {
      ...organization,
      dataRow: [
        {
          key: 'name',
          component: (
            <Link
              to={`${routes.companies}/${organization.id}/organization/profile`}
              className="text-black fw-bold"
            >
              {organization.name}
            </Link>
          ),
        },
        {
          key: 'label',
          label: 'label',
          component: organization?.label ? (
            <Badge
              id={organization.label.id}
              style={{
                fontSize: '11px',
                backgroundColor: `${organization.label.color}`,
              }}
              className="text-uppercase p-2"
            >
              {organization?.label?.name}
            </Badge>
          ) : null,
        },
        {
          key: 'address',
          label: 'address',
          component: (
            <span>
              {`            
              ${
                organization.address_city
                  ? organization.address_city + ', '
                  : ''
              } 
              ${organization.address_state ? organization.address_state : ''} 
              ${
                organization.address_country ? organization.address_country : ''
              }
            `}
            </span>
          ),
        },
        {
          key: 'phone',
          label: 'phone',
          component: (
            <span>{formatPhoneNumber(organization.phone_office)}</span>
          ),
        },
        {
          key: 'total_revenue',
          label: 'total_revenue',
          component:
            organization.annual_revenue && !isNaN(organization.annual_revenue)
              ? `$${roundNumbers(organization.annual_revenue, 'short', 2)}`
              : '0',
        },
        {
          key: 'employees',
          label: 'employees',
          component: (
            <span>
              {organization.employees
                ? numberWithCommas(organization.employees)
                : '0'}
            </span>
          ),
        },
      ],
    };
  });

  const onHandleFilterOrg = (item) => {
    // setFilterRefresh(true);
    const newFilterSelected = {
      ...filterSelected,
      filter: item && item.id ? { assigned_user_id: [item.id] } : filters,
    };
    const hasFilters = Object.keys(newFilterSelected.filter);
    if (!hasFilters.length) delete newFilterSelected.filter;

    setFilterSelected(newFilterSelected);
    setOpenFilter(false);

    setFilterOptionSelected({
      key: item.id,
      id: item.id,
      name: `${item?.first_name} ${item?.last_name}`,
    });
  };
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const currentView = 'organization';
  const getFields = async () => {
    setIsLoading(true);
    const { data } = await fieldService.getFields(currentView, {
      preferred: true,
    });
    groupBySection(data);
    setIsLoading(false);
  };

  const toggle = () => {
    setModal(!modal);
    reset(organizationObj);
    getFields();
  };

  const onHandleSubmit = async () => {
    setLoading(true);
    // set US as country for now
    isFieldsObj.address_country = 'USA';

    // here splitting address back to what API needs
    isFieldsObj.address_street = isFieldsObj?.address_full
      ? splitAddress(isFieldsObj.address_full)?.address
      : '';

    const newContact = await organizationService
      .createOrganization(isFieldsObj)
      .catch((err) => console.log(err));

    if (newContact) {
      await Promise.all(
        preOwners?.map(async (item) => {
          await new Promise((resolve) => {
            organizationService
              .addOwner(newContact?.data?.id, item.user_id)
              .then(resolve);
          });
        })
      );
      getOrganizations(true);
      const dataUpdate = {
        ...isFieldsObj,
        assigned_user_id: me?.id,
      };
      setIsFieldsObj(dataUpdate);
      setPreOwners([]);
      setSuccessMessage(COMPANY_CREATED);

      toggle();
    }

    setLoading(false);
  };

  const loader = () => {
    if (showLoading) return <TableSkeleton cols={6} rows={10} />;
  };

  const onClose = () => {
    setModal(false);
    reset(organizationObj);
  };

  const sortTable = ({ name }) => sortingTable({ name, order, setOrder });

  const handleRowClick = (row, col) => {
    row.dataRow &&
      (col.key === 'name' ||
        col.key === 'owner' ||
        (window.location = row.dataRow[0].component.props.to));
  };

  const handleClearSelection = () => {
    setSelectAll(false);
    setSelectedData([]);
  };
  return (
    <div>
      <LayoutHead
        onHandleCreate={toggle}
        buttonLabel={'Add Company'}
        alignTop="position-absolute -top-55"
        selectedData={selectedData}
        onDelete={openDeleteModal}
        allRegister={`${pagination?.count || 0} Companies`}
        dataInDB={dataInDB}
        permission={{
          collection: 'contacts',
          action: 'create',
        }}
        onClear={handleClearSelection}
      >
        <FilterTabsButtonDropdown
          options={ORGANIZATION_FILTER_OPTIONS_LIST}
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          filterOptionSelected={filterOptionSelected}
          filterSelected={filterSelected}
          filterTabs={filterTabs}
          handleFilterSelect={handleFilterSelect}
          onHandleFilterOrg={onHandleFilterOrg}
          setFilterOptionSelected={setFilterOptionSelected}
          setFilterSelected={setFilterSelected}
          setFilterTabs={setFilterTabs}
          defaultSelection={defaultFilter}
        />
      </LayoutHead>
      {showDeleteOrgModal && (
        <DeleteModal
          type="organizations"
          showModal={showDeleteOrgModal}
          setShowModal={setShowDeleteOrgModal}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          event={handleDelete}
          data={allOrganizations}
          results={deleteResults}
          setResults={setDeleteResults}
          showReport={showDeleteReport}
          setShowReport={setShowDeleteReport}
          modified={modified}
          setModified={setModified}
          constants={organizationConstants.delete}
        />
      )}
      {/* <DataFilters
          filterSelected={filterSelected}
          setFilterSelected={setFilterSelected}
          searchPlaceholder={SEARCH_ORGANIZATIONS}
          paginationPage={paginationPage}
          setPaginationPage={setPaginationPage}
        > */}

      {/* </DataFilters> */}
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
                  columns={organizationColumns}
                  data={data}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  onPageChange={(newPage) =>
                    changePaginationPage(newPage, setPaginationPage)
                  }
                  paginationInfo={pagination}
                  usePagination
                  title="organization"
                  dataInDB={dataInDB}
                  emptyDataText="No organizations available yet."
                  toggle={toggle}
                  sortingTable={sortTable}
                  onClickCol={handleRowClick}
                  permission={{
                    collection: 'contacts',
                    action: 'create',
                  }}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      <RightPanelModal
        showModal={modal}
        setShowModal={() => onClose()}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={540}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center">
            <h3 className="mb-0">{ADD_COMPANY}</h3>
          </div>
        }
      >
        <OrganizationForm
          setIsFieldsObj={setIsFieldsObj}
          isFieldsObj={isFieldsObj}
          checkFieldsType={orgDynamicFields}
          fields={isFieldsData}
          refresh={() => getOrganizations(true)}
          me={me}
          onClose={onClose}
          isLoading={isLoading}
          loading={loading}
          onHandleSubmit={onHandleSubmit}
          handleSubmit={handleSubmit}
          register={register}
          setValue={setValue}
          getFieldState={getFieldState}
          control={control}
          errors={errors}
          labelType="organization"
          isprincipalowner="true"
          service={organizationService}
          prevalue="true"
          preowners={preOwners}
          setPreOwners={setPreOwners}
          fromNavBar
        />
      </RightPanelModal>

      <AlertWrapper>
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
    </div>
  );
};

export default Organizations;
