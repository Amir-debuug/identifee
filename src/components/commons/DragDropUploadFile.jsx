import { Input, Spinner } from 'reactstrap';
import { useEffect, useState } from 'react';
import MaterialIcon from './MaterialIcon';
import CategoryPartnerLogo from '../lesson/CategoryPartnerLogo';
import TooltipComponent from '../lesson/Tooltip';
import ValidationErrorText from './ValidationErrorText';

const DragDropUploadFile = ({
  file,
  setFile,
  onLoadFile,
  isLoading,
  allowedFormat = '.png,.jpeg,.jpg',
  preview = false,
  chooseFileText,
  logoId,
  name = 'idfFile',
  containerHeight = '128px',
  emptyContainerHeight = '120px',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewFile, setPreviewFile] = useState();
  const [logo, setLogo] = useState();

  useEffect(() => {
    setLogo(logoId);
  }, [logoId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const previewFileInView = (droppedFile) => {
    setUploadError('');
    if (droppedFile) {
      const fileExtension = droppedFile.name.split('.').pop();
      // if file type not allowed
      if (!allowedFormat.includes(`.${fileExtension}`)) {
        setUploadError(`Please upload file in these ${allowedFormat} format.`);
        return false;
      }

      setFile(droppedFile);
      if (preview) {
        setPreviewFile(URL.createObjectURL(droppedFile));
        setLogo(null);
      }

      return true;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    previewFileInView(droppedFile);
  };

  const handleLoadFile = (e) => {
    if (previewFileInView(e.target.files[0])) {
      onLoadFile(e);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{ height: !file && emptyContainerHeight }}
      className={`card bg-gray-200 p-2 rounded d-flex mb-3 border-dashed-gray ${
        !file ? 'align-items-center justify-content-center' : ''
      } ${dragActive ? 'bg-gray-300' : ''}`}
    >
      {file && !preview && (
        <div className="p-2">
          <div className="card rounded pdf-selected-wrapper w-100 p-2">
            <div>
              <div className="pdf-card d-flex justify-content-between align-items-center">
                <div className="d-flex flex-grow-1 align-items-center">
                  <div className="pdf-avatar d-flex justify-content-center align-items-center rounded">
                    {file?.name[0]}
                  </div>

                  <div className="text-left ml-2">
                    <p className="pdf-card-title">{file?.name}</p>
                  </div>
                </div>
                <div className="cursor-pointer" onClick={() => setFile(null)}>
                  <TooltipComponent title="Remove">
                    <MaterialIcon icon="delete" clazz="text-danger" />
                  </TooltipComponent>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!file && (
        <div className="text-center p-2">
          <div className="font-weight-semi-bold mb-0 form-label">
            <p className="mb-0">
              {' '}
              {chooseFileText} or{' '}
              <Input
                type="file"
                accept={allowedFormat}
                name={file?.name}
                id={`file-${name}`}
                onClick={(e) => {
                  e.target.value = '';
                }}
                className="d-none"
                onChange={handleLoadFile}
              />
              <label htmlFor={`file-${name}`} className="mb-0">
                <a className="btn-link decoration-underline cursor-pointer text-primary">
                  {isLoading ? <Spinner /> : 'Browse'}
                </a>
              </label>{' '}
              for a file upload{' '}
              <>{allowedFormat?.includes('pdf') ? '(PDF only)' : ''}</>
            </p>
          </div>
        </div>
      )}

      {file && (previewFile || logoId) && (
        <div
          className="position-relative d-flex justify-content-center overflow-hidden"
          style={{ height: containerHeight }}
        >
          {previewFile && (
            <img
              src={previewFile}
              style={{ objectFit: 'contain', width: 210 }}
            />
          )}
          {logo && (
            <CategoryPartnerLogo categoryInfo={{ logo }} width="210px" />
          )}
          <div
            className="cursor-pointer position-absolute top-0 right-0"
            onClick={() => setFile(null)}
          >
            <TooltipComponent title="Remove">
              <MaterialIcon icon="close" />
            </TooltipComponent>
          </div>
        </div>
      )}
      {uploadError && (
        <ValidationErrorText
          text={uploadError}
          extraClass="mb-0 font-weight-medium"
        />
      )}
    </div>
  );
};

export default DragDropUploadFile;
