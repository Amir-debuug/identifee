import React from 'react';
import TableSelectedCount from '../prospecting/v2/common/TableSelectedCount';
import { isPermissionAllowed } from '../../utils/Utils';
const LayoutHead = ({
  onHandleCreate,
  buttonLabel,
  selectedData = [],
  onDelete,
  allRegister,
  children,
  headingTitle,
  headingText,
  orientationDelete,
  labelButtonDelete = 'Delete',
  dataInDB,
  onClear,
  permission,
  alignTop,
}) => {
  return (
    <div className={`d-flex mb-2 ${alignTop}`}>
      <div className="d-flex-column align-items-left">
        <h3 className="font-weight-medium">{headingTitle}</h3>
        <p className="font-weight-normal">{headingText} </p>
      </div>
      <div className="ml-auto d-flex align-items-center">
        {selectedData.length > 0 && (
          <>
            {isPermissionAllowed(
              permission?.collection,
              permission?.action
            ) && (
              <TableSelectedCount
                list={selectedData}
                btnClick={onDelete.bind(null, selectedData)}
                containerPadding="mr-2"
                btnClass="btn-sm"
                btnIcon="delete"
                onClear={onClear}
                btnLabel={labelButtonDelete}
                btnColor="outline-danger"
              />
            )}
          </>
        )}

        {!orientationDelete && <span className="mr-2">{allRegister}</span>}
        {children}
        {orientationDelete && <span className="mr-2">{allRegister}</span>}
        {dataInDB && (
          <div className="ml-2">
            <>
              {permission?.collection ? (
                isPermissionAllowed(permission?.collection, 'create') && (
                  <button
                    className="btn btn-primary btn-sm"
                    data-toggle="modal"
                    onClick={onHandleCreate}
                  >
                    <span className="material-icons-outlined">add</span>
                    {buttonLabel}
                  </button>
                )
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  data-toggle="modal"
                  onClick={onHandleCreate}
                >
                  <span className="material-icons-outlined">add</span>
                  {buttonLabel}
                </button>
              )}
            </>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutHead;
