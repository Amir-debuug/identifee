import React, { useState, useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';
import { Card } from 'react-bootstrap';

import Table from '../../../components/GenericTable';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import {
  initialFilters,
  initialFiltersItems,
  initialPeopleForm,
  peopleColumns,
} from './Contacts.constants';
import contactService from '../../../services/contact.service';
import {
  EMPTY_NAME,
  INVALID_EMAIL,
  OWNER,
  paginationDefault,
  CONTACT_CREATED,
  ADD_CONTACT,
} from '../../../utils/constants';
import { formatPhoneNumber, validateEmail } from '../../../utils/Utils';
import PeopleForm from '../../../components/peoples/PeopleForm';
import { changePaginationPage, reducer } from './utils';
import userService from '../../../services/user.service';
import Loading from '../../../components/Loading';
import routes from '../../../utils/routes.json';
import IdfOwnersHeader from '../../../components/idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import DeleteModal from '../../../components/modal/DeleteModal';
import stringConstants from '../../../utils/stringConstants.json';
import LayoutHead from '../../../components/commons/LayoutHead';
import { sortingTable } from '../../../utils/sortingTable';
import FilterTabsButtonDropdown from '../../../components/commons/FilterTabsButtonDropdown';
import fieldService from '../../../services/field.service';
import { useForm } from 'react-hook-form';
import RightPanelModal from '../../../components/modal/RightPanelModal';
import TableSkeleton from '../../../components/commons/TableSkeleton';
import { groupBy } from 'lodash';

const contactConstants = stringConstants.deals.contacts;

const PEOPLES_FILTER_OPTIONS_LIST = [
  { id: 1, key: 'AllContacts', name: 'All Contacts' },
  { id: 2, key: 'MyContacts', name: 'My Contacts' },
  { id: 3, key: 'AddedLastWeek', name: 'Added Last Week' },
  { id: 4, key: 'AddedThisWeek', name: 'Added This Week' },
  { id: 5, key: 'RecentlyCreated', name: 'Recently Created' },
  { id: 6, key: 'RecentlyModified', name: 'Recently Modified' },
];
const defaultFilter = {
  id: 3,
  key: 'AllContacts',
  name: 'All Contacts',
};

const Peoples = () => {
  const peopleForm = {
    first_name: '',
    last_name: '',
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: peopleForm,
  });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [modal, setModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [filterSelected, setFilterSelected] = useState({});
  const [filtersItems, setFiltersItems] = useState(initialFiltersItems);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [allOwners, setAllOwners] = useState([]);
  const [pagination, setPagination] = useState(paginationDefault);
  const [paginationPage, setPaginationPage] = useState(paginationDefault);
  const [filters] = useReducer(reducer, initialFilters);
  const [peopleFormData, dispatchFormData] = useReducer(
    reducer,
    initialPeopleForm
  );
  const [modified, setModified] = useState(false);
  const [showDeleteContactModal, setShowDeleteContactModal] = useState(false);
  const [deleteResults, setDeleteResults] = useState([]);
  const [showDeleteReport, setShowDeleteReport] = useState(false);
  const [dataInDB, setDataInDB] = useState(false);
  const [me, setMe] = useState(null);
  const [preOwners, setPreOwners] = useState([]);
  const [order, setOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterTabs, setFilterTabs] = useState('filters');
  const [filterOptionSelected, setFilterOptionSelected] =
    useState(defaultFilter);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const currentView = 'contact';
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async () => {
    setIsLoading(true);
    const fieldsData = await fieldService.getFields(currentView, {
      preferred: true,
    });
    groupBySection(fieldsData?.data);
    setIsLoading(false);
  };
  const handleFilterSelect = (e, status) => {
    e.preventDefault();
    setOpenFilter(!openFilter);

    let newFilterSelected = {
      ...filterSelected,
    };

    if (status.key === 'MyContacts') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { assigned_user_id: [me.id] },
      };
    } else if (status.key === 'AllContacts') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { assigned_user_id: null },
      };
    } else if (status.key === 'AddedLastWeek') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { last_week: null },
      };
    } else if (status.key === 'AddedThisWeek') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { this_week: true },
      };
    } else if (status.key === 'RecentlyCreated') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { recently_created: null },
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

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    }
  }, [successMessage]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const getContacts = async (count) => {
    setShowLoading(true);
    const contacts = await contactService
      .getContact(
        { ...filterSelected, order, deleted: false },
        {
          page: paginationPage.page,
          limit: 15,
        }
      )
      .catch((err) => console.log(err));

    const { data } = contacts || {};

    setAllContacts(data?.contacts);
    setPagination(data?.pagination);

    setDataInDB(count ? Boolean(data?.pagination?.totalPages) : false);
    setShowLoading(false);
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
    setAllOwners(response?.users);
  }

  useEffect(() => {
    onGetUsers();
    getContacts(true);
    getCurrentUser();
  }, []);

  useEffect(() => {
    getContacts(true);
  }, [filterSelected, paginationPage, modified, order]);

  const onHandleFilterOrg = (item) => {
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

  const data = allContacts?.map((contact) => {
    const isPrincipalOwner =
      me && contact
        ? me?.role?.admin_access ||
          me?.role?.owner_access ||
          contact?.assigned_user_id === me?.id
        : false;

    return {
      ...contact,
      dataRow: [
        {
          key: 'name',
          component: (
            <Link
              to={`${routes.contacts}/${contact.id}/profile`}
              className="text-black fw-bold"
            >
              {`${contact.first_name} ${contact.last_name}`}
            </Link>
          ),
        },
        {
          key: 'organization',
          label: 'company',
          component: (
            <Link
              to={`${routes.companies}/${contact.organization?.id}/organization/profile`}
              className="text-black"
            >
              {contact.organization?.name}
            </Link>
          ),
        },
        {
          key: 'label',
          label: 'label',
          component: contact?.label ? (
            <Badge
              id={contact.label.id}
              style={{
                fontSize: '12px',
                backgroundColor: `${contact.label.color}`,
              }}
              className="text-uppercase w-100"
            >
              {contact.label.name}
            </Badge>
          ) : null,
        },
        {
          key: 'email',
          label: 'email',
          component: (
            <span>
              {contact.email_work ||
                contact.email_home ||
                contact.email_mobile ||
                contact.email_other}
            </span>
          ),
        },
        {
          key: 'phone',
          label: 'phone',
          component: (
            <span>
              {formatPhoneNumber(
                contact.phone_work ||
                  contact.phone_home ||
                  contact.phone_mobile ||
                  contact.phone_other
              )}
            </span>
          ),
        },
        {
          key: 'total_closed_deals',
          label: 'total_closed_deals',
          component: <span>{contact.total_closed_deals || 0}</span>,
        },
        {
          key: 'total_open_deals',
          label: 'total_open_deals',
          component: <span>{contact.total_open_deals || 0}</span>,
        },
        {
          key: 'owner',
          label: 'owner',
          component: (
            <IdfOwnersHeader
              mainOwner={contact.assigned_user}
              service={contactService}
              serviceId={contact.id}
              listOwners={contact.owners}
              defaultSize="xs"
              isprincipalowner={isPrincipalOwner}
              small
            />
          ),
        },
      ],
    };
  });

  const toggle = () => {
    getFields();
    setModal(!modal);
  };

  const onHandleSubmit = async () => {
    setLoading(true);

    if (!peopleFormData.first_name || !peopleFormData.last_name) {
      setLoading(false);

      return setErrorMessage(EMPTY_NAME);
    }

    const isEmail = peopleFormData.email && validateEmail(peopleFormData.email);

    if (peopleFormData.email && !isEmail) {
      setLoading(false);

      return setErrorMessage(INVALID_EMAIL);
    }

    const newContact = await contactService
      .createContact(peopleFormData)
      .catch((err) => console.log(err));

    if (newContact) {
      await Promise.all(
        preOwners?.map(async (item) => {
          await new Promise((resolve) => {
            contactService
              .addOwner(newContact?.data?.id, item.user_id)
              .then(resolve);
          });
        })
      );

      getContacts(true);
      reset(
        initialPeopleForm,
        dispatchFormData({
          type: 'reset-peopleForm',
        })
      );
      setPreOwners([]);
      setSuccessMessage(CONTACT_CREATED);
      toggle();
    }

    setLoading(false);
  };

  const deleteContacts = async (selectedData) => {
    await contactService
      .deleteContacts(selectedData)
      .then((response) => {
        setDeleteResults(response);
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  const handleDelete = async () => {
    await deleteContacts(selectedData);
    setSelectedData([]);
    setShowDeleteReport(true);
  };

  const openDeleteModal = () => {
    setShowDeleteContactModal(true);
  };

  const loader = () => {
    if (showLoading) return <TableSkeleton cols={8} rows={10} />;
  };

  const onClose = () => {
    reset(
      initialPeopleForm,
      dispatchFormData({
        type: 'reset-peopleForm',
      })
    );
    setModal(false);
  };

  const sortTable = ({ name }) => sortingTable({ name, order, setOrder });

  const handleRowClick = (row, col) => {
    row.dataRow &&
      (col.key === 'name' ||
        col.key === 'owner' ||
        col.key === 'organization' ||
        (window.location = row.dataRow[0].component.props.to));
  };

  const handleClearSelection = () => {
    setSelectAll(false);
    setSelectedData([]);
  };
  const formLoader = () => {
    if (isLoading) return <Loading />;
  };
  return (
    <div>
      <LayoutHead
        onHandleCreate={toggle}
        buttonLabel={ADD_CONTACT}
        selectedData={selectedData}
        onDelete={openDeleteModal}
        allRegister={`${pagination.count || 0} Contacts`}
        dataInDB={dataInDB}
        onClear={handleClearSelection}
        permission={{
          collection: 'contacts',
          action: 'create',
        }}
        alignTop="position-absolute -top-55"
      >
        <FilterTabsButtonDropdown
          options={PEOPLES_FILTER_OPTIONS_LIST}
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
      {showDeleteContactModal && (
        <DeleteModal
          type="contacts"
          showModal={showDeleteContactModal}
          setShowModal={setShowDeleteContactModal}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          event={handleDelete}
          data={allContacts}
          results={deleteResults}
          setResults={setDeleteResults}
          showReport={showDeleteReport}
          setShowReport={setShowDeleteReport}
          modified={modified}
          setModified={setModified}
          constants={contactConstants.delete}
        />
      )}
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
                  showLoading={showLoading}
                  columns={peopleColumns}
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
                  title="people"
                  emptyDataText="No people available yet."
                  dataInDB={dataInDB}
                  toggle={toggle}
                  permission={{
                    collection: 'contacts',
                    action: 'create',
                  }}
                  sortingTable={sortTable}
                  onClickCol={handleRowClick}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      {modal && (
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
              <h3 className="mb-0">{ADD_CONTACT}</h3>
            </div>
          }
        >
          {isLoading ? (
            formLoader()
          ) : (
            <PeopleForm
              dispatch={dispatchFormData}
              allUsers={allOwners}
              peopleFormData={peopleFormData}
              refresh={() => getContacts(true)}
              isprincipalowner="true"
              register={register}
              loading={loading}
              setValue={setValue}
              getFieldState={getFieldState}
              control={control}
              errors={errors}
              onClose={onClose}
              handleSubmit={handleSubmit}
              onHandleSubmit={onHandleSubmit}
              fields={isFieldsData}
              prevalue="true"
              preowners={preOwners}
              setPreOwners={setPreOwners}
            />
          )}
        </RightPanelModal>
      )}
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
    </div>
  );
};

export default Peoples;
