import React, { useState } from 'react';
import { Input, Label } from 'reactstrap';

import SimpleModal from '../modal/SimpleModal';
import stringConstants from '../../utils/stringConstants.json';
// import IdfDropdownSearch from '../idfComponents/idfDropdown/IdfDropdownSearch';
import { isAlphanumeric } from '../../utils/Utils';
import { DropdownTreeView } from '../prospecting/v2/common/DropdownTreeView';

const errorAlphanumeric = stringConstants.settings.users.filters.alphanumeric;

const CreateGroupModal = ({
  setErrorMessage,
  showModal,
  setShowModal,
  createGroup,
  data = [],
  siblingAccess,
  setIsDropdownId,
  isDropdownId,
  isAddSingleRole = '',
  setSblingAccess,
}) => {
  const constants = stringConstants.settings.groups;
  const [groupName, setGroupName] = useState('');
  const [parentGroup, setParentGroup] = useState(null);
  const [description, setDescription] = useState('');

  const alphanumericError = (input) => {
    const msgError = errorAlphanumeric.error;
    if (input === 'search') {
      setErrorMessage(msgError);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

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
    createGroup(groupName, description, parentGroup);
    setGroupName('');
    setParentGroup(null);
    setDescription('');
    setIsDropdownId('');
    setSblingAccess(false);
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setGroupName('');
    setDescription('');
    setParentGroup(null);
    setIsDropdownId('');
  };

  return (
    <SimpleModal
      modalTitle={constants.create.addGroupModalTitle}
      onHandleCloseModal={() => closeModal()}
      open={showModal}
      buttonLabel={constants.create.btnAddGroup}
      buttonsDisabled={!groupName}
      handleSubmit={() => handleSubmit()}
      allowCloseOutside={false}
    >
      <span className="font-size-sm">{constants.create.textGroupName}</span>
      <Input
        data-testid="group_name"
        type="text"
        name="group_name"
        id="group_name"
        className="mt-2 mb-2"
        onChange={(e) => onInputSearch(e)}
        value={groupName}
        placeholder={constants.create.placeholderInpNewGroup}
      />
      <Label htmlFor="" className="form-label col-form-label">
        <h5 className="mb-0">Reports to</h5>
      </Label>
      {isAddSingleRole === '' ? (
        <DropdownTreeView
          data={data}
          setIsDropdownId={setIsDropdownId}
          isDropdownId={isDropdownId}
          editRoleData={isAddSingleRole}
        />
      ) : (
        <Input
          data-testid="group_name"
          type="text"
          name="group_name"
          id="group_name"
          className="mt-2 mb-2"
          onChange={(e) => onInputSearch(e)}
          value={isAddSingleRole.name}
          disabled
          placeholder={constants.create.placeholderInpNewGroup}
        />
      )}
      <Label
        htmlFor="has_sibling_access"
        className="form-label col-form-label mb-0 ml-4 w-100"
      >
        <Input
          type="checkbox"
          name="has_sibling_access"
          id="has_sibling_access"
          value={siblingAccess}
          checked={siblingAccess}
          onChange={() => setSblingAccess(!siblingAccess)}
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
        value={description}
        onChange={(e) => onInputChange(e)}
        placeholder="A few words about this role"
      ></textarea>
    </SimpleModal>
  );
};

export default CreateGroupModal;
