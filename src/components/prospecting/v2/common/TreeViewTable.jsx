import React, { useState } from 'react';
import { Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Input, Label } from 'reactstrap';
import { useTenantContext } from '../../../../contexts/TenantContext';
import { RESOURCE_NOT_FOUND } from '../../../../utils/constants';
import MaterialIcon from '../../../commons/MaterialIcon';
import NoDataFound from '../../../commons/NoDataFound';
import Loading from '../../../Loading';
import { DropdownTreeView } from './DropdownTreeView';

export const TreeViewTable = (props) => {
  const {
    data,
    closeEditModal,
    setShowReport,
    handleEditModelShow,
    editRoleData,
    handleGetRoleById,
    setEditRoleData,
    dataGet,
    setIsDropdownId,
    isDropdownId,
    setShowCreateGroupModal,
    openEditModal,
    setIsAddSingleRole,
    showLoading,
  } = props;
  const [isShow, setIsShow] = useState(new Set());
  const handleCollapse = (e, id) => {
    e.preventDefault();
    if (isShow.has(id)) {
      setIsShow((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setIsShow((prev) => new Set(prev).add(id));
    }
  };
  const handleAddSingleRole = (item) => {
    setShowCreateGroupModal(true);
    setIsAddSingleRole(item);
  };
  const loader = () => {
    if (showLoading) return <Loading />;
  };
  const { tenant } = useTenantContext();
  const Title = () => {
    return <div className="text-gray-search">{RESOURCE_NOT_FOUND}</div>;
  };
  const display = (parent) => {
    return (
      <>
        {showLoading ? (
          loader()
        ) : (
          <>
            {parent?.length > 0 &&
              parent.map((item, i) => {
                return (
                  <>
                    <div
                      key={`treeView_${i}`}
                      className={`${
                        isShow.has(item.id) ? 'show_border' : 'dnt_show_border'
                      } 
                  ${
                    item.children?.length > 0 ? '' : 'no-children-h-main'
                  } main-body-hh`}
                    >
                      <div
                        className={`${
                          isShow.has(item.id)
                            ? 'show_minus_icon btn_hover_show'
                            : 'show_plus_icon btn_hover_show'
                        }
                  ${
                    item.children?.length > 0
                      ? ''
                      : 'no-children-h btn_hover_show'
                  }
                  ${
                    isShow.has(item.children) ? '' : 'children-hh'
                  } btn_hover_show hover-actions main-row-hh table-tree-tbody-row`}
                      >
                        <div
                          className=" table-tree-body-cell"
                          onClick={(e) => handleCollapse(e, item.id)}
                        >
                          <span className="d-inline-block">{item.name}</span>
                        </div>
                        <div className="usersCount table-tree-body-cell">
                          {item.children?.length}
                        </div>
                        <div className="peerDataVisibility table-tree-body-cell">
                          {item.has_sibling_access === true ? 'Yes' : 'No'}
                        </div>
                        <div className="table-tree-body-cell">
                          <div className="d-flex action-items align-items-center gap-2">
                            <a
                              href=""
                              className="icon-hover-bg"
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddSingleRole(item);
                              }}
                            >
                              <MaterialIcon icon="add" />
                            </a>
                            <a
                              href=""
                              className="icon-hover-bg"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditModelShow(item);
                              }}
                            >
                              <MaterialIcon icon="edit" />
                            </a>
                            {item.parent_id === null ? (
                              <></>
                            ) : (
                              <a
                                href=""
                                className="icon-hover-bg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShowReport(item);
                                }}
                              >
                                <MaterialIcon icon="delete" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {isShow.has(item.id) && (
                        <>
                          {item.children?.length > 0 && item.id ? (
                            <div className="child py-0 pl-3">
                              <div className="main-body-hh">
                                {isShow.has(item.id) && display(item.children)}
                              </div>
                            </div>
                          ) : (
                            ''
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })}
          </>
        )}
      </>
    );
  };
  return (
    <div className="" id="no-more-tables">
      <div className="table-tree">
        <div className="active table-tree-thead-row">
          <div className="table-head-cell">
            {tenant.name}{' '}
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-badge`}>
                  Roles help you define a hierarchy of access levels to records
                  in your organization. Users can&nbsp;only see the records of
                  other users below them in the role hierarchy.
                </Tooltip>
              }
            >
              <MaterialIcon icon={'info'} clazz="mx-1" />
            </OverlayTrigger>
          </div>
          <div className="table-head-cell">No. of Users</div>
          <div className="table-head-cell">Peer Data Visibility</div>
          <div className="table-head-cell"></div>
        </div>
        <div className="main-body-hh-table-body">
          {[data].length > 0 ? (
            display([data])
          ) : (
            <NoDataFound
              icon="account_tree"
              containerStyle="text-gray-search my-6 py-6"
              title={<Title />}
            />
          )}
        </div>
      </div>
      <Modal
        fade={false}
        animation={false}
        show={openEditModal}
        onHide={closeEditModal}
      >
        <Modal.Header className="p-3" closeButton>
          <Modal.Title as="h3">Manage Role</Modal.Title>
        </Modal.Header>
        <Modal.Body className="border-top mb-0 p-3">
          <Form>
            <div>
              <Label htmlFor="" className="form-label col-form-label">
                <h5 className="mb-0">Role Name</h5>
              </Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={editRoleData.name}
                placeholder="Role Name"
                onChange={(e) =>
                  setEditRoleData({
                    ...editRoleData,
                    name: e.target.value,
                  })
                }
              ></Input>
              {dataGet.parent_id !== null && (
                <>
                  <Label htmlFor="" className="form-label col-form-label">
                    <h5 className="mb-0">Reports to</h5>
                  </Label>
                  <DropdownTreeView
                    editRoleData={dataGet}
                    reportTo={editRoleData}
                    isDropdownId={isDropdownId}
                    setIsDropdownId={setIsDropdownId}
                    data={data}
                  />
                </>
              )}
              <Label
                htmlFor="has_sibling_access"
                className="form-label col-form-label mb-0 ml-4 w-100"
              >
                <Input
                  type="checkbox"
                  name="has_sibling_access"
                  id="has_sibling_access"
                  value={editRoleData?.has_sibling_access}
                  checked={editRoleData?.has_sibling_access}
                  onChange={() =>
                    setEditRoleData({
                      ...editRoleData,
                      has_sibling_access: !editRoleData?.has_sibling_access,
                    })
                  }
                />{' '}
                <span className="font-weight-bold">
                  {' '}
                  Let users in this role see each other&apos;s data
                </span>
              </Label>
              <Label htmlFor="" className="form-label col-form-label">
                <h5 className="mb-0">Description</h5>
              </Label>
              <textarea
                className="form-control"
                rows={3}
                name="description"
                value={editRoleData.description}
                onChange={(e) =>
                  setEditRoleData({
                    ...editRoleData,
                    description: e.target.value,
                  })
                }
                placeholder="A few words about this role"
              ></textarea>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="px-3">
          <Button variant="white" size="sm" onClick={closeEditModal}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleGetRoleById}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
