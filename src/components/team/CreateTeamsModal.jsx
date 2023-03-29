import React, { useEffect, useState } from 'react';
import { Input, Label } from 'reactstrap';

import SimpleModal from '../modal/SimpleModal';
import stringConstants from '../../utils/stringConstants.json';
import IdfDropdownSearch from '../idfComponents/idfDropdown/IdfDropdownSearch';
import { isAlphanumeric } from '../../utils/Utils';
import { Col, Row } from 'react-bootstrap';

const errorAlphanumeric = stringConstants.settings.users.filters.alphanumeric;

const CreateTeamsModal = ({
  setErrorMessage,
  showModal,
  setShowModal,
  createGroup,
  isUserId,
  setIsUserId,
  isLoading,
  userData = [],
  data,
}) => {
  const [getTeam, setIsGetTeam] = useState([]);
  const constants = stringConstants.settings.teams;
  const [name, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [team, setTeam] = useState([]);
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchState, setSearchState] = useState({
    search: '',
  });
  const alphanumericError = (input) => {
    const msgError = errorAlphanumeric.error;
    if (input === 'search') {
      setErrorMessage(msgError);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };
  useEffect(() => {
    setTeam(
      team.filter((item) => {
        return item.id !== isUserId.id;
      })
    );
  }, [isUserId]);
  useEffect(() => {
    setTeam(data);
  }, [data]);
  const onInputSearch = (e) => {
    const { value } = e.target || {};
    isAlphanumeric(value) ? setGroupName(value) : alphanumericError(`search`);
  };
  const onInputChange = (e) => {
    const { value } = e.target || {};
    isAlphanumeric(value) ? setDescription(value) : alphanumericError(`search`);
  };
  // Handler of submit
  const handleSubmit = () => {
    const RegExp = /^\s+$/;
    if (RegExp.test(name)) {
      setErrorMessage('Only Letters');
      return;
    }
    if (!isUserId) {
      setErrorMessage('Team Manager is Required');
      return;
    }
    let manager = {};
    const tempAttay = getTeam;
    manager = {
      userId: isUserId?.id,
      isManager: true,
    };
    tempAttay.push(manager);
    const data = {
      members: tempAttay,
      name,
      description,
      isActive: true,
    };
    createGroup(data);
    setGroupName('');
    setIsUserId('');
    setDescription('');
    setIsUserId('');
    setTeam([]);
    setIsGetTeam('');
  };
  const closeModal = () => {
    setShowModal(false);
    setGroupName('');
    setDescription('');
    setIsUserId('');
    setTeam([]);
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
      modalTitle={constants.create.addTeamModalTitle}
      onHandleCloseModal={() => closeModal()}
      open={showModal}
      buttonLabel={constants.create.btnAddTeam}
      buttonsDisabled={!name}
      handleSubmit={() => handleSubmit()}
      allowCloseOutside={false}
      isLoading={isLoading}
    >
      <span className="font-size-sm">{constants.create.textGroupName}</span>
      <Row>
        <Col className="border-right" md={12}>
          <div>
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">Name *</h5>
            </Label>
            <Input
              type="text"
              name="name"
              id="name"
              className="mt-2 mb-2"
              onChange={(e) => onInputSearch(e)}
              value={name}
              placeholder="Team Name" // onChange={onInputChange}
            ></Input>
            <Label htmlFor="" className="mb-0 col-form-label">
              <h5 className="mb-0">Manager *</h5>
            </Label>
            <IdfDropdownSearch
              id="isUserId"
              title={constants.create.dropTextParentTeam}
              name="isUserId"
              showAvatar={false}
              customTitle={''}
              charactersRequire={charactersRequire}
              onChange={(e) => stateChange(e)}
              data={userData.filter(userFilter)}
              onHandleSelect={(e, item) => setIsUserId(item)}
              value={isUserId?.name}
            />
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">Description</h5>
            </Label>
            <textarea
              className="form-control"
              rows={3}
              name="description"
              value={description}
              onChange={(e) => onInputChange(e)}
              placeholder="Team description"
            ></textarea>
          </div>
        </Col>
        {/* <Col md={6}>
          <Label htmlFor="" className="form-label col-form-label">
            <h5>Members</h5>
          </Label>
          <div style={{ height: '300px', overflow: 'scroll' }}>
            {data?.map((user, i) => (
              <>
                <label
                  className={isUserId.id === user.id ? 'd-none' : 'd-block'}
                  htmlFor={user?.id}
                  key={`usersName${i}`}
                >
                  <input
                    id={user?.id}
                    type="checkbox"
                    name="user_id"
                    value={user?.name}
                    onChange={() => handleChange(user)}
                  />
                  <span className="ml-2">
                    {user.first_name !== null
                      ? `${user?.first_name} ${user?.last_name}`
                      : user?.email}
                  </span>
                </label>
              </>
            ))}
          </div> */}
        {/* <LoadMoreButton
            list={data}
            pagination={teamPagination}
            loading={teamLoading}
            onClick={onTeamLoadMore}
          /> */}
        {/* </Col> */}
      </Row>
    </SimpleModal>
  );
};

export default CreateTeamsModal;
