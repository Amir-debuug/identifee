import React, { useState, useEffect } from 'react';
import { Label, Spinner } from 'reactstrap';
import SimpleModal from '../modal/SimpleModal';
import stringConstants from '../../utils/stringConstants.json';
import { createBlobObject, overflowing } from '../../utils/Utils';
import { Col, FormCheck, Row } from 'react-bootstrap';
import FormColor from '../siteSettings/FormColor';
import IdfTooltip from '../idfComponents/idfTooltip';
import IdfIcon from '../idfComponents/idfIcon';
import { BRANDING_LABEL, CHOOSE_IMAGE_FILE } from '../../utils/constants';
import DragDropUploadFile from '../commons/DragDropUploadFile';
import userService from '../../services/user.service';
import modulesList from '../../utils/modules.json';
import InputValidation from '../commons/InputValidation';
import Asterick from '../commons/Asterick';
import { useForm } from 'react-hook-form';

const AllModulesList = [
  'crm',
  'deals',
  'contacts',
  'companies',
  'activities',
  'business_intelligence',
  'client_portal',
  'training',
  'insights',
  'resources',
  'resources_export',
  'resources_import',
  'settings',
  'setting_profile',
  'setting_security',
  'setting_integrations',
  'setting_notifications',
  'setting_training',
  'setting_branding',
  'setting_manage_users',
  'setting_pipeline_stages',
  'setting_fields',
  'setting_products',
  'Dashboards',
  'Dashboard_Overview',
  'Dashboard_Portfolio',
  'Dashboard_Deal',
  'Dashboard_Training',
  'Dashboard_Activities',
];

const CreateTenantModal = ({
  setErrorMessage,
  showLoading,
  showModal,
  setSelectedEditData,
  setShowModal,
  isLoading,
  handleUpdateTenant,
  data = [],
  selectedEditData,
  handleCreateTenant,
}) => {
  const defaultOptions = {
    owner: {
      email: '',
    },
    name: '',
    domain: '',
    description: '',
    use_logo: false,
    modules: [],
    logo: '',
    icon: '',
    type: 'owner',
    colors: {
      secondaryColor: '',
    },
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultOptions,
  });
  const constants = stringConstants.tenants;
  const [logo, setLogo] = useState();
  const [icon, setIcon] = useState();
  const [tenantForm, setTenantForm] = useState(defaultOptions);
  const modulesPermissions = modulesList.modulesList;
  const [modulesArray] = useState(modulesPermissions);
  const [iconId, setIconId] = useState();
  const [logoId, setLogoId] = useState();
  const [allCheck, setAllCheck] = useState(false);
  const [modulesUpdate, setModulesUpdate] = useState([]);
  const [iconLoading, setIconLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const onLoadIcon = async (event) => {
    setIconLoading(true);
    const target = event.target.files[0];
    setIcon(target);
    let iconId = target?.id || '';
    if (target && target?.lastModified) {
      iconId = await onUploadLogo(target);
    }
    setIconId(iconId);
    setIconLoading(false);
  };
  useEffect(() => {
    setTenantForm({
      name: selectedEditData.name,
      description: selectedEditData.description,
      modules: selectedEditData.modules?.split(',') || [],
      domain: selectedEditData.domain,
      use_logo: selectedEditData.use_logo,
      icon: selectedEditData.icon,
      logo: selectedEditData.logo,
      colors: selectedEditData.colors,
    });
    setValue('name', selectedEditData.name);
    setValue('domain', selectedEditData.domain);
    setModulesUpdate(selectedEditData.modules?.split(',') || []);
    if (
      selectedEditData.modules?.split(',').length === AllModulesList.length ||
      selectedEditData?.modules === '*'
    ) {
      setModulesUpdate([...AllModulesList]);
      setAllCheck(true);
    }
  }, [selectedEditData]);
  useEffect(() => {
    setAllCheck(modulesUpdate.length === AllModulesList.length);
  }, [modulesUpdate]);
  const handleImageState = () => {
    setLogo();
    setIcon();
  };
  const onLoadLogo = async (event) => {
    setLogoLoading(true);
    const target = event.target.files[0];
    setLogo(target);
    let logoId = target?.id || '';
    if (target && target?.lastModified) {
      logoId = await onUploadLogo(target);
    }
    setLogoId(logoId);
    setLogoLoading(false);
  };
  const onChangeColor = (value) => {
    const colorValue = {
      primaryColor: value?.secondaryColor,
      ...value,
      name: 'custom',
    };
    const colorAdd = {
      ...tenantForm,
      colors: colorValue,
    };
    setTenantForm(colorAdd);
  };
  const handleChangeSelectAllToggle = (e) => {
    if (e.target.checked) {
      setModulesUpdate([...AllModulesList]);
      setAllCheck(true);
    } else {
      setModulesUpdate([]);
      setAllCheck(false);
    }
  };
  const handleChangeModulesToggle = (e, item) => {
    const value = e.target.name;
    let list = [];
    if (value === 'resources') {
      list = modulesList.resources_Modules;
    } else if (value === 'settings') {
      list = modulesList.settings_Modules;
    } else if (value === 'Dashboards') {
      list = modulesList.dashboards_Modules;
    } else if (value === 'crm') {
      list = modulesList.crm_Modules;
    }
    if (e.target.checked) {
      setModulesUpdate((modulesUpdate) => [...modulesUpdate, value, ...list]);
    } else {
      const arr = modulesUpdate.filter(
        (item) => item !== value && !list?.includes(item)
      );

      setModulesUpdate(arr);
    }
  };
  const handleChangeModulesToggleChild = (e) => {
    const value = e.target.name;
    const parent = value.split('_')[0];
    if (e.target.checked) {
      if (parent === 'resources' && !modulesUpdate.includes(parent)) {
        setModulesUpdate((modulesUpdate) => [...modulesUpdate, value, parent]);
      } else if (
        parent === 'setting' &&
        !modulesUpdate.includes(parent + 's')
      ) {
        setModulesUpdate((modulesUpdate) => [
          ...modulesUpdate,
          value,
          parent + 's',
        ]);
      } else if (
        (value === 'deals' || value === 'contacts' || value === 'companies') &&
        !modulesUpdate.includes('crm')
      ) {
        setModulesUpdate((modulesUpdate) => [...modulesUpdate, value, 'crm']);
      } else if (
        parent === 'Dashboard' &&
        !modulesUpdate.includes(parent + 's')
      ) {
        setModulesUpdate((modulesUpdate) => [
          ...modulesUpdate,
          value,
          parent + 's',
        ]);
      } else {
        setModulesUpdate((modulesUpdate) => [...modulesUpdate, value]);
      }
    } else {
      let removeParent = modulesUpdate.filter((t) => t.includes(parent + '_'));
      if (value === 'deals' || value === 'contacts' || value === 'companies') {
        removeParent = modulesUpdate.filter(
          (item) =>
            item === 'deals' || item === 'contacts' || item === 'companies'
        );
      }
      if (removeParent.length === 1) {
        if (parent === 'resources') {
          const arr = modulesUpdate.filter(
            (item) => item !== value && item !== parent
          );
          setModulesUpdate(arr);
        } else if (parent === 'setting') {
          const arr = modulesUpdate.filter(
            (item) => item !== value && item !== parent + 's'
          );
          setModulesUpdate(arr);
        } else if (
          value === 'deals' ||
          value === 'contacts' ||
          value === 'companies'
        ) {
          const arr = modulesUpdate.filter(
            (item) => item !== value && item !== 'crm'
          );
          setModulesUpdate(arr);
        } else if (parent === 'Dashboard') {
          const arr = modulesUpdate.filter(
            (item) => item !== value && item !== parent + 's'
          );
          setModulesUpdate(arr);
        }
      } else {
        const arr = modulesUpdate.filter((item) => item !== value);
        setModulesUpdate(arr);
      }
    }
  };
  const onUploadLogo = async (file) => {
    const form = new FormData();
    form.append('file', await createBlobObject(file), file.name);
    const {
      data: {
        data: { id },
      },
    } = await userService.uploadAvatar(form);
    return id;
  };
  const handleChange = (e) => {
    const target = e.target;
    if (target.name !== 'email') {
      const tenantData = {
        ...tenantForm,
        [target.name]: target.value,
      };
      setTenantForm(tenantData);
    } else {
      const tenantData = {
        ...tenantForm,
        owner: {
          ...tenantForm?.owner,
          email: target.value,
        },
      };
      setTenantForm(tenantData);
    }
  };
  const getLogo = async (id) => {
    const response = await userService.getFile(id);
    return response?.data;
  };
  const getTenantImage = async () => {
    try {
      if (selectedEditData.logo) {
        const partnerLogo = await getLogo(selectedEditData.logo);

        if (partnerLogo) {
          setLogo({
            ...partnerLogo,
            name: partnerLogo.filename_download,
            size: partnerLogo.filesize,
          });
        }
      }

      if (selectedEditData.icon) {
        const partnerIcon = await getLogo(selectedEditData.icon);

        if (partnerIcon) {
          setIcon({
            ...partnerIcon,
            name: partnerIcon.filename_download,
            size: partnerIcon.filesize,
          });
        }
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  useEffect(() => {
    getTenantImage();
  }, [selectedEditData]);

  const handleAccessChange = (e) => {
    const target = e.target;
    if (target.name === 'use_logo' && target.checked) {
      const tenantData = {
        ...tenantForm,
        use_logo: true,
      };
      setTenantForm(tenantData);
    } else {
      const tenantData = {
        ...tenantForm,
        use_logo: false,
      };
      setTenantForm(tenantData);
    }
  };

  const handleFormSubmit = async () => {
    const modules = modulesUpdate.join(',');
    const tenantData = {
      ...tenantForm,
      modules: allCheck ? '*' : modules,
      type: 'owner',
      icon: iconId,
      logo: logoId,
    };
    if (selectedEditData.id) {
      const update = await handleUpdateTenant(tenantData);
      if (update) {
        setTenantForm({});
        reset(defaultOptions);
        handleImageState();
        setModulesUpdate([]);
        setAllCheck(false);
      }
    } else {
      const create = await handleCreateTenant(tenantData);
      if (create) {
        setTenantForm({});
        reset(defaultOptions);
        handleImageState();
        setModulesUpdate([]);
        setAllCheck(false);
      } else {
        return overflowing();
      }
    }
    setModulesUpdate([]);
    setAllCheck(false);
    overflowing();
    closeModal();

    if (!errors) {
      setTenantForm({});
    }
  };
  const closeModal = () => {
    overflowing();
    setShowModal(false);
    setSelectedEditData('');
    setTenantForm({
      name: '',
      domain: '',
      description: '',
      use_logo: false,
      modules: [],
      logo: '',
      icon: '',
      type: '',
      colors: '',
      email: '',
    });
    reset(defaultOptions);
    handleImageState();
    setModulesUpdate([]);
    setAllCheck(false);
  };
  return (
    <SimpleModal
      modalTitle={
        selectedEditData?.id
          ? constants.edit.title
          : constants.create.addTenantModalTitle
      }
      onHandleCloseModal={() => closeModal()}
      open={showModal}
      modalBodyClass="pipeline-board-edit-form overflow-y-auto"
      buttonLabel={
        selectedEditData?.id
          ? constants.edit.btnEditTenant
          : constants.create.btnAddTenant
      }
      buttonsDisabled={!tenantForm?.name}
      handleSubmit={handleSubmit(handleFormSubmit)}
      allowCloseOutside={false}
      isLoading={showLoading}
      customModal="modal-dialog-custom"
    >
      <span className="font-size-sm">{constants.create.textGroupName}</span>
      <Row>
        <Col className="border-right">
          <div>
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">
                Name <Asterick />
              </h5>
            </Label>
            <InputValidation
              name="name"
              type="input"
              placeholder="Tenant Name"
              value={tenantForm?.name}
              validationConfig={{
                required: true,
                inline: false,
                onChange: handleChange,
              }}
              errors={errors}
              register={register}
              errorDisplay="mb-0"
            />
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">
                Domain <Asterick />
              </h5>
            </Label>
            <InputValidation
              name="domain"
              type="input"
              placeholder="Tenant Domain"
              value={tenantForm?.domain}
              validationConfig={{
                required: true,
                inline: false,
                onChange: handleChange,
              }}
              errors={errors}
              register={register}
              errorDisplay="mb-0"
            />
            <div className="card mb-3 mt-4">
              <div className="card-header">
                <h4 className="card-title">
                  Modules <Asterick />
                </h4>
              </div>
              <Row className="switch-setting-main align-items-center mx-0 card-body">
                <Col md={6}>
                  <Row>
                    <Col md={8} className="pl-0">
                      <h6>Select All</h6>
                    </Col>

                    <Col md={4}>
                      <div className="d-flex align-items-center">
                        <div className="d-flex align-items-center pt-0 pb-2">
                          <FormCheck
                            id="selectAll"
                            name="selectAll"
                            type="switch"
                            custom={true}
                            checked={allCheck}
                            onChange={(e) => handleChangeSelectAllToggle(e)}
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="switch-setting-main align-items-center mx-0 card-body">
                {modulesArray.map((item, i) => (
                  <>
                    <Col
                      md={6}
                      key={`parent_${i}`}
                      className={
                        `${item.label}` === 'Insights'
                          ? 'col-md-12 '
                          : 'col-md-6 '
                      }
                    >
                      <Row
                        className={`${item.label}` === 'Insights' ? 'w-50' : ''}
                      >
                        <Col md={8} className="pl-0">
                          <h6>{item.label}</h6>
                        </Col>

                        <Col md={4}>
                          <div className="d-flex align-items-center">
                            <div className="d-flex align-items-center pt-0 pb-2">
                              <FormCheck
                                className={
                                  `${item.label}` === 'Insights'
                                    ? 'ml-2'
                                    : 'ml-0'
                                }
                                id={item.name}
                                name={item.name}
                                type="switch"
                                custom={true}
                                checked={modulesUpdate?.includes(item.name)}
                                onChange={(e) =>
                                  handleChangeModulesToggle(e, item)
                                }
                              />
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    {item?.group?.map((child, j) => (
                      <Col md={6} className="ml-3" key={`groupChild_${j}`}>
                        <Row>
                          <Col md={8} className="pl-0">
                            <h6>{child.label}</h6>
                          </Col>

                          <Col md={4}>
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center pt-0 pb-2">
                                <FormCheck
                                  id={child.name}
                                  name={child.name}
                                  type="switch"
                                  custom={true}
                                  checked={modulesUpdate?.includes(child.name)}
                                  onChange={(e) =>
                                    handleChangeModulesToggleChild(e)
                                  }
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                  </>
                ))}
              </Row>
            </div>
          </div>
          <div className="card mb-3 mt-4">
            <div className="card-header">
              <h4 className="card-title">{BRANDING_LABEL}</h4>
            </div>
            <div className="card-body">
              <div className="border-bottom border-gray-300 pb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <h5>Icon</h5>
                  {iconLoading ? (
                    <Spinner />
                  ) : (
                    <DragDropUploadFile
                      file={icon}
                      setFile={setIcon}
                      onLoadFile={onLoadIcon}
                      preview
                      logoId={iconId || tenantForm?.icon}
                      chooseFileText={CHOOSE_IMAGE_FILE}
                      name="brandingIcon"
                      containerHeight={60}
                      emptyContainerHeight={80}
                      errors={errors}
                      validationConfig={{
                        required: true,
                        inline: false,
                      }}
                    />
                  )}
                </div>
                <div className="d-flex align-items-center mt-4 justify-content-between">
                  <h5>
                    Logo <Asterick />
                    <IdfTooltip text="A partner logo can be 280px wide and 80px tall. Please remove all extra white spaces around the logo before uploading.">
                      <IdfIcon icon="help_outline" />
                    </IdfTooltip>
                  </h5>
                  {logoLoading ? (
                    <Spinner />
                  ) : (
                    <DragDropUploadFile
                      file={logo}
                      setFile={setLogo}
                      onLoadFile={onLoadLogo}
                      name="brandingLogo"
                      preview
                      logoId={logoId || tenantForm?.logo}
                      chooseFileText={CHOOSE_IMAGE_FILE}
                      containerHeight={85}
                      emptyContainerHeight={80}
                      errors={errors}
                      validationConfig={{
                        required: true,
                        inline: false,
                      }}
                      register={register}
                      errorDisplay="mb-0"
                    />
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center mt-4 justify-content-between">
                <h5>
                  Use Logo Instead of Icon <Asterick />
                </h5>
                <FormCheck
                  id="useLogoInsteadOfIcon"
                  type="switch"
                  custom={true}
                  name="use_logo"
                  value={tenantForm?.use_logo}
                  checked={tenantForm?.use_logo}
                  onChange={handleAccessChange}
                />
              </div>
              <div className="d-flex align-items-center mt-4 justify-content-between">
                <h5>
                  Accent Color <Asterick />
                  <IdfTooltip text="An accent color will be applied to all links, buttons.">
                    <IdfIcon icon="help_outline" />
                  </IdfTooltip>
                </h5>
                {tenantForm?.colors?.secondaryColor ? (
                  <FormColor
                    name="secondaryColor"
                    value={tenantForm?.colors?.secondaryColor}
                    onChange={onChangeColor}
                  />
                ) : (
                  <>
                    <FormColor
                      name="secondaryColor"
                      value={tenantForm?.colors?.secondaryColor}
                      onChange={onChangeColor}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          {selectedEditData === '' && (
            <div className="card mb-3 mt-4">
              <div className="card-header">
                <h4 className="card-title">Tenant Owner</h4>
              </div>
              <div className="card-body">
                <Label htmlFor="" className="form-label col-form-label">
                  <h5 className="mb-0">
                    Owner Email <Asterick />
                  </h5>
                </Label>
                <InputValidation
                  name="email"
                  type="input"
                  placeholder="Tenant Owner Email Address"
                  value={tenantForm.email}
                  validationConfig={{
                    required: true,
                    inline: false,
                    onChange: handleChange,
                  }}
                  errors={errors}
                  register={register}
                  errorDisplay="mb-0"
                />
              </div>
            </div>
          )}
          <Label htmlFor="" className="form-label col-form-label">
            <h5 className="mb-0">Tenant Description</h5>
          </Label>
          <InputValidation
            name="description"
            type="textarea"
            placeholder="Tenant Description"
            value={tenantForm?.description}
            validationConfig={{
              required: false,
              onChange: handleChange,
              maxLength: {
                value: 255,
                message: 'Description cannot exceed 255 characters.',
              },
            }}
            errors={errors}
            register={register}
            classNames="min-h-120"
          />
        </Col>
      </Row>
    </SimpleModal>
  );
};

export default CreateTenantModal;
