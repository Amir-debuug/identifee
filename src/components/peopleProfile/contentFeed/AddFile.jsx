import React, { useEffect, useState } from 'react';

import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import filesService from '../../../services/files.service';
import feedService from '../../../services/feed.service';
import FeedFile from '../../steps/feedTypes/FeedFile';
import ActivityFilesModal from '../../modal/ActivityFilesModal';
import { createBlobObject } from '../../../utils/Utils';
import stringConstants from '../../../utils/stringConstants.json';
import { MAX_WEIGHT, MAX_WEIGHT_ERROR_MESSAGE } from '../../../utils/constants';
import IdfUploadFiles from '../../idfComponents/idfUploadFiles/IdfUploadFiles';
import DropdownSearch from '../../DropdownSearch';
import dealService from '../../../services/deal.service';
import contactService from '../../../services/contact.service';
import organizationService from '../../../services/organization.service';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import Collapse from '@mui/material/Collapse';
const constants = stringConstants.deals.contacts;

const AddFile = ({
  contactId,
  organizationId,
  getProfileInfo,
  dealId,
  getDeal,
  publicPage,
  me,
}) => {
  const ALLFiles = { id: 0, name: 'All Files', type: 'all' };
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openFilesModal, setOpenFilesModal] = useState(false);
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(true);
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [uploaders, setUploaders] = useState([ALLFiles]);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });
  const [fileInput, setFileInput] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = (data) => {
    return (
      me?.role?.admin_access ||
      me?.role?.owner_access ||
      data?.created_by === me?.id
    );
  };

  const handleSubmit = async (file, setIsLoading, getRecentFiles) => {
    const form = new FormData();

    const formBlob = await createBlobObject(file);

    const { size } = formBlob || {};

    if (size > MAX_WEIGHT) {
      setIsLoading(false);
      return setErrorMessage(MAX_WEIGHT_ERROR_MESSAGE);
    }

    // order matters! fields must go first in order to be validated
    form.append('contact_id', contactId || '');
    form.append('organization_id', organizationId || '');
    form.append('deal_id', dealId || '');

    form.append('file', formBlob, file.name);

    try {
      await filesService.uploadFile(form);
      setSuccessMessage(constants.profile.fileUploaded);

      if (dealId) {
        getDeal();
      } else if (!publicPage) {
        getProfileInfo();
      }

      setFileInput(undefined);
      getRecentFiles();
      getFiles();
    } catch (error) {
      setErrorMessage(constants.profile.fileUploadError);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = () => {
    setFileInput(undefined);
  };

  const getFiles = async () => {
    const res = await feedService.getFiles(
      { contactId, organizationId },
      pagination
    );
    setFiles(res?.files);
    setFilteredFiles(res?.files);
    setPagination(res?.pagination);
  };

  const ApplyFilter = (filterId, type) => {
    if (filterId === 0) {
      setFilteredFiles(files);
      return;
    }
    const newFiles = files?.filter((file) => {
      return type === 'deal'
        ? file.deal_id === filterId
        : type === 'contact'
        ? !file.deal_id && file.contact_id === filterId
        : !file.deal_id &&
          !file.contact_id &&
          file.organization_id === filterId;
    });
    setFilteredFiles(newFiles);
  };

  useEffect(() => {
    if (refreshRecentFiles && organizationId) {
      getFiles();
      setRefreshRecentFiles(false);
      getUsers();
    }
  }, [refreshRecentFiles, organizationId]);

  useEffect(() => {
    getUsers();
  }, [files]);

  const getUsers = async () => {
    const uploadedBy = [
      ...new Set(
        files?.map((file) => {
          return {
            dealId: file.deal_id,
            contactId: file.contact_id,
            organizationId: file.organization_id,
          };
        })
      ),
    ];

    const Uploaders = await Promise.all(
      uploadedBy?.map(async (file) => {
        const fileUpload = file.dealId
          ? {
              id: file.dealId,
              name: (await dealService.getDealById(file.dealId))?.name,
              type: 'deal',
            }
          : file.organizationId
          ? {
              id: file.organizationId,
              name: (
                await organizationService.getOrganizationById(
                  file.organizationId
                )
              )?.name,
              type: 'organization',
            }
          : {
              id: file.contactId,
              name: (await contactService.getContactById(file.contactId))
                ?.first_name,
              type: 'contact',
            };

        return fileUpload;
      })
    );
    const uniqueUploaders = Array.from(
      new Set(Uploaders.map(JSON.stringify))
    ).map(JSON.parse);
    const nonDeletedUploaders = uniqueUploaders.filter((unique) => {
      return unique.name;
    });
    setUploaders([ALLFiles, ...nonDeletedUploaders]);
  };

  return (
    <div className={`pt-3 pb-4`}>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <ActivityFilesModal
        setShowModal={setOpenFilesModal}
        showModal={openFilesModal}
        contactId={contactId}
        organizationId={organizationId}
        setRefreshRecentFiles={setRefreshRecentFiles}
        refreshRecentFiles={refreshRecentFiles}
        publicPage={publicPage}
        isOwner={isOwner}
      />

      <div className="mx-3 public-page-setting">
        <IdfUploadFiles
          fileInput={fileInput}
          setFileInput={setFileInput}
          deleteFile={deleteFile}
          setIsLoading={setIsLoading}
          handleSubmit={handleSubmit}
          loading={isLoading}
          organizationId={organizationId}
          setErrorMessage={setErrorMessage}
          openFilesModal={openFilesModal}
          setOpenFilesModal={setOpenFilesModal}
          publicPage={publicPage}
        />
        {!publicPage && (
          <div className="my-2 d-flex align-items-center pt-2 pb-3 border-bottom media">
            <h5 className="mb-0">{`${
              filteredFiles?.length || 0
            } files uploaded`}</h5>
            <div style={{ width: '25%' }} className="ml-auto">
              <DropdownSearch
                title="All Files"
                search={filter}
                customTitle={'name'}
                onChange={(e) => {
                  setFilter(e?.target?.value);
                }}
                data={uploaders}
                onHandleSelect={(item) => {
                  ApplyFilter(item.id, item.type);
                }}
                showAvatar={false}
              />
            </div>
          </div>
        )}
      </div>

      {!publicPage && (
        <TransitionGroup>
          {filteredFiles?.slice(0, 5).map((file, i) => (
            <Collapse key={file.id}>
              <FeedFile
                key={file.id}
                data={file.file}
                wholeLength={files?.slice(0, 5).length}
                index={i}
                updated_at={file.updated_at}
                setRefreshRecentFiles={setRefreshRecentFiles}
                organizationId={organizationId}
                isOwner={isOwner(file)}
              />
            </Collapse>
          ))}
          {pagination.count > 4 && (
            <div className="mt-2 mb-0 mx-3">
              <button
                className="btn btn-white btn-sm col-12 px-0 mx-0"
                onClick={() => {
                  setOpenFilesModal(true);
                }}
              >
                View all
              </button>
            </div>
          )}
        </TransitionGroup>
      )}
    </div>
  );
};

export default AddFile;
