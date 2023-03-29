import { CardFooter, Row, Col } from 'reactstrap';

import Pagination from './Pagination';
import { useProfileContext } from '../contexts/profileContext';
import { NO_SEARCH_RESULTS } from '../utils/constants';
import React from 'react';
import NoDataFound from './commons/NoDataFound';
import ButtonIcon from './commons/ButtonIcon';
import { isPermissionAllowed } from '../utils/Utils';

export default function Table({
  className,
  checkbox,
  columns,
  data,
  selectAll,
  setSelectAll,
  selectedData,
  setSelectedData,
  usePagination = true,
  paginationInfo,
  onPageChange,
  onHandleEdit,
  onClick,
  onClickCol,
  showLoading,
  componentAction,
  clickableCell,
  toggle,
  emptyDataText,
  title,
  dataInDB,
  noDataInDbValidation,
  sortingTable,
  showTooltip,
  setDeleteResults = () => {},
  permission = {},
}) {
  const { profileInfo } = useProfileContext();
  const isAdmin = profileInfo?.role?.admin_access;

  const onCheck = () => {
    setSelectAll(!selectAll);
    setSelectedData(
      data?.length === selectedData?.length
        ? []
        : data?.map((user) => String(user.id))
    );
  };

  const onHandleSelect = (e, rowId, row) => {
    e.stopPropagation();

    const idsSelected = selectedData.slice();

    const exist = idsSelected.find((id) => id === rowId);

    if (exist) {
      const newIds = idsSelected.filter((id) => id !== rowId);
      setSelectAll(false);
      return setSelectedData(newIds);
    }
    setDeleteResults(row);
    idsSelected.push(rowId);

    setSelectedData(idsSelected);
  };

  const AddYourFirst = ({ title, onClick }) => {
    return (
      <div className="text-center">
        <ButtonIcon
          icon="add"
          label={title}
          classnames="btn-sm my-2"
          onclick={onClick}
        />
      </div>
    );
  };

  const Title = () => {
    return <div>{emptyDataText || NO_SEARCH_RESULTS}</div>;
  };

  const noData = () => {
    if (!dataInDB && !noDataInDbValidation) {
      return (
        <>
          <NoDataFound
            title={<Title />}
            description={
              toggle && (
                <>
                  {permission?.collection ? (
                    isPermissionAllowed(permission?.collection, 'create') && (
                      <AddYourFirst
                        onClick={toggle}
                        title={`Add your first ${title}`}
                      />
                    )
                  ) : (
                    <AddYourFirst
                      onClick={toggle}
                      title={`Add your first ${title}`}
                    />
                  )}
                </>
              )
            }
            containerStyle="text-gray-900 my-6 py-6"
          />
        </>
      );
    } else if (!data?.length && !showLoading) {
      return (
        <NoDataFound
          icon="manage_search"
          containerStyle="text-gray-search my-6 py-6"
          title={<Title />}
        />
      );
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <table
        id={`datatable-${title}`}
        className={`table table-lg table-hover table-borderless table-thead-bordered table-nowrap table-align-middle card-table dataTable no-footer ${
          className || ''
        }`}
        role="grid"
      >
        <thead className="thead-light">
          <tr role="row">
            {checkbox && (
              <th className="w-th-45 pr-0">
                <div className="custom-control custom-checkbox">
                  <input
                    id={`datatableCheckAll-${title}`}
                    type="checkbox"
                    className="custom-control-input"
                    onChange={onCheck}
                    checked={selectAll}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor={`datatableCheckAll-${title}`}
                  ></label>
                </div>
              </th>
            )}
            {columns.map((column, i) => (
              <th
                key={`${column.key}-${i}`}
                className={` ${i > 0 ? 'px-2' : 'px-3'} ${
                  column.key !== 'owner' && 'sorting'
                }`}
                rowSpan="1"
                colSpan="1"
                style={{
                  width: column.width,
                  display: !column.onlyAdmin ? '' : isAdmin ? '' : 'none',
                }}
                onClick={() => sortingTable({ name: column.orderBy })}
              >
                {column.component}
              </th>
            ))}
            {onHandleEdit && (
              <th
                className="sorting_disabled w-0"
                rowSpan="1"
                colSpan="1"
                aria-label=""
              ></th>
            )}
          </tr>
        </thead>

        <tbody>
          {(dataInDB || noDataInDbValidation) &&
            data?.map((row) => {
              const checked = !selectedData
                ? false
                : selectedData.find(
                    (selected) => String(selected) === String(row.id)
                  ) || false;
              return (
                <tr
                  key={row.id}
                  role="row"
                  className={`odd ${
                    onClick || clickableCell ? 'tr-hover cursor-pointer' : ''
                  } ${checked ? 'bg-soft-primary' : ''}`}
                >
                  {checkbox && (
                    <td className="pr-0">
                      <div
                        className="custom-control custom-checkbox"
                        onClick={(e) => onHandleSelect(e, String(row.id), row)}
                      >
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          checked={checked}
                          readOnly
                        />
                        <label
                          className="custom-control-label"
                          htmlFor={row.id}
                        ></label>
                      </div>
                    </td>
                  )}
                  {row.dataRow.map((tdRow) => (
                    <>
                      <td
                        key={tdRow.key}
                        onClick={() => {
                          if (tdRow.key !== 'action') {
                            if (onClickCol) {
                              return onClickCol(row, tdRow);
                            } else {
                              return onClick && onClick(row);
                            }
                          }
                        }}
                        className={` px-2 ${
                          tdRow.key === 'action'
                            ? 'cursor-default'
                            : 'cursor-pointer'
                        }`}
                        style={{
                          display: !tdRow.onlyAdmin
                            ? ''
                            : isAdmin
                            ? ''
                            : 'none',
                        }}
                      >
                        {tdRow.component}
                      </td>
                    </>
                  ))}
                  {onHandleEdit && (
                    <td>
                      {permission?.collection ? (
                        isPermissionAllowed(permission?.collection, 'edit') && (
                          <span
                            className="cursor-pointer"
                            onClick={() => onHandleEdit(row)}
                          >
                            {!componentAction && (
                              <i className="material-icons-outlined">edit</i>
                            )}

                            {componentAction}
                          </span>
                        )
                      ) : (
                        <span
                          className="cursor-pointer"
                          onClick={() => onHandleEdit(row)}
                        >
                          {!componentAction && (
                            <i className="material-icons-outlined">edit</i>
                          )}

                          {componentAction}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>

      {noData()}

      {usePagination && dataInDB && (
        <CardFooter>
          <Row>
            <Col sm className="mb-2 mb-sm-0" />
            <Col className="col-sm-auto">
              <Pagination
                paginationInfo={paginationInfo}
                onPageChange={onPageChange}
              />
            </Col>
          </Row>
        </CardFooter>
      )}
    </div>
  );
}
