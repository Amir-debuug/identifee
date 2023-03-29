import React, { useState } from 'react';
import { CardBody, Col, FormGroup, Label } from 'reactstrap';
import RightPanelModal from '../modal/RightPanelModal';
import AddNote from '../peopleProfile/contentFeed/AddNote';
export const ActivityDetail = ({ isShow, setIsShow, data }) => {
  const [openNote, setOpenNote] = useState(false);
  const handleClose = () => {
    setIsShow(false);
  };
  const notePlaceholder = (
    <div
      className="cursor-pointer text-muted"
      style={{ backgroundColor: 'lightyellow' }}
    >
      {openNote ? '' : 'Start writing a note...'}
    </div>
  );
  return (
    <>
      <RightPanelModal
        showModal={isShow}
        setShowModal={() => handleClose()}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={540}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center text-capitalize">
            Detals
          </div>
        }
      >
        <CardBody className="right-bar-vh overflow-y-auto">
          <h4>Task Details</h4>
          <FormGroup row className="py-1 align-items-center">
            <Label md={3} className="text-left font-size-sm">
              Due Date
            </Label>
            <Col md={9} className="pl-0">
              {data?.start_date}
            </Col>
          </FormGroup>
          <FormGroup row className="py-1 align-items-center">
            <Label md={3} className="text-left font-size-sm">
              Priority
            </Label>
            <Col md={9} className="pl-0">
              {data?.priority ? 'Hight' : 'Normal'}
            </Col>
          </FormGroup>
          <FormGroup row className="py-1 align-items-center">
            <Label md={3} className="text-left font-size-sm">
              Status
            </Label>
            <Col md={9} className="pl-0">
              {data?.done ? 'completed' : 'In Progress'}
            </Col>
          </FormGroup>
          <FormGroup row className="py-1 align-items-center">
            <Label md={3} className="text-left font-size-sm">
              Reminder
            </Label>
            <Col md={9} className="pl-0"></Col>
          </FormGroup>
          <FormGroup row className="py-1 align-items-center">
            <Label md={3} className="text-left font-size-sm">
              Description
            </Label>
            <Col md={9} className="pl-0">
              {data?.notes}
            </Col>
          </FormGroup>
          <FormGroup row className="py-1 align-items-center">
            <Label md={12} className="text-left font-size-sm">
              Notes
            </Label>
            <Col md={12} className="pl-0">
              <AddNote setOverlay={setOpenNote} placeholder={notePlaceholder} />
            </Col>
          </FormGroup>
        </CardBody>
      </RightPanelModal>
    </>
  );
};
