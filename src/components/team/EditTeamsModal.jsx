import React, { useState } from 'react';
import { Input, Label } from 'reactstrap';

import SimpleModal from '../modal/SimpleModal';
import stringConstants from '../../utils/stringConstants.json';
import IdfDropdownSearch from '../idfComponents/idfDropdown/IdfDropdownSearch';
import { Col, Row } from 'react-bootstrap';
import Asterick from '../commons/Asterick';

const EditTeamsModal = ({
  showModal,
  setShowModal,
  updateTeam,
  isLoading,
  setSelectedEditData,
  isUserDataShow = [],
  userData = [],
  data = '',
  setIsUserId,
  members,
}) => {
  const [searchState, setSearchState] = useState({
    search: '',
  });
  const [charactersRequire, setCharactersRequire] = useState('');
  const constants = stringConstants.settings.teams;
  const result = isUserDataShow?.filter(checkAdult);

  function checkAdult(user) {
    return user.isManager === true
      ? `${user?.user.first_name} ${user?.user.last_name}`
      : '';
  }
  const userGetDropdown = result[0];
  members?.sort((e1, e2) => {
    if (e1.isChecked > e2.isChecked) {
      return -1;
    }
    return 0;
  });

  // Handler of submit
  const handleSubmit = () => {
    updateTeam();
  };

  const closeModal = () => {
    setShowModal(false);
  };
  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchState({
        ...searchState,
        search: e.target.value,
      });
    } else {
      return setCharactersRequire(match?.length);
    }
  };
  const userFilter = (state) => {
    const userName = state.first_name || state.email;
    return userName?.toLowerCase().includes(searchState.search?.toLowerCase());
  };
  return (
    <SimpleModal
      modalTitle={constants.edit.title}
      onHandleCloseModal={() => closeModal()}
      open={showModal}
      buttonLabel={constants.edit.saveTeam}
      buttonsDisabled={!data.name}
      handleSubmit={() => handleSubmit()}
      allowCloseOutside={false}
      isLoading={isLoading}
    >
      <span className="font-size-sm">{constants.create.textGroupName}</span>
      <Row>
        <Col md={12}>
          <div>
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">
                Name <Asterick />
              </h5>
            </Label>
            <Input
              type="text"
              name="name"
              id="name"
              className="mt-2 mb-2"
              onChange={(e) =>
                setSelectedEditData({ ...data, name: e.target.value })
              }
              value={data.name}
              placeholder="Team Name"
            ></Input>
            <Label htmlFor="" className="col-form-label">
              <h5 className="mb-0">
                Manager <Asterick />
              </h5>
            </Label>
            <IdfDropdownSearch
              id="isUserId"
              className="mt-2"
              title={constants.create.dropTextParentGroup}
              name="isUserId"
              charactersRequire={charactersRequire}
              showAvatar={false}
              customTitle={''}
              onChange={(e) => stateChange(e)}
              data={userData.filter(userFilter)}
              value={
                userGetDropdown?.user.first_name === undefined
                  ? ''
                  : `${
                      userGetDropdown?.user?.first_name === null
                        ? userGetDropdown?.user?.email
                        : `${userGetDropdown?.user?.first_name} ${userGetDropdown?.user?.last_name}`
                    }`
              }
              onHandleSelect={(e, item) => setIsUserId(item)}
            />
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">Description</h5>
            </Label>
            <textarea
              className="form-control"
              rows={3}
              name="description"
              value={data.description}
              onChange={(e) =>
                setSelectedEditData({
                  ...data,
                  description: e.target.value,
                })
              }
              placeholder="Team description"
            ></textarea>
          </div>
        </Col>
      </Row>
    </SimpleModal>
  );
};

export default EditTeamsModal;
