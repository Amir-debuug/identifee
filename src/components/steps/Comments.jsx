import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../Avatar';
import { DATE_FORMAT_TIME_WO_SEC, setDateFormat } from '../../utils/Utils';
import { CardButton } from '../layouts/CardLayout';
import feedService from '../../services/feed.service';
import stringConstants from '../../utils/stringConstants.json';
import MoreActions from '../MoreActions';
import ModalConfirm from '../modal/ModalConfirmDefault';
import MentionsInput from '../mentions/MentionsInput';
import routes from '../../utils/routes.json';

export const items = () => {
  return [
    {
      id: 'edit',
      icon: 'edit',
      name: 'Edit',
    },
    {
      id: 'remove',
      icon: 'delete',
      name: 'Delete',
    },
  ];
};
const constants = stringConstants.feed.comments;
const defaultPagination = { page: 1, limit: 3 };
const Comments = ({ data, me }) => {
  const [feedComments, setFeedComments] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [commentEdit, setCommentEdit] = useState({ id: null });
  const [commentDelete, setCommentDelete] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const getComments = (forceFetch = false) => {
    if (!data.total_comments && forceFetch === false) {
      return;
    }
    setFeedComments([]);

    feedService
      .getComments(data.id, pagination)
      .then((res) => {
        setFeedComments(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const permission = {
    collection: 'contacts',
    action: 'edit',
  };
  const addComment = async (raw) => {
    try {
      setIsLoading(true);
      await feedService.addComment(data.id, raw);

      getComments(true);
      closeAddComment();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAddComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInput(false);
  };

  const openAddComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInput(true);
  };

  const onHandleModeEdit = (item) => {
    setCommentEdit(item);
  };

  const onHandleCancelModeEdit = () => {
    setCommentEdit({ id: null });
  };

  const onHandleEditComment = async (raw) => {
    try {
      setIsLoadingEdit(true);
      await feedService.editComment(commentEdit.id, raw);
      getComments(true);
      setCommentEdit({ id: null });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const onHandleRemoveComment = () => {
    feedService
      .deleteComment(commentDelete.id)
      .then(() => {
        setCommentEdit({ id: null });
        getComments(true);
        setCommentDelete(null);
        setOpenModal(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderEditComments = () => {
    return (
      <div className="w-100">
        <MentionsInput
          type={`comment`}
          defaultState={commentEdit.message || commentEdit.comment}
          handleSubmit={onHandleEditComment}
          onHandleCancel={onHandleCancelModeEdit}
          isLoading={isLoadingEdit}
          submitLabel={`Update`}
        />
      </div>
    );
  };

  useEffect(() => {
    getComments();
  }, [pagination.limit]);

  return (
    <div>
      <ModalConfirm
        open={openModal}
        icon="warning"
        onHandleConfirm={onHandleRemoveComment}
        onHandleClose={() => {
          setOpenModal(false);
          setCommentDelete(null);
        }}
        textBody={constants.messageWarningModalDelete}
        labelButtonConfirm={'Yes, Delete'}
        iconButtonConfirm=""
        colorButtonConfirm={'outline-danger'}
      />
      <div className="pt-1 d-flex justify-content-between">
        <a
          className="cursor-pointer text-muted font-size-sm2 d-gray mb-1"
          onClick={(e) => openAddComment(e)}
        >
          <span className="material-icons-outlined">chat</span>{' '}
          {constants.addCommentButton}
        </a>
        {pagination?.count > 0 && (
          <p className="text-normal-bold font-size-xs text-muted">
            {pagination?.count} {constants.commentsLabel}
          </p>
        )}
      </div>
      <div className="comments-container">
        {showInput && (
          <>
            <MentionsInput
              handleSubmit={addComment}
              type={`comment`}
              isLoading={isLoading}
              submitLabel={`Comment`}
              onHandleCancel={(e) => closeAddComment(e)}
            />
          </>
        )}

        {feedComments?.length > 0 && (
          <div className="card p-3">
            {feedComments?.map((item) => {
              // if current user has admin_access or the item is created by the user then allow editing only
              const isCommentOwner =
                me?.role?.admin_access || item?.user_id === me?.id;
              return (
                <div key={item.id}>
                  <div className="d-flex justify-content-start">
                    <div style={{ width: 30 }}>
                      <Avatar user={item?.user} defaultSize="xs" />
                    </div>
                    <div className="ml-2 w-100">
                      <div>
                        <Link
                          to={`${routes.contacts}/${item?.user?.id}/profile`}
                        >
                          <span className="text-normal-bold font-size-sm2 text-block">
                            {item?.user?.first_name} {item?.user?.last_name}
                          </span>
                        </Link>
                        <span className="ml-2 text-muted font-size-xs">
                          {setDateFormat(
                            item.updatedAt,
                            DATE_FORMAT_TIME_WO_SEC
                          )}
                        </span>
                        {item.updatedAt !== item.createdAt && !item.deleted && (
                          <span className="fs-italic"> • Edited</span>
                        )}
                      </div>
                      {item.id !== commentEdit.id ? (
                        <>
                          {!item.deleted ? (
                            <MentionsInput
                              readOnly
                              defaultState={item.message || item.comment}
                            />
                          ) : (
                            <span className="fs-italic text-danger">
                              {constants.messageDelete}
                            </span>
                          )}
                        </>
                      ) : (
                        renderEditComments()
                      )}
                    </div>

                    {!item.deleted && isCommentOwner && (
                      <div className="ml-auto">
                        <MoreActions
                          permission={permission}
                          items={items()}
                          onHandleEdit={onHandleModeEdit.bind(null, item)}
                          onHandleRemove={() => {
                            setOpenModal(true);
                            setCommentDelete(item);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination?.count > feedComments.length &&
          pagination.page < pagination.totalPages && (
            <CardButton
              variant="white"
              title={constants.seeMoreComments}
              isLoading={isLoading}
              onClick={() => {
                setPagination((prev) => ({ ...prev, limit: prev.limit + 3 }));
              }}
              block
            />
          )}
      </div>
    </div>
  );
};

export default Comments;
