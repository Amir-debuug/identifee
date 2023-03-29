import React, { useState, useEffect } from 'react';
import Mousetrap from 'mousetrap';
import { useHistory } from 'react-router-dom';
import routes from '../../../utils/routes.json';

import dealService from '../../../services/deal.service';
import {
  ADD_DEAL,
  ALL_LABEL,
  DEAL_CONTACT,
  EMPTY_CURRENCY,
} from '../../../utils/constants';
import AlertWrapper from '../../Alert/AlertWrapper';
import DealForm from '../../deals/DealForm';
import Alert from '../../../components/Alert/Alert';
import fieldService from '../../../services/field.service';
import RightPanelModal from '../../modal/RightPanelModal';
import { useForm } from 'react-hook-form';
import { overflowing } from '../../../utils/Utils';
import { groupBy } from 'lodash';
import stageService from '../../../services/stage.service';
import pipelineServices from '../../../services/pipeline.services';

const AddDeal = ({
  organizationId,
  onGetDeals,
  children,
  setOpenDeal,
  openDeal,
  profileInfo,
  errorMessage,
  setErrorMessage = () => {},
  successMessage,
  setSuccessMessage = () => {},
  fromNavbar,
  setOpenList,
  searchValue,
  initialDeals,
  selectedStage,
  pipeline,
}) => {
  const dealsObj = {
    name: '',
    contact_organization_id: '',
    contact_organization_new: '',
    currency: 'USD',
  };
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preOwners, setPreOwners] = useState([]);
  const [selectOrganization, setSelectOrganization] = useState('');
  const [selectContactPerson, setSelectContactPerson] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState({});
  const [pipelineStages, setPipelineStages] = useState([]);
  const [selectTitle, setSelectTitle] = useState(ALL_LABEL);
  const [pipelines, setPipelines] = useState([]);
  const [, setLoadingPipelines] = useState(false);
  const [dealFormData, dispatchFormData] = useState(dealsObj);
  const [isLoading, setIsLoading] = useState(false);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [searchOrg, setSearchOrg] = useState({
    search: '',
  });
  const [searchContact, setSearchContact] = useState({
    search: '',
  });
  const currentView = 'deal';
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: dealFormData,
  });
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async () => {
    setIsLoading(true);
    const { data } = await fieldService.getFields(currentView, {
      preferred: true,
    });
    if (data.length > 0) {
      groupBySection(data);
      setIsLoading(false);
    } else {
      const { data } = await fieldService.createDefaultFields(currentView);
      groupBySection(data);
      setIsLoading(false);
    }
  };
  Mousetrap.bind(`shift+d`, () => setOpenDeal(true));
  useEffect(() => {
    if (openDeal === true) {
      getFields();
    }
  }, [openDeal]);
  useEffect(() => {
    if (organizationId) {
      dispatchFormData({
        ...dealFormData,
        contact_organization_id: organizationId,
      });
    }
  }, [profileInfo]);

  const toggle = () => {
    setOpenDeal(!openDeal);
    setOpenList && setOpenList(false);
    overflowing();
  };

  const onClose = () => {
    setSelectOrganization();
    setSelectContactPerson();
    toggle();
    reset(
      dispatchFormData({
        name: '',
        contact_organization_id: '',
        contact_organization_new: '',
        contact_person_id: '',
        currency: 'USD',
      })
    );

    overflowing();
  };

  const onHandleSubmit = async () => {
    setLoading(true);
    if (dealFormData.amount && !dealFormData.currency) {
      setLoading(false);
      setErrorMessage(EMPTY_CURRENCY);
      return setError(EMPTY_CURRENCY);
    }
    dealFormData.sales_stage = dealFormData.deal_type || 'cold';
    let products;
    if (dealFormData?.products?.length) {
      products = dealFormData?.products.filter(({ product_id }) => product_id);
    }

    const dataDeal = { ...dealFormData, products };
    const newDeal = await dealService.createDeal(dataDeal).catch((err) => {
      setErrorMessage(err.messgae);
      setError(err.message);
    });

    if (newDeal) {
      await Promise.all(
        preOwners?.map(async (item) => {
          await new Promise((resolve) => {
            dealService.addOwner(newDeal?.data?.id, item.user_id).then(resolve);
          });
        })
      );
      setSelectedPipeline();
      setPipelineStages();
      setSelectTitle();
      setPipelines();
      setSearchOrg({
        search: '',
      });
      setSearchContact({
        search: '',
      });
      reset(
        dispatchFormData({
          name: '',
          contact_organization_id: '',
          contact_organization_new: '',
          contact_person_id: '',
          currency: 'USD',
        })
      );
      setPreOwners([]);
      setSuccessMessage(DEAL_CONTACT);
      setSuccess(DEAL_CONTACT);

      toggle();

      if (fromNavbar) {
        history.push(`${routes.dealsPipeline}/${newDeal?.data?.id}`);
      }
    }

    setTimeout(() => {
      setLoading(false);
      onGetDeals && onGetDeals();
    }, 3000);
  };
  const getPipelineStages = async () => {
    const pipelineId = selectedPipeline?.id;
    if (pipelineId || pipeline) {
      const stages = await stageService.getStages(pipelineId);
      const newStages = stages.map((stage) => {
        return {
          id: stage.id,
          name: stage.name,
          title: stage.name,
          stagePosition: stage.position,
        };
      });
      // debugger;
      dispatchFormData({
        ...dealFormData,
        tenant_deal_stage_id: newStages[0]?.id,
      });
      setValue('tenant_deal_stage_id', newStages[0]?.id);
      setPipelineStages(newStages);
      setSelectedStageOrFirst(selectedStage || newStages[0]);
    }
    setSelectedStageOrFirst(selectedStage);
  };
  useEffect(() => {
    getPipelineStages();
  }, [pipeline, selectedStage]);
  function setSelectedStageOrFirst(firstStage) {
    let initialLabel = '';

    // setting pre-selected stage if the component gets it from some other component
    if (selectedStage && Object.hasOwn(selectedStage, 'title')) {
      initialLabel = {
        id: selectedStage.stageId,
        title: selectedStage.title,
      };
    } else {
      initialLabel = find(initialDeals) || firstStage;
    }

    setSelectTitle(initialLabel?.title || 'Select Pipeline Stage');
  }
  useEffect(() => {
    (async () => {
      setLoadingPipelines(true);
      const { data } = await pipelineServices.getPipelines();
      const updatedPipelines = data?.map((p) => ({ ...p, key: p.id }));
      setPipelines(updatedPipelines);
      // when open this from navbar look for default pipeline first, if found select it
      if (fromNavbar) {
        const defaultPipeline = updatedPipelines.find((p) => p.isDefault);
        setSelectedPipeline(
          updatedPipelines?.length ? defaultPipeline || updatedPipelines[0] : {}
        );
      } else {
        setSelectedPipeline(
          updatedPipelines?.length ? pipeline || updatedPipelines[0] : {}
        );
      }
      setLoadingPipelines(false);
      // setValue('tenant_deal_stage_id', pipeline?.id);
    })();
  }, []);
  const [containerWidth, setContainerWidth] = useState(540);
  return (
    <>
      <RightPanelModal
        showModal={openDeal}
        setShowModal={() => onClose()}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={containerWidth}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center">
            <h3 className="mb-0">{ADD_DEAL}</h3>
          </div>
        }
      >
        <DealForm
          dispatch={dispatchFormData}
          dealFormData={openDeal ? dealFormData : {}}
          profileInfo={profileInfo}
          searchValue={searchValue}
          isprincipalowner="true"
          pipeline={pipeline}
          prevalue="true"
          register={register}
          handleSubmit={handleSubmit(onHandleSubmit)}
          errors={errors}
          loading={loading}
          selectOrganization={selectOrganization}
          setSelectOrganization={setSelectOrganization}
          selectContactPerson={selectContactPerson}
          setSelectContactPerson={setSelectContactPerson}
          isLoading={isLoading}
          getPipelineStages={getPipelineStages}
          setValue={setValue}
          getFieldState={getFieldState}
          control={control}
          pipelines={pipelines}
          searchOrg={searchOrg}
          setSearchOrg={setSearchOrg}
          searchContact={searchContact}
          setSearchContact={setSearchContact}
          fields={isFieldsData}
          preowners={preOwners}
          onClose={onClose}
          selectedPipeline={selectedPipeline}
          setSelectedPipeline={setSelectedPipeline}
          pipelineStages={pipelineStages}
          setPipelineStages={setPipelineStages}
          selectTitle={selectTitle}
          setSelectTitle={setSelectTitle}
          setPreOwners={setPreOwners}
          initialDeals={initialDeals}
          fromNavbar={fromNavbar}
          selectedStage={selectedStage}
          setContainerWidth={setContainerWidth}
        />
      </RightPanelModal>
      {children}

      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={error || errorMessage}
          setMessage={setError || setErrorMessage}
        />
        <Alert
          color="success"
          message={success || successMessage}
          setMessage={setSuccess || setSuccessMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default AddDeal;
