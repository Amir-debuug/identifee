import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  Card,
  CardForm,
  CardHeader,
  CardBlock,
  CardContentCustom,
  CardSection,
  CardSideCustom,
  CardTitle,
  CardSubtitle,
  CardSubContent,
  TextInput,
  DropdownSearch,
  CardButton,
  List,
  Item,
  ItemAvatar,
  ItemUser,
  ItemActions,
  SwitchInput,
} from '../../../components/layouts/CardLayout';
import Alert from '../../../components/Alert/Alert';
import roleService from '../../../services/role.service';
import userService from '../../../services/user.service';
import stringConstants from '../../../utils/stringConstants.json';
import permissions from '../../../utils/permissions.json';
import { isAlphanumeric, isModuleAllowed } from '../../../utils/Utils';
import Avatar from '../../../components/Avatar';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import { PermissionsContext } from '../../../contexts/permissionContext';
import { Col, Row } from 'reactstrap';
import { FormCheck } from 'react-bootstrap';
import { CANCEL_LABEL, NAME_INVITED_USER } from '../../../utils/constants';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import TooltipComponent from '../../../components/lesson/Tooltip';
import _, { capitalize } from 'lodash';
import { useTenantContext } from '../../../contexts/TenantContext';

const constants = stringConstants.settings.roles.edit;

const permissionList = permissions.permissionList;

const role = {
  name: '',
  description: '',
  id: '',
  isAdmin: false,
};

const buttons = {
  save: {
    title: constants.saveRole,
    variant: 'primary',
  },
  remove: {
    title: constants.remove,
    variant: 'outline-danger',
  },
  add: {
    title: constants.add,
    variant: 'outline-primary',
  },
};

const switches = {
  admin: {
    isAdmin: {
      id: 'sw-is-admin',
      label: constants.isAdmin,
    },
  },
  owner: {
    isOwner: {
      id: 'sw-is-owner',
      label: constants.isOwner,
    },
  },
};

const EditRoles = () => {
  const history = useHistory();
  const [roleData, setRoleData] = useState(role);
  const [searchUser, setSearchUser] = useState({});
  const [searchUserResults, setSearchUserResults] = useState([]);
  const [userSelection, setUserSelection] = useState([{}]);
  const [initialRoleUsers, setInitialRoleUsers] = useState([{}]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [inputSearchError, setInputSearchError] = useState({});
  const [ownerAccessSwitch, setOwnerAccessSwitch] = useState(false);
  const [permissionSwitches, setpermissionSwitches] = useState();
  const { permissionChanges, setPermissionChanges } =
    useContext(PermissionsContext);

  const [permissions, setPermissions] = useState([...permissionList]);
  const [permissionsDropdown, setPermissionsDropdown] = useState('');
  const { tenant } = useTenantContext();
  const onInputChange = (e) => {
    const { name, value } = e.target || {};
    setRoleData({
      ...roleData,
      [name]: value,
    });
  };
  const alphanumericError = (input) => {
    const msgError = 'Only alphanumeric characters are allowed';
    if (input === 'search') {
      setInputSearchError({ error: true, msg: msgError });
      setTimeout(() => setInputSearchError({ error: false, msg: '' }), 3500);
    }
  };

  const onInputSearch = (e) => {
    const { value } = e.target || {};
    isAlphanumeric(value)
      ? setSearchUser({
          ...searchUser,
          search: value,
        })
      : alphanumericError(`search`);
  };

  const roleId = useParams();
  const deleteUserItem = async (itemIndex) => {
    const updatedUsers = userSelection.filter(
      (item, index) => index !== itemIndex
    );
    setUserSelection(updatedUsers);
  };
  // Update role service
  const updateRole = () => {
    return new Promise((resolve, reject) => {
      roleData.id = roleId.id;
      roleData.isOwner = ownerAccessSwitch || false;

      userSelection.length > 0 &&
        userSelection.forEach(async (user) => {
          const checkIfExist = initialRoleUsers.some(
            (item) => item.id === user.id
          );
          console.log(checkIfExist);
          if (!checkIfExist) {
            const userUpdate = {
              roleId: roleId.id,
              first_name: null,
              last_name: null,
              avatar: user?.avatar,
              status: user?.status,
            };

            userService
              .updateUserInfoById(user.id, userUpdate)
              .catch((err) => console.log(err));
          }
        });
      console.log(initialRoleUsers);
      initialRoleUsers.length > 0 &&
        initialRoleUsers.forEach(async (user) => {
          const checkIfExist = userSelection.some(
            (item) => item.id === user.id
          );
          if (!checkIfExist) {
            const userUpdate = {
              roleId: null,
              first_name: null,
              last_name: null,
              avatar: null,
            };

            userService
              .updateUserInfoById(user.id, userUpdate)
              .catch((err) => console.log(err));
          }
        });

      setInitialRoleUsers(userSelection);

      return roleService.updateRole(roleData).then(resolve).catch(reject);
    });
  };

  const getRoleById = () => {
    const roleById = roleService.getRoleById(roleId.id);
    roleById &&
      roleById.then((roleResult) => {
        setRoleData({
          name: roleResult.name || '',
          description: roleResult.description || '',
          id: roleResult.id || '',
        });
        setOwnerAccessSwitch(roleResult.owner_access || '');
      });
  };

  const getRoleUsers = async () => {
    const response = await userService
      .getUsers({ roleId: roleId.id }, { limit: 20 })
      .catch((err) => console.log(err));

    const roleUsers = response.data.users;

    const roleUsersList = roleUsers.map((user) => {
      const roleUsersItem = {
        name: `${
          user.first_name !== null ? user.first_name : NAME_INVITED_USER
        } ${user.last_name !== null ? user.last_name : ''}`,
        email: user.email,
        avatar: user.avatar,
        id: user.id,
        status: user?.status,
        roleId: user.roleId,
      };
      return roleUsersItem;
    });
    setUserSelection(roleUsersList);
    setInitialRoleUsers(roleUsersList);
  };

  const getRolePermissions = async () => {
    const rolePermissions = await roleService
      .getPermissionsByRole(roleId.id)
      .catch((err) => console.log(err));

    const permissionsCollection = rolePermissions.filter((item) => {
      return item.collection;
    });

    const groupedPermission = _.groupBy(permissionsCollection, 'collection');

    const loadedPermissions = Object.keys(groupedPermission).map((key) => {
      const inner = groupedPermission[key]; // array
      const innerPermssion = {};
      innerPermssion.name = key;
      innerPermssion.label = capitalize(key);
      innerPermssion.group = inner.map((perm) => {
        return {
          name: perm.action,
          label: capitalize(perm.action),
          isChecked: true,
          permissions: [
            {
              label: capitalize(perm.action),
              collection: perm.collection,
              action: perm.action,
            },
          ],
        };
      });
      return innerPermssion;
    });

    const permissionJson = [...permissions];
    permissionJson.forEach((permission) => {
      permission.inner_permissions.forEach((permCat) => {
        const permFound = loadedPermissions.find(
          (f) => f.name === permCat.name
        );
        if (permFound) {
          const groupItems = permFound.group.map((m) => m.name);
          permCat.group.forEach((m2) => {
            m2.isChecked = groupItems.indexOf(m2.name) > -1;
          });
        }
      });
    });
    setPermissions(permissionJson);
    setpermissionSwitches(permissionsCollection);
  };

  useEffect(() => {
    getRoleById();
    getRoleUsers();
    getRolePermissions();
  }, []);

  useEffect(() => {
    handleUpload();
  }, [searchUser]);
  const handleUpload = async () => {
    const searchResults = await userService
      .getUsers(searchUser, {
        page: 1,
        limit: 10,
      })
      .catch((err) => console.log(err));

    const { data } = searchResults || {};
    setSearchUserResults(data?.users);
  };
  useEffect(() => {
    if (ownerAccessSwitch) setOwnerAccessSwitch(true);
  }, [ownerAccessSwitch]);

  const handleSubmit = async () => {
    setIsLoading(true);
    await updateRole();
    await roleService.updatePermissions(roleId.id, [...permissionSwitches]);
    await getRolePermissions();
    setIsLoading(false);
    setToast(constants.roleUpdateSuccess);
    setPermissionChanges(!permissionChanges);
    handleDropdownPermission('');
  };

  const handleSwitchEvent = async (e, permissionGroup, permissionsCategory) => {
    const isChecked = e.target.checked;
    const newPermissionGroup = {
      collection: permissionGroup.permissions[0].collection,
      action: permissionGroup.name,
    };
    // update permissions category group
    const updatedGroup = permissionsCategory.group.map((group) => ({
      ...group,
      isChecked:
        group.name === permissionGroup.name
          ? !group.isChecked
          : group.isChecked,
    }));

    const updatedPermissions = [...permissions].map((perm) => ({
      ...perm,
      inner_permissions: [...perm.inner_permissions].map((permCat) => ({
        ...permCat,
        group:
          permCat.name === permissionsCategory.name
            ? updatedGroup
            : permCat.group,
      })),
    }));

    setPermissions(updatedPermissions);
    if (isChecked) {
      setpermissionSwitches([...permissionSwitches, newPermissionGroup]);
    } else {
      const updatedSwitches = permissionSwitches.filter(
        (f) =>
          f.collection !== newPermissionGroup.collection ||
          f.action !== newPermissionGroup.action
      );
      setpermissionSwitches(updatedSwitches);
    }
    if (updatedGroup.every((item) => !item.isChecked)) {
      handleDropdownPermission('');
    }
  };
  const handlePermissionCategoryChange = async (
    permission,
    permissionCategory
  ) => {
    // now each permission object has inner_permissions array which is being rendered in UI, so we have to update that
    // in order to reflect in state/UI
    // instead of using .isChecked, you've started using permissionSwitches in value of toggle
    const updatedGroup = permissionCategory?.group.map((group) => ({
      ...group,
      isChecked: !permissionCategory.isChecked,
    }));
    const updatedInnerPermissions = [...permission.inner_permissions].map(
      (permCat) => ({
        ...permCat,
        isChecked:
          permissionCategory.name === permCat.name
            ? !permissionCategory.isChecked
            : permCat.isChecked,
        group:
          permissionCategory.name === permCat.name
            ? updatedGroup
            : permCat.group,
      })
    );

    // once we have inner_permissions updated we need to updated its parent too.
    const updatedPermissions = [...permissions].map((perm) => ({
      ...perm,
      inner_permissions:
        perm.name === permission.name
          ? updatedInnerPermissions
          : perm.inner_permissions,
    }));
    setPermissions(updatedPermissions);
    const collection = permission.inner_permissions.find((item) => {
      return item.name === permissionCategory.name;
    });
    const action = collection?.group?.filter((item) => {
      return item.name;
    });
    const permissionCheckUnCheck = permissionSwitches?.find((item) => {
      return item.collection === permissionCategory.name;
    });
    let updatedCheckedPermissions = [];
    if (permissionCategory.isChecked) {
      updatedCheckedPermissions = permissionSwitches?.filter(
        (permissionCheck) => {
          return (
            permissionCheck.collection !== permissionCheckUnCheck.collection
          );
        }
      );
      setpermissionSwitches(updatedCheckedPermissions);
      handleDropdownPermission('');
    } else {
      const permissionArray = action.map((group) => {
        const permissionChecked = {
          collection: group.permissions[0].collection,
          action: group.permissions[0].action,
        };
        return permissionChecked;
      });
      const allPerrmissionsData = [...permissionSwitches, ...permissionArray];
      setpermissionSwitches(allPerrmissionsData);
    }
  };

  const handleDropdownPermission = (item) => {
    if (permissionsDropdown) {
      setPermissionsDropdown('');
    } else if (!permissionsDropdown) {
      setPermissionsDropdown(item);
    }
  };

  const handleSwtichCheck = (isChecked) => {
    const updatedPermissions = [...permissionList];
    updatedPermissions.forEach((permission) => {
      permission.inner_permissions.forEach((permCategory) => {
        permCategory.isChecked = isChecked;
        permCategory.group.forEach((group) => {
          group.isChecked = isChecked;
        });
      });
    });
    setPermissions(updatedPermissions);
  };

  const handleOwnerSwitch = async () => {
    setpermissionSwitches('');
    setOwnerAccessSwitch(!ownerAccessSwitch);
    if (!ownerAccessSwitch) {
      const allPermission = permissionList?.flatMap((_) => {
        return _.inner_permissions?.flatMap((_) => {
          return _.group?.flatMap((_) => {
            return _.permissions?.flatMap((_) => {
              return {
                collection: _.collection,
                action: _.action,
              };
            });
          });
        });
      });
      setpermissionSwitches(allPermission);
      handleSwtichCheck(true);
    } else {
      setpermissionSwitches([]);
      handleSwtichCheck(false);
    }
  };
  return (
    <>
      <AlertWrapper>
        <Alert message={toast} setMessage={setToast} color="success" />
      </AlertWrapper>
      <Card>
        <CardHeader>
          <CardTitle>{constants.title}</CardTitle>
          <CardButton
            title={buttons.save.title}
            variant={buttons.save.variant}
            onClick={handleSubmit}
            isLoading={isLoading}
            className="btn-sm"
          />
        </CardHeader>
        <CardForm wrapInContainer={false}>
          <CardSection endLine>
            <CardBlock>
              <TextInput
                label={constants.name}
                name={`name`}
                value={roleData.name}
                onChange={onInputChange}
              />
              <TextInput
                label={constants.description}
                name={`description`}
                value={roleData.description}
                onChange={onInputChange}
              />
            </CardBlock>
          </CardSection>
          <CardSection>
            <CardContentCustom>
              <CardSubtitle endLine>{constants.users}</CardSubtitle>
              <CardSubContent>
                <DropdownSearch
                  id={`selectUsersDropdown`}
                  roleId={roleId.id}
                  title={constants.usersSearchTitle}
                  placeholder={constants.usersSearchPlaceholder}
                  value={searchUser}
                  onChange={onInputSearch}
                  results={searchUserResults}
                  error={inputSearchError}
                  selection={userSelection}
                  setSelection={setUserSelection}
                />
                <List>
                  {userSelection
                    .filter((value) => Object.keys(value).length !== 0)
                    .map((user, index) => (
                      <Item id={`user-${index}`} key={index}>
                        <ItemAvatar>
                          <Avatar user={user} classModifiers="mr-2" />
                        </ItemAvatar>

                        <ItemUser name={user.name} email={user.email} />
                        <ItemActions>
                          <TooltipComponent title={'delete'}>
                            <a
                              onClick={(e) => {
                                deleteUserItem(index);
                              }}
                              className="cursor-pointer"
                            >
                              <MaterialIcon
                                icon={'delete'}
                                clazz="text-danger"
                              />
                            </a>
                          </TooltipComponent>
                        </ItemActions>
                      </Item>
                    ))}
                  {userSelection.filter(
                    (value) => Object.keys(value).length !== 0
                  ).length < 1 && (
                    <p className="text-muted text-center">{`No users`}</p>
                  )}
                </List>
              </CardSubContent>
            </CardContentCustom>
            <CardSideCustom>
              <CardSubtitle endLine>{constants.adminPermissions}</CardSubtitle>
              <CardSubContent>
                <SwitchInput
                  id={switches.owner.isOwner.id}
                  label={switches.owner.isOwner.label}
                  checked={ownerAccessSwitch}
                  onChange={() => handleOwnerSwitch()}
                />
              </CardSubContent>
              {permissions.length > 0 &&
                permissions.map((permission, i) => (
                  <div key={`permissions${i}`}>
                    {permission.inner_permissions.length > 0 &&
                      permission.inner_permissions.map(
                        (permissionsCategory) => {
                          if (
                            isModuleAllowed(
                              tenant.modules,
                              permissionsCategory.tenantModule
                            )
                          ) {
                            return (
                              <>
                                <Row
                                  className="switch-setting-main align-items-center mx-0 pl-0"
                                  key={permissionsCategory.name}
                                >
                                  <Col md={5} className="pl-0">
                                    <h6>{permissionsCategory.label}</h6>
                                  </Col>

                                  <Col md={7}>
                                    <div
                                      className={
                                        ownerAccessSwitch
                                          ? 'd-flex align-items-center pt-0 pb-2 pointer-event'
                                          : 'd-flex align-items-center pt-0 pb-2'
                                      }
                                    >
                                      <FormCheck
                                        id={permissionsCategory.label}
                                        type="switch"
                                        custom={true}
                                        name={permissionsCategory.label}
                                        disabled={ownerAccessSwitch}
                                        checked={permissionSwitches?.find(
                                          (item) => {
                                            return item.collection ===
                                              permissionsCategory.name
                                              ? (permissionsCategory.isChecked = true)
                                              : (permissionsCategory.isChecked = false);
                                          }
                                        )}
                                        onChange={() =>
                                          handlePermissionCategoryChange(
                                            permission,
                                            permissionsCategory
                                          )
                                        }
                                      />
                                      <div>
                                        {permissionsCategory.group.length > 0 &&
                                          permissionsCategory.isChecked && (
                                            <div
                                              className="switch-setting-1"
                                              onClick={() =>
                                                handleDropdownPermission(
                                                  permissionsCategory.name
                                                )
                                              }
                                            >
                                              {permissionsCategory.isChecked &&
                                                permissionsCategory.group.map(
                                                  (permissionGroup, index) => {
                                                    return (
                                                      <>
                                                        {permissionGroup.isChecked && (
                                                          <div className="abc">
                                                            <span>
                                                              {
                                                                permissionGroup.label
                                                              }
                                                            </span>
                                                          </div>
                                                        )}
                                                      </>
                                                    );
                                                  }
                                                )}
                                            </div>
                                          )}
                                        {permissionsCategory.group.length > 0 &&
                                          permissionsCategory.name ===
                                            permissionsDropdown && (
                                            <div className="switch-setting shadow">
                                              {permissionsCategory.group.map(
                                                (permissionGroup) => {
                                                  return (
                                                    <>
                                                      <label
                                                        className="d-block"
                                                        htmlFor={
                                                          permissionGroup.name
                                                        }
                                                      >
                                                        <input
                                                          id={
                                                            permissionGroup.name
                                                          }
                                                          type="checkbox"
                                                          checked={
                                                            permissionGroup.isChecked
                                                          }
                                                          onChange={(e) =>
                                                            handleSwitchEvent(
                                                              e,
                                                              permissionGroup,
                                                              permissionsCategory
                                                            )
                                                          }
                                                          disabled={isLoading}
                                                        />
                                                        <span>
                                                          {
                                                            permissionGroup.label
                                                          }
                                                        </span>
                                                      </label>
                                                    </>
                                                  );
                                                }
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                              </>
                            );
                          } else {
                            return '';
                          }
                        }
                      )}
                  </div>
                ))}
            </CardSideCustom>
          </CardSection>
        </CardForm>
        <button
          className="btn btn-white btn-sm"
          onClick={() => history.goBack()}
        >
          {CANCEL_LABEL}
        </button>
      </Card>
    </>
  );
};

export default EditRoles;
