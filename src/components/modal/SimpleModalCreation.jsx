import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { overflowing, removeBodyScroll } from '../../utils/Utils';

export default function SimpleModalCreation({
  children,
  modalTitle,
  open,
  handleSubmit,
  buttonsDisabled,
  onHandleCloseModal,
  errorMessage,
  setErrorMessage,
  isLoading,
  editFields,
  saveButton,
  successMessage,
  loading,
  setSuccessMessage,
  customModal,
  bodyClassName = 'mb-0 p-3',
  bankTeam = false,
  toggle,
  noFooter = false,
  saveButtonStyle = 'btn-primary',
  ...rest
}) {
  return (
    <Modal
      onOpened={() => {
        removeBodyScroll();
      }}
      onClosed={() => {
        overflowing();
      }}
      isOpen={open}
      fade={false}
      {...rest}
      className={customModal}
    >
      <ModalHeader
        tag="h3"
        toggle={onHandleCloseModal}
        className={modalTitle ? 'p-3 text-capitalize' : 'p-0'}
      >
        {modalTitle}
      </ModalHeader>
      <ModalBody
        className={`${bodyClassName} ${modalTitle ? 'border-top' : ''}`}
      >
        {children}
      </ModalBody>

      {(bankTeam === false || noFooter === false) && (
        <ModalFooter className="px-3">
          {onHandleCloseModal && (
            <button
              className="btn btn-white btn-sm"
              data-dismiss="modal"
              onClick={onHandleCloseModal}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          {handleSubmit && (
            <button
              type="button"
              className={`btn btn-sm ${saveButtonStyle}`}
              onClick={handleSubmit}
              disabled={isLoading || buttonsDisabled}
            >
              {isLoading ? (
                <Spinner className="spinner-grow-xs" />
              ) : (
                <span>{editFields ? 'Update' : saveButton || 'Save'}</span>
              )}
            </button>
          )}
        </ModalFooter>
      )}
    </Modal>
  );
}
