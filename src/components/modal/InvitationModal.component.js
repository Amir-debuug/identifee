import React, { useState } from 'react';
import { CardBody, CardFooter, Label, Col, FormGroup } from 'reactstrap';
import ButtonIcon from '../../components/commons/ButtonIcon';
import userService from '../../services/user.service';
import { ROLE_LABEL, PROFILE_LABEL } from '../../utils/constants';
import IdfSelectRole from '../idfComponents/idfDropdown/IdfSelectRole';
import { DropdownTreeView } from '../prospecting/v2/common/DropdownTreeView';
import RightPanelModal from './RightPanelModal';
import InputValidation from '../commons/InputValidation';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../commons/ControllerValidation';
import { emailRegex } from '../../utils/Utils';

const InviteFormGroup = ({ label, component }) => {
  return (
    <FormGroup row className="py-1">
      <Label md={3} className="text-right font-size-sm">
        {label}
      </Label>
      <Col md={9} className="pl-0">
        {component}
      </Col>
    </FormGroup>
  );
};
const InvitationModal = ({
  showModal,
  setShowModal,
  data,
  isShowTreeView,
  setIsShowTreeView,
  getUsers,
  setErrorMessage = () => {},
  setSuccessMessage = () => {},
}) => {
  const defaultInviteObject = {
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    groupId: '',
    tenant: '',
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: defaultInviteObject,
  });

  const [inviteFormData, setInviteFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchRole, setSearchRole] = useState({});
  const [, setRoleSelection] = useState({});
  const onHandleCloseModal = () => {
    setShowModal(false);
    setSearchRole({});
    setIsShowTreeView('');
    setRoleSelection({});
    getUsers();
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const { firstName, lastName, email, groupId, roleId, tenant } =
        inviteFormData;
      const invitationInfo = {
        roleId,
        groupId: groupId || isShowTreeView.id,
        tenant,
        users: [
          {
            firstName,
            lastName,
            email,
          },
        ],
      };
      const response = await userService.invite(invitationInfo);
      const { isValid, error } = response[0];
      if (isValid) {
        setSuccessMessage('Invite sent successfully.');
        reset(defaultInviteObject);
        setInviteFormData(defaultInviteObject);
        onHandleCloseModal();
      } else {
        setErrorMessage(error?.message);
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(
        'Error sending invite. Please check console for details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onHandleChangeSelect = (e) => {
    const { value } = e.target;
    setSearchRole({
      ...searchRole,
      search: value?.name,
    });

    setRoleSelection(value);
    setInviteFormData({ ...inviteFormData, roleId: value.id });
    setValue('roleId', value.id);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInviteFormData({ ...inviteFormData, [name]: value });
    setValue(name, value);
  };

  return (
    <RightPanelModal
      showModal={showModal}
      setShowModal={() => {
        reset(defaultInviteObject);
        onHandleCloseModal();
      }}
      showOverlay={true}
      containerBgColor={'pb-0'}
      containerWidth={540}
      containerPosition={'position-fixed'}
      headerBgColor="bg-gray-5"
      Title={
        <div className="d-flex py-2 align-items-center">
          <h3 className="mb-0">Invite User</h3>
        </div>
      }
    >
      <CardBody className="overflow-y-auto">
        <div>
          <InviteFormGroup
            label="First Name"
            component={
              <InputValidation
                name="firstName"
                type="input"
                placeholder=""
                value={inviteFormData.firstName || ''}
                errorDisplay="mb-0"
                classNames="mr-2"
                validationConfig={{
                  required: 'First Name cannot be empty.',
                  inline: false,
                  borderLeft: true,
                  onChange: handleOnChange,
                }}
                errors={errors}
                register={register}
              />
            }
          />

          <InviteFormGroup
            label="Last Name"
            component={
              <InputValidation
                name="lastName"
                type="input"
                placeholder=""
                value={inviteFormData.lastName || ''}
                classNames="mr-2"
                errorDisplay="mb-0"
                validationConfig={{
                  required: 'Last Name cannot be empty.',
                  inline: false,
                  borderLeft: true,
                  onChange: handleOnChange,
                }}
                errors={errors}
                register={register}
              />
            }
          />

          <InviteFormGroup
            label="Email"
            component={
              <InputValidation
                name="email"
                type="input"
                placeholder=""
                value={inviteFormData.email || ''}
                classNames="mr-2"
                errorDisplay="mb-0"
                validationConfig={{
                  required: 'Email cannot be empty.',
                  inline: false,
                  borderLeft: true,
                  onChange: handleOnChange,
                  pattern: {
                    value: emailRegex,
                    message: 'Please enter a valid email.',
                  },
                }}
                errors={errors}
                register={register}
              />
            }
          />

          <InviteFormGroup
            label={ROLE_LABEL}
            component={
              <ControllerValidation
                name="groupId"
                errors={errors}
                form={inviteFormData}
                errorDisplay="mb-0"
                control={control}
                validationConfig={{
                  required: 'Role is required.',
                }}
                renderer={({ field }) => (
                  <>
                    <DropdownTreeView
                      data={data}
                      setIsDropdownId={(selected) => {
                        setValue('groupId', selected.id);
                        setInviteFormData({
                          ...inviteFormData,
                          groupId: selected.id,
                        });
                        setIsShowTreeView(selected);
                      }}
                      isDropdownId={isShowTreeView}
                      validationConfig={{
                        required: 'Role is required.',
                      }}
                      fieldState={getFieldState('groupId')}
                    />
                  </>
                )}
              />
            }
          />
          <InviteFormGroup
            label={PROFILE_LABEL}
            component={
              <ControllerValidation
                name="roleId"
                errors={errors}
                form={inviteFormData}
                errorDisplay="mb-0"
                control={control}
                validationConfig={{
                  required: 'Profile is required.',
                }}
                renderer={({ field }) => (
                  <>
                    <IdfSelectRole
                      name="roleId"
                      onChange={onHandleChangeSelect}
                      value={searchRole}
                      validationConfig={{
                        required: 'Profile is required.',
                      }}
                      fieldState={getFieldState('roleId')}
                      query={{ page: 1, limit: 1000, self: true }} // TODO: Define if the roles dropdown will have pagination
                    />
                  </>
                )}
              />
            }
          />
        </div>
      </CardBody>
      <CardFooter className="bg-gray-5">
        <div className="d-flex gap-2 justify-content-end align-items-center">
          <button
            className="btn btn-sm btn-white"
            data-dismiss="modal"
            onClick={() => {
              reset(defaultInviteObject);
              onHandleCloseModal();
            }}
          >
            Cancel
          </button>
          <ButtonIcon
            type="button"
            classnames="btn-sm"
            label="Send Invite"
            loading={isLoading}
            color="primary"
            onclick={handleSubmit(onSubmit)}
          />
        </div>
      </CardFooter>
    </RightPanelModal>
  );
};

export default InvitationModal;
