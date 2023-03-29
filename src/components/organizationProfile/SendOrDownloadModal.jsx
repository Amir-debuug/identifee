import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Label,
} from 'reactstrap';
import { Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

import dataReportConstants from '../../utils/constants/dataReport.json';
import { CardButton } from '../layouts/CardLayout';
import authService from '../../services/auth.service';
import AutoComplete from '../AutoComplete';
import contactService from '../../services/contact.service';
import { useTenantContext } from '../../contexts/TenantContext';

const constants = dataReportConstants.strings;

const SendOrDownloadModal = ({
  showModal,
  setShowModal,
  getProfileInfo,
  setToast,
  setColorToast,
  organizationId,
}) => {
  const linkRef = useRef(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { tenant } = useTenantContext();
  const { clientPortalUrl } = tenant;

  const sendReport = async (emails) => {
    const invitationResults = emails?.map(async (email) => {
      await authService.guestToken(email.email);
    });

    await Promise.all(invitationResults);
  };

  const handleCloseModal = () => {
    setIsLoadingEmail(false);
    setShowModal(false);
  };

  const handleAlreadySentReportNotif = () => {
    handleCloseModal();

    setColorToast(constants.colors.danger);
    return setToast('Email already sent before');
  };

  const handleSendReport = async () => {
    setIsLoadingEmail(true);

    await sendReport([selectedItem]).catch(() =>
      handleAlreadySentReportNotif()
    );

    handleCloseModal();

    setToast('E-mail sent successfully');
    setColorToast(constants.colors.success);
  };

  const onCopyLink = (e) => {
    navigator.clipboard.writeText(
      `${clientPortalUrl}/clientportal/login?email=${selectedItem?.email}`
    );

    setLinkCopied(true);

    setTimeout(() => setLinkCopied(false), 2000);
  };

  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('');
  const [data, setData] = useState([]);

  const searchContacts = async () => {
    try {
      const { data } = await contactService.getContact(
        { organization_id: organizationId, search: filter },
        { limit: 10, page: 1 }
      );
      setData(
        data.contacts?.map((u) => ({
          ...u,
          name: `${u.first_name} ${u.last_name}`,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelect = (item) => {
    setSelectedItem({
      ...item,
      email: item.email_work || item.email_fax || item.email_other,
    });
  };

  useEffect(() => {
    if (filter) {
      searchContacts();
    }
  }, [filter]);

  return (
    <Modal isOpen={showModal} fade={false} size="lg" className="w-600">
      <ModalHeader tag="h2" className="p-3" toggle={() => setShowModal(false)}>
        Share Client Portal
      </ModalHeader>
      <ModalBody className="border-top mb-0 p-3">
        <FormGroup>
          <Label className="mb-0">Select contact</Label>
        </FormGroup>
        <AutoComplete
          id="assigned_user_id"
          placeholder="Search for contacts"
          name="assigned_user_id"
          showAvatar={true}
          loading={false}
          onChange={(e) => {
            setFilter(e?.target?.value);
          }}
          data={data}
          showIcon={false}
          onHandleSelect={(item) => {
            handleSelect(item);
          }}
          customKey="name"
        />
        <div ref={linkRef} className="d-none">
          <div className="d-flex justify-content-between">
            <span className="p-2 rounded border w-75">{`${clientPortalUrl}/clientportal/login?email=${selectedItem?.email}`}</span>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="p-3 gap-2">
        <Col className={`col-auto p-0`}>
          <CardButton
            className={'font-weight-500 btn-sm btn-white'}
            title={`Cancel`}
            onClick={handleCloseModal}
          />
          {selectedItem?.id && (
            <>
              <OverlayTrigger
                target={linkRef}
                show={linkCopied}
                placement="top"
                overlay={
                  <Tooltip className="font-weight-bold">
                    Login Link Copied!
                  </Tooltip>
                }
              >
                <CardButton
                  type="button"
                  className={'btn-sm mx-1 btn-primary'}
                  title="Copy Login Link"
                  icon="copy_all"
                  onClick={onCopyLink}
                />
              </OverlayTrigger>
              <CardButton
                className={'font-weight-500 btn-sm btn-primary'}
                title={`Send`}
                icon={`email`}
                isLoading={isLoadingEmail}
                onClick={handleSendReport}
              />
            </>
          )}
        </Col>
      </ModalFooter>
    </Modal>
  );
};

export default SendOrDownloadModal;
