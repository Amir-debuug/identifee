import React, { useEffect, useState } from 'react';
import MaterialIcon from '../components/commons/MaterialIcon';
import { Card, CardBody, CardFooter, CardHeader, Col, Row } from 'reactstrap';
import ButtonIcon from '../components/commons/ButtonIcon';
import MoreActions from '../components/MoreActions';
import TooltipComponent from '../components/lesson/Tooltip';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import SimpleModalCreation from '../components/modal/SimpleModalCreation';
import { Form, FormCheck } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Asterick from '../components/commons/Asterick';
import InputValidation from '../components/commons/InputValidation';
import DropdownSelect from '../components/DropdownSelect';
import fieldService from '../services/field.service';
import { iconByTypeField } from '../components/peoples/constantsPeople';
import DeleteConfirmationModal from '../components/modal/DeleteConfirmationModal';
import { useProfileContext } from '../contexts/profileContext';
import Alert from '../components/Alert/Alert';
import AlertWrapper from '../components/Alert/AlertWrapper';
import Skeleton from 'react-loading-skeleton';
import NoDataFound from '../components/commons/NoDataFound';
import { useTenantContext } from '../contexts/TenantContext';
import { capitalize, groupBy } from 'lodash';
import { overflowing } from '../utils/Utils';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';

const NoDataFoundTitle = ({ str }) => {
  return <div className="fs-6 text-gray-search">{str}</div>;
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const ModalTitleWithSection = ({ title, section }) => {
  return (
    <div className="d-flex align-items-center">
      <span>{title}</span>
      <span
        className="ml-2 m-0 fs-7 badge-pill font-weight-medium tag-item"
        color="soft-secondary"
      >
        {section}
      </span>
    </div>
  );
};

const FieldSkeletonLoader = ({ circle = true, rows }) => {
  const [rowCount] = useState(Array(rows).fill(0));
  const Circle = ({ children }) => {
    return <div style={{ height: 20, width: 20 }}>{children}</div>;
  };
  return (
    <>
      {rowCount.map((r, idx) => (
        <div key={idx} className="d-flex col py-2 my-2 px-0 align-items-center">
          {circle && (
            <Circle>
              <Skeleton
                circle
                style={{ borderRadius: '50%', lineHeight: 1.3 }}
              />
            </Circle>
          )}
          <div className={`w-100 ${circle ? 'ml-2' : 'ml-0'}`}>
            <Skeleton height="20" />
          </div>
        </div>
      ))}
    </>
  );
};

const Messages = {
  Field: 'Field is created.',
  FieldUpdated: 'Field is updated.',
  FieldRemoved: 'Field is removed.',
  FieldError: 'Error creating field. Please check console for details.',
  FieldDefaultError:
    'Error creating default fields for $$type$$. Please check console for details.',
  FieldMoved: 'Field moved to default list.',
  FieldUnused: 'Field marked as unused.',
  FieldUpdateError: 'Error updating field. Please check console for details.',
  FieldLoadError:
    'Error getting fields for $$type$$. Please check console for details.',
  FieldQuickCreatePref: 'Fields are saved. They will be available in modal.',
  FieldQuickCreatePrefError:
    'Error creating quick preference fields. Please check console for errors.',
};

const FIELD_NEW_KEY = 'FieldNew';

const FieldTypeEnum = {
  organization: 'organization',
  contact: 'contact',
  deal: 'deal',
  product: 'product',
  task: 'task',
  call: 'call',
  event: 'event',
};

const Actions = {
  Add: 'ADD',
  Edit: 'EDIT',
  Update: 'UPDATE',
  Save: 'SAVE',
  Remove: 'REMOVE',
  Delete: 'DELETE',
  Clone: 'CLONE',
  Default: 'DEFAULT',
  Move: 'MOVE',
};

// making it static, for now, will load dynamic when integrating with APIs
const SECTIONS_WITH_FIELDS = [
  {
    name: 'Deals',
    isDraggable: false,
    type: FieldTypeEnum.deal,
    fields: [],
  },
  {
    name: 'Contacts',
    isDraggable: false,
    type: FieldTypeEnum.contact,
    fields: [],
  },
  {
    name: 'Companies',
    isDraggable: false,
    type: FieldTypeEnum.organization,
    fields: [],
  },
  {
    name: 'Products',
    isDraggable: false,
    type: FieldTypeEnum.product,
    fields: [],
  },
  {
    name: 'Tasks',
    isDraggable: false,
    type: FieldTypeEnum.task,
    fields: [],
  },
  {
    name: 'Calls',
    isDraggable: false,
    type: FieldTypeEnum.call,
    fields: [],
  },
  {
    name: 'Events',
    isDraggable: false,
    type: FieldTypeEnum.event,
    fields: [],
  },
];

const UnusedFieldsModal = ({
  parentFields,
  setParentFields,
  groupBySection,
  setErrorMessage,
  setSuccessMessage,
  fieldSection,
  openModal,
  setOpenModal,
}) => {
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState([]);

  const loadFields = async () => {
    setLoader(true);
    try {
      const { data } = await fieldService.getFields(fieldSection.type, {
        usedField: false,
      });
      setFields(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoader(false);
    }
  };

  const updateFieldsLoading = (field, isLoading) => {
    setFields([
      ...fields.map((f) => (f.id === field.id ? { ...f, isLoading } : f)),
    ]);
  };

  const handleMoveToDefaultField = async (field) => {
    updateFieldsLoading(field, true);
    try {
      const updatingField = {
        ...field,
        usedField: !field.usedField,
      };
      const data = await fieldService.updateField(field.id, updatingField);

      const updatedFields = [
        ...fields
          .map((f) => (f.id === field.id ? { ...data, isLoading: false } : f))
          .filter((f) => f.id !== field.id),
      ];
      setFields(updatedFields);
      const newFields = [...parentFields, updatingField];
      setParentFields(newFields);
      groupBySection(newFields);
      setSuccessMessage(
        updatingField.usedField ? Messages.FieldMoved : Messages.FieldUnused
      );
    } catch (err) {
      setErrorMessage(Messages.FieldUpdateError);
      console.log(err);
    }
    setOpenModal(false);
  };

  useEffect(() => {
    loadFields();
  }, []);

  return (
    <SimpleModalCreation
      modalTitle={
        <ModalTitleWithSection
          title="Unused Fields"
          section={fieldSection.name}
        />
      }
      open={openModal}
      bankTeam={false}
      isLoading={false}
      bodyClassName={`overflow-y-auto ${
        fields.length > 0 ? 'pipeline-board-edit-form' : ''
      }`}
      onHandleCloseModal={() => {
        overflowing();
        setOpenModal(!openModal);
      }}
    >
      <p>
        Unused Fields lists a set of fields that you may need for your business
        requirements in addition to the Default fields.
      </p>

      {loader ? (
        <div className="my-1 px-3">
          <FieldSkeletonLoader rows={5} />
        </div>
      ) : (
        <>
          {fields.length > 0 ? (
            <table className="table table-align-middle w-100">
              <thead className="thead-light">
                <th>Field Name</th>
                <th>Type</th>
                <th></th>
              </thead>
              <tbody>
                {fields
                  ?.filter((f) => !f.usedField)
                  ?.map((field, index) => (
                    <tr key={index}>
                      <td>{field.key}</td>
                      <td>{field.field_type}</td>
                      <td className="text-right">
                        <ButtonIcon
                          classnames="btn-sm font-weight-medium"
                          color="outline-primary"
                          label={
                            field.usedField
                              ? 'Mark as Unused Field'
                              : 'Move to Default Fields'
                          }
                          onclick={(e) => {
                            e.stopPropagation();
                            handleMoveToDefaultField(field);
                          }}
                          loading={field.isLoading}
                          type="button"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <NoDataFound
              icon="edit_note"
              containerStyle="text-gray-search my-6 py-6"
              title={
                <NoDataFoundTitle
                  str={`No unused ${fieldSection.name.toLowerCase()} fields found.`}
                />
              }
            />
          )}
        </>
      )}
    </SimpleModalCreation>
  );
};

const QuickCreatePreferenceModal = ({
  fieldSection,
  openModal,
  setOpenModal,
  setSuccessMessage,
  setErrorMessage,
}) => {
  const [loader, setLoader] = useState(false);
  const [loaderQuickPref, setLoaderQuickPref] = useState(false);
  const [fields, setFields] = useState([]);

  const sortByPreferred = (a, b) => b.preferred - a.preferred;

  const onHandleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      [...fields],
      result.source.index,
      result.destination.index
    );
    setFields(items);
  };

  const loadFields = async () => {
    setLoader(true);
    try {
      const { data } = await fieldService.getFields(fieldSection.type);
      setFields(data.sort(sortByPreferred));
    } catch (err) {
      console.log(err);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const SavePreferenceButton = () => {
    return (
      <div className="d-flex align-items-center">
        <span>Save Preference</span>
      </div>
    );
  };

  const handleSavePreference = async () => {
    setLoaderQuickPref(true);
    try {
      await fieldService.createQuickPrefFields(
        fieldSection.type,
        fields.filter((f) => f.preferred).map((f) => f.id)
      );
      setSuccessMessage(Messages.FieldQuickCreatePref);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.FieldQuickCreatePrefError);
    } finally {
      setLoaderQuickPref(false);
    }
    setOpenModal(false);
  };

  const updateFields = (currentField) => {
    const updatedFields = [...fields].map((fs) =>
      fs.id === currentField.id ? { ...currentField } : { ...fs }
    );
    setFields(updatedFields.sort(sortByPreferred));
  };

  return (
    <SimpleModalCreation
      modalTitle={
        <ModalTitleWithSection
          title="Quick Create Fields"
          section={fieldSection.name}
        />
      }
      handleSubmit={fields.length > 0 && handleSavePreference}
      saveButtonStyle="btn btn-primary btn-sm"
      saveButton={<SavePreferenceButton />}
      open={openModal}
      bankTeam={false}
      isLoading={loaderQuickPref}
      bodyClassName={`overflow-y-auto ${
        fields.length > 0 ? 'pipeline-board-edit-form' : ''
      }`}
      onHandleCloseModal={() => {
        overflowing();
        setOpenModal(!openModal);
      }}
    >
      <p>
        Choose the fields that needs to be shown in the Quick Create popup when
        you try to create a new {fieldSection.type} from a lookup field.
      </p>

      {loader ? (
        <div className="my-1 px-3">
          <FieldSkeletonLoader rows={5} />
        </div>
      ) : (
        <>
          {fields.length > 0 ? (
            <DragDropContext onDragEnd={onHandleDragEnd}>
              <Droppable droppableId={`${fieldSection.name}Fields`}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <TransitionGroup appear={true}>
                      {fields?.map((field, index) => (
                        <Collapse key={field.id}>
                          <FieldItem
                            fieldSection={{
                              ...fieldSection,
                              isDraggable: false,
                            }}
                            withCheckBoxes={true}
                            field={field}
                            index={index}
                            key={index}
                            updateFields={updateFields}
                          />
                        </Collapse>
                      ))}
                      {provided.placeholder}
                    </TransitionGroup>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <NoDataFound
              icon="edit_note"
              containerStyle="text-gray-search my-6 py-6"
              title={
                <NoDataFoundTitle
                  str={`No ${fieldSection.name.toLowerCase()} fields found.`}
                />
              }
            />
          )}
        </>
      )}
    </SimpleModalCreation>
  );
};

const AddEditFieldModal = ({
  field,
  openModal,
  setOpenModal,
  handleConfirmModal,
  mode = 'add',
  section,
  loader,
  options,
  setOptions,
}) => {
  const defaultFieldObject = {
    key: '',
    field_type: '',
    value_type: '',
    mandatory: false,
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFieldObject,
  });

  const [editedField, setEditedField] = useState({ ...field });

  useEffect(() => {
    setEditedField(field);
    setValue('name', field?.key);
  }, [field]);

  const handleValueChange = (e) => {
    const { value } = e.target;
    setEditedField({ ...editedField, key: value });
    setValue('name', value);
  };

  const handleSave = () => {
    handleConfirmModal(editedField);
    reset(defaultFieldObject);
  };

  return (
    <SimpleModalCreation
      modalTitle={
        <ModalTitleWithSection
          title={mode === Actions.Edit ? 'Edit Field' : 'Create Custom Field'}
          section={section}
        />
      }
      open={openModal}
      bankTeam={false}
      isLoading={loader}
      handleSubmit={handleSubmit((d) => handleSave(d))}
      onHandleCloseModal={() => {
        overflowing();
        reset(defaultFieldObject);
        setOpenModal(!openModal);
      }}
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <Row className="align-items-center pb-3">
          <Col md={3}>
            <h5 className="mb-0">
              Field Label <Asterick />{' '}
            </h5>
          </Col>
          <Col md={9}>
            <InputValidation
              name="name"
              type="input"
              placeholder="Field Label"
              disabled={field.mandatory}
              value={editedField?.key || ''}
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: handleValueChange,
              }}
              errors={errors}
              register={register}
            />
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col md={3}>
            <h5 className="mb-0">Field Type</h5>
          </Col>
          <Col md={9}>
            <DropdownSelect
              data={options}
              onHandleSelect={(item) =>
                setEditedField({
                  ...editedField,
                  field_type: item.field_type,
                  value_type: item.value_type,
                })
              }
              select={editedField?.field_type}
              typeMenu="custom"
              placeholder="Field Type"
              customClasses={'w-100 overflow-y-auto max-h-300'}
              disabled={field.mandatory}
            />
          </Col>
        </Row>

        <Row className="align-items-center mt-2">
          <Col md={3}>
            <h5 className="mb-0">Mandatory</h5>
          </Col>
          <Col md={9}>
            <FormCheck
              id="fieldMandatory"
              type="switch"
              className="form-control border-0"
              custom={true}
              name="fieldMandatory"
              checked={editedField?.mandatory}
              onChange={(e) =>
                setEditedField({ ...editedField, mandatory: e.target.checked })
              }
            />
          </Col>
        </Row>
      </Form>
    </SimpleModalCreation>
  );
};

const FieldSectionFooter = ({
  fields,
  fieldSection,
  isEditingMode,
  onHandleAdd,
  updateFieldSections,
}) => {
  const [customFields, setCustomFields] = useState({ used: 0, total: 0 });

  useEffect(() => {
    if (fields.length) {
      setCustomFields({
        used: fields.filter((f) => f.isCustom && f.usedField).length,
        total: fields.filter((f) => f.isCustom).length || 0,
      });
    }
  }, [fields]);

  return (
    <>
      {fieldSection.isDraggable ? (
        <>
          <button
            type="button"
            className={`btn btn-primary btn-sm`}
            onClick={() => {
              updateFieldSections(Actions.Update, {
                ...fieldSection,
                isDraggable: false,
              });
            }}
          >
            Save
          </button>
          <button
            className="btn btn-white btn-sm ml-2"
            onClick={() => {
              updateFieldSections(Actions.Update, {
                ...fieldSection,
                isDraggable: false,
              });
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <div className="d-flex justify-content-between align-items-center">
          <ButtonIcon
            color="link"
            icon="add"
            disabled={isEditingMode === true}
            onclick={() => onHandleAdd(Actions.Add, fieldSection)}
            label="Custom Field"
            classnames="border-0 px-0 text-primary"
          />
          <div className="d-flex fs-7 text-gray-dark align-items-center">
            <div>
              {' '}
              <span className="green-dot"></span> Used Custom Fields:{' '}
            </div>
            <div className="font-weight-semi-bold ml-1">
              {customFields.used}/{customFields.total}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FieldSectionHeader = ({
  fields,
  rearrange,
  onRearrange,
  handleQuickCreatePreference,
  handleUnusedFields,
}) => {
  const actionItems = [
    {
      id: 'edit',
      icon: 'category',
      name: 'Rearrange Fields',
      className: 'd-none',
    },
    {
      id: 'remove',
      icon: 'highlight_alt',
      name: 'Unused Fields',
    },
    {
      id: 'add',
      icon: 'settings',
      name: 'Quick Create Preference',
    },
  ];

  const onHandleRemove = () => {
    handleUnusedFields();
  };

  const onHandleEdit = () => {
    onRearrange(!rearrange);
  };

  const onHandleAdd = () => {
    handleQuickCreatePreference();
  };

  return (
    <div className="d-flex align-items-center action-items">
      <a className={`icon-hover-bg cursor-pointer`}>
        <MoreActions
          icon="more_vert"
          items={actionItems}
          onHandleRemove={() => onHandleRemove(null)}
          onHandleEdit={() => onHandleEdit(null)}
          onHandleAdd={() => onHandleAdd(null)}
          toggleClassName="w-auto p-0 h-auto"
          menuWidth={220}
        />
      </a>
    </div>
  );
};

const FieldItem = ({
  fieldSection,
  field,
  index,
  onHandleEdit,
  onHandleRemove,
  onHandleMove,
  withCheckBoxes,
  updateFields,
}) => {
  let actionItems = [
    {
      id: 'edit',
      icon: 'open_with',
      name: 'Move',
    },
  ];

  if (field.isCustom) {
    actionItems = [
      {
        id: 'remove',
        icon: 'delete',
        name: 'Delete',
      },
      {
        id: 'edit',
        icon: 'open_with',
        name: 'Move',
      },
    ];
  }

  const JustTheField = () => {
    return (
      <>
        {withCheckBoxes && (
          <Form.Check
            inline
            label=""
            name="preferred"
            className="fs-7 ml-2 mr-1"
            type="checkbox"
            checked={field.preferred || field.isFixed}
            onChange={(e) => {
              if (field.isFixed) {
                return;
              }
              updateFields({
                ...field,
                preferred: e.target.checked,
              });
            }}
          />
        )}
        <div
          className={`ml-1 d-flex align-items-center flex-grow-1 w-100 px-2 ${
            withCheckBoxes || field.isFixed ? 'py-2' : 'py-1'
          } bg-white my-2 rounded ${
            field?.mandatory
              ? 'border-left-4 border-left-danger border-top border-right border-bottom'
              : 'border'
          }`}
        >
          <div className="flex-grow-1">
            <p className={`fs-7 mb-0`}>
              {field.key}{' '}
              {field.isCustom && <span className="green-dot"></span>}
            </p>
          </div>
          {withCheckBoxes ? (
            <></>
          ) : (
            <>
              {field.isFixed ? (
                ''
              ) : (
                <div className={`d-flex align-items-center refresh-icon`}>
                  <TooltipComponent title="Edit field">
                    <a
                      onClick={() => onHandleEdit(field, fieldSection)}
                      className={`icon-hover-bg mr-1 cursor-pointer`}
                    >
                      <MaterialIcon
                        icon="edit"
                        clazz="text-gray-700 font-size-lg"
                      />{' '}
                    </a>
                  </TooltipComponent>
                  <a className={`icon-hover-bg cursor-pointer`}>
                    <MoreActions
                      icon="more_vert"
                      items={actionItems}
                      onHandleRemove={() => onHandleRemove(field, fieldSection)}
                      onHandleEdit={() => onHandleMove(field, fieldSection)}
                      toggleClassName="w-auto p-0 h-auto"
                    />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  };
  return (
    <>
      {fieldSection.isDraggable ? (
        <Draggable
          key={field.id}
          draggableId={`id-block-${index}`}
          index={index}
        >
          {(provided, snapshot) => (
            <div
              key={index}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`d-flex pl-2 pr-3 setting-item inactive bg-hover-gray align-items-center ${
                snapshot.isDragging ? 'shadow-lg' : ''
              }}`}
            >
              <MaterialIcon icon="drag_indicator" clazz="text-gray-600" />
              <JustTheField />
            </div>
          )}
        </Draggable>
      ) : (
        <div
          className={`d-flex px-2 setting-item bg-hover-gray align-items-center`}
        >
          <JustTheField />
        </div>
      )}
    </>
  );
};

const FieldInformationSection = ({
  fieldSection,
  onHandleDragEnd,
  onHandleEdit,
  onHandleRemove,
  onHandleMove,
}) => {
  return (
    <>
      <h5 className="pt-2 pb-0 px-3 mb-0">{fieldSection.name}</h5>
      <>
        {fieldSection.fields.length > 0 ? (
          <DragDropContext onDragEnd={onHandleDragEnd}>
            <Droppable droppableId={`${fieldSection.name}Fields`}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <TransitionGroup appear={true}>
                    {fieldSection.fields?.map((field, index) => (
                      <Collapse key={field.id}>
                        <FieldItem
                          fieldSection={fieldSection}
                          field={field}
                          index={index}
                          key={index}
                          onHandleEdit={onHandleEdit}
                          onHandleRemove={onHandleRemove}
                          onHandleMove={onHandleMove}
                        />
                      </Collapse>
                    ))}
                    {provided.placeholder}
                  </TransitionGroup>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <NoDataFound
            icon="edit_note"
            containerStyle="text-gray-search my-6 py-6"
            title={<NoDataFoundTitle str={`No fields found.`} />}
          />
        )}
      </>
    </>
  );
};

const FieldSection = ({
  fieldSection,
  updateFieldSections,
  setSuccessMessage,
  setErrorMessage,
  options,
  setOptions,
}) => {
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldsBySection, setFieldsBySection] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openMoveModal, setOpenMoveModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedField, setSelectedField] = useState({});
  const [mode, setMode] = useState('add');
  const [componentsToDelete, setComponentsToDelete] = useState([]);
  const [loaderField, setLoaderField] = useState(false);
  const { profileInfo } = useProfileContext();
  const { tenant } = useTenantContext();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [openQuickCreatePreferenceModal, setOpenQuickCreatePreferenceModal] =
    useState(false);
  const [openUnusedFieldsModal, setOpenUnusedFieldsModal] = useState(false);

  const groupBySection = (fieldsList) => {
    setFieldsBySection(groupBy(fieldsList, 'section'));
  };

  const loadFields = async () => {
    setLoader(true);
    try {
      const { data } = await fieldService.getFields(fieldSection.type, {
        usedField: true,
        isCustom: true,
      });
      // if there are no fields then create default
      if (!data.length) {
        try {
          if (tenant?.id !== 'root') {
            const defaultFields = await fieldService.createDefaultFields(
              fieldSection.type
            );
            // only show usedField: true when default fields are created for the first time.
            const usedFieldsList = defaultFields.filter((f) => f.usedField);
            setFields(usedFieldsList);
            groupBySection(usedFieldsList);
          }
        } catch (e) {
          console.log(e);
          setErrorMessage(
            Messages.FieldDefaultError.replace(
              '$$type$$',
              capitalize(fieldSection.type)
            )
          );
        } finally {
          setLoader(false);
        }
      } else {
        setFields(data);
        groupBySection(data);
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(
        Messages.FieldLoadError.replace(
          '$$type$$',
          capitalize(fieldSection.type)
        )
      );
    } finally {
      setLoader(false);
    }
  };

  const onHandleMove = (field) => {
    setMode(Actions.Move);
    setIsEditingMode(false);
    setSelectedField(field);
    setComponentsToDelete([{ ...field, title: field.key }]);
    setOpenMoveModal(true);
  };

  const onHandleRemove = (field) => {
    setMode(Actions.Remove);
    setIsEditingMode(false);
    setSelectedField(field);
    setComponentsToDelete([{ ...field, title: field.key }]);
    setOpenDeleteModal(true);
  };

  const onHandleEdit = (field) => {
    setIsEditingMode(false);
    setSelectedField({ ...field, type: fieldSection.type });
    setMode(Actions.Edit);
    setOpenEditModal(true);
  };

  const onHandleAdd = () => {
    setIsEditingMode(false);
    setSelectedField({
      field_type: 'TEXT',
      value_type: 'string',
      id: FIELD_NEW_KEY,
      columnName: '',
      type: fieldSection.type,
    });
    setMode(Actions.Add);
    setOpenEditModal(true);
  };

  const onHandleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      [...fields],
      result.source.index,
      result.destination.index
    );
    setFields(items);
    groupBySection(items);
  };

  const handleConfirmDeleteField = async () => {
    try {
      await fieldService.deleteField(selectedField.id);
      setSuccessMessage(Messages.FieldRemoved);
      setOpenDeleteModal(false);
      const updatedFields = [...fields].filter(
        (s) => s.id !== selectedField.id
      );
      setFields(updatedFields);
      groupBySection(updatedFields);
      setComponentsToDelete([]);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.FieldUpdateError);
    }
  };

  const handleConfirmMoveField = async () => {
    try {
      const updatingField = {
        ...selectedField,
        usedField: false, // moving to unused not deleting it
      };
      await fieldService.updateField(selectedField.id, updatingField);
      setSuccessMessage(Messages.FieldUnused);
      setOpenMoveModal(false);
      const updatedFields = [...fields].filter(
        (s) => s.id !== selectedField.id
      );
      setFields(updatedFields);
      groupBySection(updatedFields);
      setComponentsToDelete([]);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.FieldUpdateError);
    }
  };

  const updateAndCloseModal = (updatedFields) => {
    setFields(updatedFields);
    groupBySection(updatedFields);
    setIsEditingMode(false);
    setOpenEditModal(false);
  };

  const handleConfirmUpdateField = async (updatedField) => {
    setLoaderField(true);
    let updatedFields = [];
    if (updatedField.id === FIELD_NEW_KEY) {
      // create field in api
      delete updatedField.id;
      try {
        const data = await fieldService.createField({
          ...updatedField,
          isCustom: true,
          usedField: true,
          created_by: profileInfo.id,
          section: 'Additional Information', // wow API guys
        });
        updatedFields = [...fields, data];
        updateAndCloseModal(updatedFields);
        setSuccessMessage(Messages.Field);
      } catch (err) {
        console.log(err);
        setErrorMessage(Messages.FieldError);
      } finally {
        setLoaderField(false);
      }
    } else {
      try {
        const data = await fieldService.updateField(updatedField.id, {
          ...updatedField,
          created_by: profileInfo.id,
        });
        updatedFields = [
          ...fields.map((f) => (f.id === updatedField.id ? { ...data } : f)),
        ];
        setSuccessMessage(Messages.FieldUpdated);
        updateAndCloseModal(updatedFields);
      } catch (err) {
        console.log(err);
        setErrorMessage(Messages.FieldError);
      } finally {
        setLoaderField(false);
      }
    }
  };

  useEffect(() => {
    loadFields();
  }, [tenant]);

  const DeleteFieldBody = ({ text }) => {
    return (
      <div>
        <div className="d-flex justify-content-center align-items-center">
          <MaterialIcon icon="report_problem" clazz="font-size-4em" />
        </div>
        <hr />
        <h4>{text}</h4>
        <ul className="list-disc">
          {componentsToDelete.map((item) => (
            <li className="font-weight-medium ml-4" key={item?.id}>
              <p className="mb-1">{item?.title}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <DeleteConfirmationModal
        showModal={openDeleteModal}
        setShowModal={setOpenDeleteModal}
        setSelectedCategories={setComponentsToDelete}
        event={handleConfirmDeleteField}
        itemsConfirmation={componentsToDelete}
        itemsReport={[]}
        customBody={
          <DeleteFieldBody text="Are you sure you want delete following custom field?" />
        }
      />
      <DeleteConfirmationModal
        showModal={openMoveModal}
        setShowModal={setOpenMoveModal}
        setSelectedCategories={setComponentsToDelete}
        event={handleConfirmMoveField}
        itemsConfirmation={componentsToDelete}
        itemsReport={[]}
        customBody={
          <DeleteFieldBody text="Are you sure you want to move following field to unused list?" />
        }
        positiveBtnText="Yes, Move"
      />
      {openEditModal && (
        <AddEditFieldModal
          openModal={openEditModal}
          setOpenModal={setOpenEditModal}
          mode={mode}
          field={selectedField}
          section={fieldSection.name}
          loader={loaderField}
          handleConfirmModal={handleConfirmUpdateField}
          options={options}
          setOptions={setOptions}
        />
      )}
      {openQuickCreatePreferenceModal && (
        <QuickCreatePreferenceModal
          openModal={openQuickCreatePreferenceModal}
          setOpenModal={setOpenQuickCreatePreferenceModal}
          fieldSection={fieldSection}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      {openUnusedFieldsModal && (
        <UnusedFieldsModal
          parentFields={fields}
          setParentFields={setFields}
          groupBySection={groupBySection}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
          openModal={openUnusedFieldsModal}
          setOpenModal={setOpenUnusedFieldsModal}
          fieldSection={fieldSection}
        />
      )}
      <Card className="h-100 hover-actions">
        <CardHeader className="px-3">
          <div className="d-flex align-items-center w-100 justify-content-between">
            <div>
              <h4 className="mb-0">{fieldSection.name}</h4>
            </div>
            <FieldSectionHeader
              fields={fields}
              type={fieldSection.name}
              rearrange={fieldSection.isDraggable}
              onRearrange={(isDraggable) => {
                updateFieldSections(Actions.Update, {
                  ...fieldSection,
                  isDraggable,
                });
              }}
              handleQuickCreatePreference={() => {
                setOpenQuickCreatePreferenceModal(true);
              }}
              handleUnusedFields={() => {
                setOpenUnusedFieldsModal(true);
              }}
            />
          </div>
        </CardHeader>
        <CardBody className="py-2 px-0 overflow-y-auto">
          <>
            {loader ? (
              <div className="my-1 px-3">
                <FieldSkeletonLoader rows={5} />
              </div>
            ) : (
              <>
                {Object.keys(fieldsBySection).map((key, index) => {
                  return (
                    <FieldInformationSection
                      key={index}
                      fieldSection={{ name: key, fields: fieldsBySection[key] }}
                      onHandleRemove={onHandleRemove}
                      onHandleEdit={onHandleEdit}
                      onHandleMove={onHandleMove}
                      onHandleDragEnd={onHandleDragEnd}
                    />
                  );
                })}
              </>
            )}
          </>
        </CardBody>
        <CardFooter className="px-3 py-2">
          <FieldSectionFooter
            fields={fields}
            fieldSection={fieldSection}
            isEditingMode={isEditingMode}
            onHandleAdd={onHandleAdd}
            updateFieldSections={updateFieldSections}
          />
        </CardFooter>
      </Card>
    </>
  );
};

const Fields = () => {
  const [fieldSections, setFieldSections] = useState(SECTIONS_WITH_FIELDS);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const updateFieldSections = (action, fieldSection) => {
    switch (action) {
      case Actions.Update:
        setFieldSections(
          [...fieldSections].map((fs) =>
            fs.name === fieldSection.name ? { ...fieldSection } : { ...fs }
          )
        );
        break;
    }
  };

  const [options, setOptions] = useState([]);

  const getFieldOptions = async () => {
    try {
      const { data } = await fieldService.getOptions();

      const fieldsOption = data?.map((item) => {
        const iconObj = iconByTypeField(item.field_type);
        return {
          ...item,
          name: iconObj.name || item.name,
          icon: iconObj.icon,
        };
      });

      setOptions(fieldsOption);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFieldOptions();
  }, []);

  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <Row className="vertical-section-board flex-nowrap overflow-x-auto pb-2">
        {fieldSections.map((fieldSection, index) => (
          <Col
            key={index}
            className={`vertical-section ${index > 0 ? 'pl-0' : ''}`}
          >
            <FieldSection
              fieldSection={fieldSection}
              updateFieldSections={updateFieldSections}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              options={options}
              setOptions={setOptions}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Fields;
