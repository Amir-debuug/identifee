import React, { useEffect, useState, useRef } from 'react';

import ButtonIcon from '../../../components/commons/ButtonIcon';
import Board from '../../../components/deals/Board';
import {
  DEALS_LABEL_BUTTON,
  OWNER,
  SEARCH,
  paginationDefault,
  NEW_STAGE_ID,
} from '../../../utils/constants';
import dealService from '../../../services/deal.service';
import pipelineService from '../../../services/pipeline.services';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import DealList from './DealList';
import userService from '../../../services/user.service';
import { DataFilters } from '../../../components/DataFilters';
import AddDeal from '../../../components/peopleProfile/deals/AddDeal';
import { sortingTable } from '../../../utils/sortingTable';
import stageService from '../../../services/stage.service';
import Skeleton from 'react-loading-skeleton';
import { usePipelineBoardContext } from '../../../contexts/PipelineBoardContext';
import moment from 'moment';
import TooltipComponent from '../../../components/lesson/Tooltip';
import { DATE_FORMAT_Z2, isPermissionAllowed } from '../../../utils/Utils';
import ButtonFilterDropdown from '../../../components/commons/ButtonFilterDropdown';
import FilterTabsButtonDropdown from '../../../components/commons/FilterTabsButtonDropdown';

const initialFiltersItems = [];

const DEALS_FILTER_OPTIONS_LIST = [
  { id: 1, key: 'RecentlyViewed', name: 'Recently Viewed' },
  { id: 2, key: 'MyDeals', name: 'My Deals' },
  { id: 3, key: 'AllDeals', name: 'All Deals' },
  { id: 4, key: 'opened', name: 'Open Deals' },
  { id: 5, key: 'closed', name: 'Closed Deals' },
  { id: 6, key: 'won', name: 'Won Deals' },
  { id: 7, key: 'lost', name: 'Lost Deals' },
  { id: 8, key: 'deleted', name: 'Deleted Deals' },
  { id: 9, key: 'OneMonth', name: 'Deals created in this month' },
  { id: 10, key: 'ThreeMonths', name: 'More than 3 months old deals' },
];

const defaultFilter = {
  id: 4,
  key: 'opened',
  name: 'Open Deals',
};

const BoardLoader = ({ count }) => {
  const [loaderCount] = useState(Array(count).fill(0));
  const ColumnLoader = () => {
    return (
      <div className="px-1 text-center pipeline-board-edit">
        <Skeleton
          count={6}
          height={80}
          className="my-2 d-block w-100 deal-col"
        />
      </div>
    );
  };
  return (
    <div className="d-flex justify-content-between flex-row w-100 parent-column">
      {loaderCount.map((_, index) => (
        <ColumnLoader key={index} />
      ))}
    </div>
  );
};

const SaveCancelPipelineRow = ({
  togglePipelineEdit,
  onSavePipeline,
  loading,
  refreshBoard,
}) => {
  const handleCancel = () => {
    refreshBoard();
  };

  return (
    <div className="d-flex justify-content-end w-100 align-items-center">
      <button
        value="cancel"
        className="btn btn-sm btn-white mr-2"
        onClick={handleCancel}
      >
        Cancel
      </button>
      <ButtonIcon
        icon="save"
        classnames="btn-sm ml-1 border-0"
        loading={loading}
        label="Save Pipeline"
        onclick={onSavePipeline}
      />
    </div>
  );
};

const Nav = ({ active = false, onclick, togglePipelineEdit }) => {
  return (
    <div className="mx-3">
      <ul
        className="nav nav-segment border bg-white p-0"
        id="leadsTab"
        role="tablist"
      >
        <li className="nav-item">
          <TooltipComponent title="Column view">
            <a
              className={`btn-sm btn rounded-0 hover-icon bg-hover-gray ${
                active ? 'bg-gray-300 fw-bold text-primary' : ''
              }`}
              id="pipeline-tab"
              data-toggle="tab"
              role="tab"
              aria-controls="pipeline"
              aria-selected="true"
              onClick={onclick}
            >
              <i
                className="material-icons-outlined font-size-xxl"
                data-uw-styling-context="true"
              >
                view_week
              </i>
            </a>
          </TooltipComponent>
        </li>
        <li className="nav-item">
          <TooltipComponent title="List view">
            <a
              className={`btn-sm btn rounded-0 hover-icon bg-hover-gray ${
                !active ? 'bg-gray-300 fw-bold text-primary' : ''
              }`}
              id="list-tab"
              data-toggle="tab"
              role="tab"
              aria-controls="list"
              aria-selected="false"
              onClick={onclick}
            >
              <i className="material-icons-outlined font-size-xxl">menu</i>
            </a>
          </TooltipComponent>
        </li>
      </ul>
    </div>
  );
};

const Deals = () => {
  const isMounted = useRef(false);
  const [active, setActive] = useState(true);
  const [openDeal, setOpenDeal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [allDeals, setAllDeals] = useState([]);
  const [filtersItems, setFiltersItems] = useState(initialFiltersItems);
  const [filterSelected, setFilterSelected] = useState({ status: 'opened' });
  const [searchTerm, setSearchTerm] = useState({});
  const [pagination, setPagination] = useState({
    page: paginationDefault.page,
  });
  const [paginationData, setPaginationData] = useState({
    page: paginationDefault.page,
  });
  const [addDealBtnLoading, setAddDealBtnLoading] = useState(false);
  const [infoDeals, setInfoDeals] = useState({});
  const [flagDeal, setFlagDeal] = useState([]);
  const [dataInDB, setDataInDB] = useState(false);
  const [order, setOrder] = useState([]);
  const [initialDeals, setInitialDeals] = useState({});
  const [listDeals, setListDeals] = useState(initialDeals);
  const [pipelineEdit, setPipelineEdit] = useState(false);
  const [pipelineSaveLoader, setPipeLineSaveLoader] = useState(false);
  const { stages, setStages } = usePipelineBoardContext();
  const [refreshBoardHeader, setRefreshBoardHeader] = useState(1);
  const [selectedStage, setSelectedStage] = useState({});
  const [openFilter, setOpenFilter] = useState(false);
  const [dealFilterTab, setDealFilterTab] = useState('filters');
  const [dealFilterOptionSelected, setDealFilterOptionSelected] =
    useState(defaultFilter);
  const [me, setMe] = useState(null);
  const [title, setTitle] = useState({
    id: 4,
    key: 'opened',
    name: 'Open Deals',
  });

  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState({});
  const [loadingPipelines, setLoadingPipelines] = useState(false);

  const getStageByName = (name) => {
    return stages.find((stage) => stage?.name === name);
  };

  useEffect(() => {
    (async () => {
      const pipelineId = selectedPipeline?.id;
      if (pipelineId) {
        setShowLoading(true);
        const stages = await stageService.getStages(pipelineId);
        const getStages = {};
        stages.forEach((stage) => {
          getStages[stage?.name] = {
            loading: true,
            id: stage?.id,
            stagePosition: stage?.position,
            name: stage?.name,
            title: stage?.name,
          };
        });
        setStages(stages);
        setInitialDeals(getStages);
        setShowLoading(false);
      }
      onGetUsers();
    })();
  }, [refreshBoardHeader, selectedPipeline]);

  useEffect(() => {
    (async () => {
      setLoadingPipelines(true);
      const { data } = await pipelineService.getPipelines();
      const updatedPipelines = data?.map((p) => ({ ...p, key: p.id }));
      const defaultPipeline =
        updatedPipelines?.find((d) => d.isDefault) ||
        (updatedPipelines?.length && updatedPipelines[0]);
      setPipelines(updatedPipelines);
      setSelectedPipeline(defaultPipeline || {});
      setLoadingPipelines(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const me = await userService
        .getUserInfo()
        .catch((err) => console.log(err));
      setMe(me);
    })();
  }, []);

  useEffect(() => {
    if (active) {
      Object.values(initialDeals).forEach((item) => {
        getDeals(
          {
            name: item?.name,
            id: item?.id,
            stagePosition: item?.position || item?.stagePosition,
          },
          paginationDefault.page,
          order
        );
      });
    } else onGetDeals(true);
  }, [active, paginationData, flagDeal, order, initialDeals]);

  useEffect(() => {
    const summary = [];
    const probs = stages?.map((stage) => {
      const state =
        Object.hasOwn(listDeals, stage?.name) && listDeals[stage?.name];
      const { header } = state;
      return (header?.total_amount * stage?.probability) / 100;
    });

    Object.keys(listDeals).forEach((key) => {
      if (listDeals[key]?.header?.total_amount) {
        summary.push(listDeals[key]?.header);
      }

      const total = summary?.reduce((acc, data) => {
        return {
          total: (acc.total || 0) + Number(data.total_amount),
          count_deals: (acc.count_deals || 0) + data.total_count,
          probability: probs.reduce((result, number) => result + number, 0),
        };
      }, 0);
      setInfoDeals(total);
    });
  }, [listDeals]);

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
      id: 1,
      label: OWNER,
      name: 'assigned_user_id',
      options: data?.users,
      type: 'search',
    });

    setFiltersItems(newFilterOptions);
  }

  const filterID = (id, FList) => {
    return FList
      ? FList.includes(id)
        ? FList.filter((n) => n !== id)
        : [id, ...FList]
      : [id];
  };

  const onHandleFilterContact = (item, avatars = true) => {
    const prevFils = filterSelected.filter
      ? filterSelected.filter.assigned_user_id
      : null;
    setOpenFilter(false);

    if (item) setListDeals(initialDeals);
    setFilterSelected({
      ...filterSelected,
      filter: {
        assigned_user_id: avatars ? filterID(item.id, prevFils) : [item.id],
      },
    });

    setPaginationData({ page: paginationDefault.page });
  };

  const onHandleFilterDeal = (item) => {
    onHandleFilterContact(item, false);
  };

  useEffect(() => {
    if (!title.key) {
      // only update filter in FE in case if key:0 otherwise its breaking three months old and other deals filters
      setDealFilterOptionSelected(title);
    }
  }, [title]);

  const GetUserByID = async (id) => {
    const response = await userService
      .getUserById(id)
      .catch((err) => console.log(err));
    return response;
  };

  useEffect(() => {
    (async () => {
      if (filterSelected.filter) {
        if (
          filterSelected.filter.assigned_user_id &&
          filterSelected.filter.assigned_user_id.length !== 0
        ) {
          const Len = filterSelected.filter.assigned_user_id.length;
          if (Len > 1) {
            setTitle({ key: 0, name: `${Len} Users` });
          } else {
            const Title = await GetUserByID(
              filterSelected.filter.assigned_user_id[0]
            );
            setTitle({
              key: 0,
              name: `${Title.first_name} ${Title.last_name}`,
            });
          }
        } else if (
          filterSelected.filter.status ||
          filterSelected.filter.recent_activity ||
          filterSelected.filter.start_date
        ) {
          // dont liking it :| not breaking faizan implementation
          const filterStatus = filterSelected.filter.recent_activity
            ? 'RecentlyViewed'
            : filterSelected.filter.status;
          const Title = DEALS_FILTER_OPTIONS_LIST.filter(
            (status) => status.key === filterStatus
          )[0];
          setTitle(Title);
        } else {
          setTitle({ id: 4, key: 'opened', name: 'Open Deals' });
        }
      }
    })();
  }, [filterSelected]);

  const onGetDeals = async (count) => {
    setShowLoading(true);
    const params = { page: paginationData.page, order, limit: 10 };
    const response = await dealService.getDeals(
      { ...filterSelected, order },
      params
    );

    const { data } = response || {};
    const probs = stages?.map((stage) => {
      const state =
        Object.hasOwn(listDeals, stage?.name) && listDeals[stage?.name];
      const { header } = state;
      return (header?.total_amount * stage?.probability) / 100;
    });

    if (data?.pagination) setPagination(data.pagination);
    setAllDeals(data?.deals);
    const total = data?.summary?.reduce((acc, data) => {
      return {
        total: (acc.total || 0) + Number(data.total_amount),
        count_deals: (acc.count_deals || 0) + data.total_count,
        probability: probs.reduce((result, number) => result + number, 0),
      };
    }, 0);
    setInfoDeals(total);

    if (count) setDataInDB(Boolean(data?.pagination?.totalPages));

    setShowLoading(false);
  };

  const setNotification = async (notificationCode, description) => {
    const notificationsStatus = {
      success: setSuccessMessage,
      error: setErrorMessage,
    };

    notificationsStatus[notificationCode](description);
  };

  const getDeals = async (status, page, order) => {
    const foundStage = getStageByName(status?.name);
    const params = { page, order, limit: 10 };
    const result = await dealService.getDeals(
      { tenant_deal_stage_id: status.id, ...filterSelected },
      params
    );

    setListDeals((prev) => {
      const items = prev[status.name]?.items || [];
      return {
        ...prev,
        [status.name]: {
          stageId: status.id,
          loading: false,
          stagePosition: foundStage?.position || status.stagePosition,
          items: [...items, ...result?.data?.deals],
          pagination: result?.data?.pagination,
          header: result?.data?.summary?.find(
            (element) => element.tenant_deal_stage_id === status.id
          ),
        },
      };
    });
  };

  const dataFilter = (search) => {
    setListDeals(initialDeals);
    setFilterSelected(search);
    setPaginationData({ page: paginationDefault.page });
  };

  useEffect(() => {
    if (isMounted.current) {
      const delayTime = setTimeout(() => {
        dataFilter(searchTerm);
      }, [1000]);
      return () => clearTimeout(delayTime);
    } else isMounted.current = true;
  }, [searchTerm]);

  const editPipeline = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setPipelineEdit(!pipelineEdit);
  };

  const changeView = () => {
    setPaginationData({ page: paginationDefault.page });
    setListDeals(initialDeals);
    setActive(!active);
  };

  const refreshDeals = (type, page, load = false) => {
    if (load) getDeals(type, page);
    else {
      type.forEach((status) => {
        setListDeals((prev) => ({
          ...prev,
          [status.name]: {
            stageId: status.id,
            stagePosition: status.stagePosition,
            loading: true,
            items: [],
            pagination: page,
            header: [],
          },
        }));
        getDeals(status, paginationDefault.page);
      });
    }
  };

  const onAddDeal = async (stage) => {
    setAddDealBtnLoading(true);
    setOpenDeal(true);
    setAddDealBtnLoading(false);
  };

  const sortTable = ({ name }) => sortingTable({ name, order, setOrder });

  const handleRefreshBoardHeader = () => {
    setShowLoading(true);
    setRefreshBoardHeader((prevState) => prevState + 1);
    setPipelineEdit(!pipelineEdit);
    setListDeals({});
  };

  const handleSavePipeline = async () => {
    const dealStages = stages.map((stage) => ({
      id: stage.id.includes(NEW_STAGE_ID) ? undefined : stage.id,
      name: stage.name || stage?.name,
      position: stage.position || stage.stagePosition,
      probability: stage.probability || 0,
    }));
    setPipeLineSaveLoader(true);
    await stageService.updateStages({ deal_stages: dealStages });
    setPipeLineSaveLoader(false);
    handleRefreshBoardHeader();
  };

  const refreshBoard = () => {
    setFlagDeal(!flagDeal);
    setListDeals(initialDeals);
  };

  const handleAddDeal = async (stage) => {
    setSelectedStage(stage);
    setAddDealBtnLoading(true);
    setOpenDeal((prev) => !prev);
    setAddDealBtnLoading(false);
  };

  const handleFilterSelect = (e, status) => {
    e.preventDefault();
    setOpenFilter(!openFilter);
    setListDeals(initialDeals);
    setDealFilterOptionSelected(status);
    const { key } = status;
    const dateFormat = DATE_FORMAT_Z2;
    if (key === 'MyDeals') {
      setFilterSelected({
        ...filterSelected,
        filter: { assigned_user_id: [me.id] },
      });
    } else if (key === 'OneMonth') {
      const now = moment().format(dateFormat);
      const startOfMonth = moment().startOf('month').format(dateFormat);
      setFilterSelected({
        ...filterSelected,
        filter: { start_date: startOfMonth, end_date: now, status: key },
      });
    } else if (key === 'ThreeMonths') {
      const startOfTime = moment(new Date(1970, 0, 1)).format(dateFormat);
      const threeMonthsOld = moment().subtract(3, 'months').format(dateFormat);
      setFilterSelected({
        ...filterSelected,
        filter: {
          start_date: startOfTime,
          end_date: threeMonthsOld,
          status: key,
        },
      });
    } else if (key === 'RecentlyViewed') {
      const oneHourBefore = moment()
        .utc()
        .subtract(1, 'hours')
        .format(dateFormat);
      const now = moment().utc().format(dateFormat);
      setFilterSelected({
        ...filterSelected,
        filter: {
          recent_activity: true,
          start_date: oneHourBefore,
          end_date: now,
        },
      });
    } else {
      setFilterSelected({
        ...filterSelected,
        filter: { status: status.key },
      });
    }
    setPaginationData({ page: paginationDefault.page });
  };

  const handleSelectedPipeline = (e, pipe) => {
    setSelectedPipeline(pipe);
    setListDeals({});
  };
  const SelectPipelines = ({ loading, list, selected, handleSelected }) => {
    return (
      <div className="d-flex hover-actions align-items-center">
        {loading ? (
          <Skeleton height="10" width={150} />
        ) : (
          <>
            <ButtonFilterDropdown
              buttonText="Pipelines"
              options={list}
              filterOptionSelected={selected}
              handleFilterSelect={handleSelected}
              menuClass="drop-menu-card"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={'pipeline-header'}>
        <div className="w-100 d-flex mb-2">
          {pipelineEdit ? (
            <SaveCancelPipelineRow
              togglePipelineEdit={editPipeline}
              onSavePipeline={handleSavePipeline}
              loading={pipelineSaveLoader}
              refreshBoard={handleRefreshBoardHeader}
            />
          ) : (
            <>
              <SelectPipelines
                loading={loadingPipelines}
                selected={selectedPipeline}
                list={pipelines}
                handleSelected={handleSelectedPipeline}
              />
              <div className="ml-auto mr-3">
                <DataFilters
                  filterSelected={filterSelected}
                  setFilterSelected={setSearchTerm}
                  searchPlaceholder={SEARCH}
                  infoDeals={infoDeals}
                  paginationPage={paginationData}
                  setPaginationPage={setPaginationData}
                  showSearch={false}
                  variant
                >
                  <FilterTabsButtonDropdown
                    options={DEALS_FILTER_OPTIONS_LIST}
                    openFilter={openFilter}
                    setOpenFilter={setOpenFilter}
                    filterOptionSelected={dealFilterOptionSelected}
                    filterSelected={filterSelected}
                    filterTabs={dealFilterTab}
                    handleFilterSelect={handleFilterSelect}
                    onHandleFilterOrg={onHandleFilterDeal}
                    setFilterOptionSelected={setDealFilterOptionSelected}
                    setFilterSelected={setFilterSelected}
                    setFilterTabs={setDealFilterTab}
                    defaultSelection={defaultFilter}
                  />
                  <Nav
                    active={active}
                    onclick={() => changeView()}
                    togglePipelineEdit={editPipeline}
                  />
                </DataFilters>
              </div>
              <AddDeal
                className="btn-transparent border-0"
                setOpenDeal={setOpenDeal}
                openDeal={openDeal}
                initialDeals={initialDeals}
                pipeline={selectedPipeline}
                onGetDeals={refreshBoard}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                selectedStage={selectedStage}
              >
                {(dataInDB || active) &&
                  isPermissionAllowed('deals', 'create') && (
                    <ButtonIcon
                      icon="add"
                      classnames="btn-sm ml-1 border-0"
                      loading={addDealBtnLoading}
                      label={DEALS_LABEL_BUTTON}
                      onClick={handleAddDeal}
                    />
                  )}
              </AddDeal>
            </>
          )}
        </div>

        <div className="tab-content">
          <div
            className={`tab-pane fade col-12 p-0 ${active && 'active show'}`}
          >
            {showLoading ? (
              <BoardLoader count={5} />
            ) : (
              <Board
                onGetDeals={(type, id, stagePosition, page) => {
                  setListDeals((prev) => ({
                    ...prev,
                    [type]: {
                      stageId: id,
                      stagePosition,
                      loading: true,
                      items: [],
                      pagination: page,
                      header: [],
                    },
                  }));
                  getDeals({ name: type, id, stagePosition }, page);
                }}
                setNotification={setNotification}
                listDeals={listDeals}
                onClick={refreshDeals}
                editPipeline={pipelineEdit}
                refreshBoard={refreshBoard}
                refreshBoardHeader={handleRefreshBoardHeader}
                onAddDeal={handleAddDeal}
              />
            )}
          </div>
          <div
            className={`tab-pane fade col-12 p-0 ${!active && 'active show'}`}
          >
            <DealList
              allDeals={allDeals}
              pagination={pagination}
              service={dealService}
              showLoading={showLoading}
              onPaginationChange={(page) =>
                setPaginationData({ ...paginationData, page })
              }
              onAddDeal={onAddDeal}
              dataInDB={dataInDB}
              sortingTable={sortTable}
            />
          </div>
        </div>
      </div>

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
    </>
  );
};

export default Deals;
