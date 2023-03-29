import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import './styles.css';
import { colorsDeals } from './constasts/deals';
import Columns from './Column';
import dealService from '../../services/deal.service';
import { DEALS_LABEL, PROBABILITY } from '../../utils/constants';
import { Col } from 'react-bootstrap';
import { isPermissionAllowed, isToFixedNoRound } from '../../utils/Utils';
import { usePipelineBoardContext } from '../../contexts/PipelineBoardContext';
import MaterialIcon from '../commons/MaterialIcon';
import TooltipComponent from '../lesson/Tooltip';
import IdfTooltip from '../idfComponents/idfTooltip';
import NoDataFound from '../commons/NoDataFound';
import ButtonIcon from '../commons/ButtonIcon';
import routes from '../../utils/routes.json';
import { Link } from 'react-router-dom';

const BoardFooter = ({ show, refresh }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await dealService.getStatusSummary();
      const { summary } = data;
      // sorting by won status, so that it shows at first in view
      summary.sort((a, b) => (a.status === 'won' ? -1 : 1));
      setItems(summary);
    })();
  }, [refresh]);

  const FooterCard = ({ item }) => {
    return (
      <>
        <p className="mb-0 text-capitalize font-weight-bold">{item.status}</p>
        <p className="mb-0 fs-7">
          {isToFixedNoRound(item.total_amount, 2)} • {item.count}{' '}
          {DEALS_LABEL.toLowerCase()}
        </p>
      </>
    );
  };

  return (
    <div
      className={`position-fixed shadow-lg board-footer ease animate slideInUp bg-white w-100 left-0 ${
        show ? 'd-block bottom-0 z-index-100' : 'hide bottom-40 z-index-2'
      }`}
    >
      <div className="p-3">
        <div className="d-flex w-100 justify-content-between">
          {items?.map((item, index) => (
            <Droppable droppableId={item.status} key={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`border board-footer-item ${
                    item.status
                  } py-2 px-4 mb-0 rounded ${
                    snapshot.isDraggingOver ? ` deal-types ${item.status}` : ''
                  }`}
                  role="alert"
                >
                  <FooterCard item={item} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </div>
  );
};

const BoardHeader = ({ deals, handleAddDeal, edit }) => {
  const { stages } = usePipelineBoardContext();

  const AddYourFirstDealStage = () => {
    return (
      <div className="text-center">
        <div>To get started, add your first stage.</div>
        <Link to={routes.pipelinesAndStages}>
          <a>
            <ButtonIcon icon="add" label="Add Stage" classnames="btn-sm my-2" />
          </a>
        </Link>
      </div>
    );
  };
  return (
    <>
      {stages?.length > 0 ? (
        <div className="d-flex">
          <div
            id="divPipelineBoard"
            className={`parent-board-header mb-2 d-flex flex-grow-1 bg-white border-bottom w-100 top-0 ${
              edit
                ? 'pipeline-board-edit overflow-y-hidden overflow-x-auto'
                : ''
            }`}
          >
            {stages?.map((stage, index) => {
              const state =
                Object.hasOwn(deals, stage?.name) && deals[stage?.name];
              const title = stage?.name || '';
              const { header, pagination } = state;

              return (
                <Col
                  key={index}
                  className={`py-3 pr-0 deal-col position-relative bg-white board-header ${
                    edit ? 'deal-edit-header' : 'w-100'
                  }`}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="m-0 px-1">
                      <h5 className="mb-1 font-weight-bold text-capitalize">
                        {title}
                      </h5>
                      <div className="m-0 pr-1">
                        <div className={'d-flex align-item-center fs-8'}>
                          <span
                            className="text-truncate font-weight-semi-bold"
                            style={{ maxWidth: 110 }}
                          >
                            {stage?.probability === 100 ? (
                              isToFixedNoRound(header?.total_amount, 2)
                            ) : (
                              <>
                                <TooltipComponent
                                  title={`Total Amount: ${isToFixedNoRound(
                                    header?.total_amount,
                                    2
                                  )}
                            ${PROBABILITY}: ${stage?.probability} %
                            `}
                                >
                                  <MaterialIcon
                                    icon="scale"
                                    clazz="cursor-pointer font-size-sm"
                                  />
                                </TooltipComponent>{' '}
                                {isToFixedNoRound(
                                  (header?.total_amount * stage?.probability) /
                                    100
                                )}
                              </>
                            )}
                          </span>
                          <span className="text-muted mx-2">•</span>
                          <span>
                            {pagination?.count} {DEALS_LABEL.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isPermissionAllowed('deals', 'create') && (
                      <IdfTooltip text="Add deal in this stage">
                        <a
                          href=""
                          className="icon-hover-bg"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddDeal(stage);
                          }}
                        >
                          <MaterialIcon icon="add_circle" />
                        </a>
                      </IdfTooltip>
                    )}
                  </div>
                </Col>
              );
            })}
          </div>
        </div>
      ) : (
        <NoDataFound
          title="No deal stages available"
          description={<AddYourFirstDealStage />}
          icon="space_dashboard"
          containerStyle="text-gray-900 my-6 py-6"
        />
      )}
    </>
  );
};

const Board = ({
  onGetDeals,
  setNotification,
  listDeals = {},
  onClick,
  editPipeline,
  refreshBoard,
  onAddDeal,
}) => {
  const [itemPicked, setItemPicked] = useState(false);
  const [boardColumns, setBoardColumns] = useState({ ...listDeals });
  const [refreshBoardFooter, setRefreshBoardFooter] = useState(1);

  const getStageByName = (name) => {
    const [dealFound] = Object.entries(listDeals || {})
      .filter(([type, value]) => {
        return type === name;
      })
      .map(([type, value = {}]) => {
        return {
          id: value.stageId,
          name: type,
          stagePosition: value.stagePosition,
        };
      });

    return dealFound || '';
  };

  useEffect(() => {
    setBoardColumns({ ...listDeals });
  }, [listDeals]);

  useEffect(() => {
    const columns = document.getElementsByClassName('sticky-bottom');
    const parent = document.getElementsByClassName('parent-column')[0];
    if (columns?.length) {
      for (const column of columns) column.style.height = 'auto';
      for (const column of columns) {
        if (column.clientHeight <= parent.clientHeight) {
          column.style.height = `${parent.clientHeight}px`;
        }
      }
    }
  }, [listDeals]);

  const reorderBetweenRow = (currentStatus, startIndex, endIndex) => {
    const state = listDeals[currentStatus]?.items;

    if (state) {
      const [removed] = state?.splice(startIndex, 1);
      state?.splice(endIndex, 0, removed);
    }
  };

  const reorderBetweenColumn = (
    currentStatus,
    secondStatus,
    startIndex,
    endIndex
  ) => {
    const origin = listDeals[currentStatus]?.items;
    const destiny = listDeals[secondStatus]?.items;

    if (origin && destiny) {
      const [removed] = origin?.splice(startIndex, 1);
      destiny?.splice(endIndex, 0, removed);
    }
  };

  const onUpdateStage = async (draggableId, destination, source) => {
    const id = draggableId.replace('id-', '');
    const status = destination.droppableId;
    const stageId = destination.stageId;
    const data = {
      stage_name: status,
      tenant_deal_stage_id: stageId,
      update_deal:
        destination.droppableId === source.droppableId
          ? [
              {
                type: destination.droppableId,
                tenant_deal_stage_id: destination.stageId,
                position: destination.index,
                origin: source.index,
                limit: listDeals[destination.droppableId].pagination.count,
              },
            ]
          : [
              {
                type: source.droppableId,
                tenant_deal_stage_id: source.stageId,
                position: source.index,
                limit: listDeals[source.droppableId].pagination.count,
              },
              {
                type: destination.droppableId,
                tenant_deal_stage_id: destination.stageId,
                position: listDeals[destination.droppableId].pagination.count,
                destination: true,
                limit: listDeals[destination.droppableId].pagination.count,
              },
            ],
    };

    await dealService.updateDealPosition(id, data);
  };

  const onDragEnd = async (result) => {
    let { destination, source, draggableId } = result;
    if (!destination) destination = source;

    setItemPicked(false);

    if (!destination) return;

    const sourceName = getStageByName(source.droppableId); // here droppableId is name of stage
    const destinationName = getStageByName(destination.droppableId);
    source = { ...source, stageId: sourceName.id };
    destination = { ...destination, stageId: destinationName.id };

    if (!destination.stageId) {
      // this part is when cards are moved between won/lost/delete stages in footer
      await dealService.updateDealStatus(draggableId.replace('id-', ''), {
        status: destination.droppableId,
      });

      // when drag released in board footer update board
      refreshBoard();

      // also update footer won/lost/delete component to show updated count
      setRefreshBoardFooter((prevState) => prevState + 1);
    } else {
      // this part when cards are moved between stages
      if (destination.droppableId !== source.droppableId) {
        reorderBetweenColumn(
          source.droppableId,
          destination.droppableId,
          source.index,
          destination.index
        );

        await onUpdateStage(draggableId, destination, source);

        // when drag released in board footer update board
        refreshBoard();

        // also update footer won/lost/delete component to show updated count
        setRefreshBoardFooter((prevState) => prevState + 1);
      } else {
        reorderBetweenRow(source.droppableId, source.index, destination.index);
        await onUpdateStage(draggableId, destination, source);

        // when drag released in board footer update board
        refreshBoard();

        // also update footer won/lost/delete component to show updated count
        setRefreshBoardFooter((prevState) => prevState + 1);
      }
    }
  };

  // using useCallback is optional
  const onBeforeCapture = useCallback(() => {
    setItemPicked(!itemPicked);
  }, []);
  const onBeforeDragStart = useCallback(() => {}, []);
  const onDragStart = useCallback(() => {}, []);
  const onDragUpdate = useCallback(() => {}, []);

  const { stages } = usePipelineBoardContext();

  return (
    <div className="position-relative w-100">
      <div className="m-0 pipelines-board flex-nowrap overflow-y-hidden overflow-x-auto">
        <BoardHeader
          deals={{ ...boardColumns }}
          handleAddDeal={(stage) => onAddDeal({ ...stage, title: stage.name })}
          edit={editPipeline}
        />
        {!editPipeline && (
          <div className="d-flex flex-row parent-column">
            <DragDropContext
              onDragEnd={onDragEnd}
              onBeforeCapture={onBeforeCapture}
              onBeforeDragStart={onBeforeDragStart}
              onDragStart={onDragStart}
              onDragUpdate={onDragUpdate}
            >
              {stages?.map((stage, index) => {
                const type = stage.name;
                const value = listDeals[type] || {};
                return (
                  <Columns
                    id={stage.id}
                    key={index}
                    title={type}
                    color={colorsDeals[index]}
                    value={{ ...value, deal_type: type }}
                    onGetDeals={onGetDeals}
                    setNotification={setNotification}
                    listDeals={listDeals}
                    onClick={onClick}
                    onAddDeal={() => onAddDeal({ ...value, title: type })}
                  />
                );
              })}
              <BoardFooter show={itemPicked} refresh={refreshBoardFooter} />
            </DragDropContext>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
