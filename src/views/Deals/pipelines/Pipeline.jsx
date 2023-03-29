import { useParams, Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { findIndex } from 'lodash';
import Heading from '../../../components/heading';
import AddContent from '../../../components/peopleProfile/AddContent';
import dealService from '../../../services/deal.service';
import PipelineOverview from './PipelineOverview';
import PipelineOrganizationInfo from './PipelineOrganizationInfo';
import PipelineContactInfo from './PipelineContactInfo';
import { NO_DEAL } from '../../../utils/constants';
import PipelineHeader from './PipelineHeader';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import { getProductsTotalAmount } from '../../../utils/Utils';
import userService from '../../../services/user.service';

const Pipeline = () => {
  const params = useParams();
  const { id, activityId } = params || {};
  const [deal, setDeal] = useState({});
  const [, setIsLoading] = useState(false);
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setProductsTotalAmount] = useState(0);
  const [refreshOwners, setRefresOwners] = useState(false);
  const [, setActivityIdOpen] = useState(activityId);
  const [me, setMe] = useState(null);
  const [refreshPipelineStage, setRefreshPipelineStage] = useState(1);

  const isPrincipalOwner =
    me && deal
      ? me?.role?.admin_access ||
        me?.role?.owner_access ||
        deal?.assigned_user_id === me?.id
      : false;

  useEffect(() => {
    if (refreshOwners) {
      setRefresOwners(false);
    }
  }, [refreshOwners]);

  useEffect(() => {
    getDeal();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (refreshRecentFiles) {
      getDeal();
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const getDeal = async (message) => {
    if (message) {
      setSuccessMessage(message);
      setActivityIdOpen('');
    }
    setIsLoading(true);

    const deal = await dealService
      .getDealById(id)
      .catch((err) => console.log(err));

    setDeal(deal);

    setIsLoading(false);

    setRefreshPipelineStage((prevState) => prevState + 1);
  };

  if (!deal) {
    return <div>{NO_DEAL}</div>;
  }

  const classnames = (index, stages, currentDeal) => {
    const stageIndex = findIndex(stages, {
      id: currentDeal.tenant_deal_stage_id || 'cold',
    });

    if (index <= stageIndex) {
      if (deal.status === 'lost') return 'danger';

      return 'complete';
    }

    return 'light';
  };

  useEffect(() => {
    deal?.deal_products?.length &&
      setProductsTotalAmount(getProductsTotalAmount(deal.deal_products));
  }, [deal?.deal_products]);

  if (deal?.deleted) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <AlertWrapper>
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
      <Heading useBc title={deal.name} showGreeting={false} />
      <PipelineHeader
        classnames={classnames}
        deal={deal}
        getDeal={getDeal}
        refreshOwners={refreshOwners}
        setRefresOwners={setRefresOwners}
        isPrincipalOwner={isPrincipalOwner}
        refreshPipelineStage={refreshPipelineStage}
        withFollowers={deal.id}
        mainOwner={deal?.assigned_user}
        service={dealService}
      />

      <div className="row">
        <div className="col-lg-4">
          <PipelineOverview
            deal={deal}
            getDeal={getDeal}
            isPrincipalOwner={isPrincipalOwner}
          />

          <PipelineOrganizationInfo deal={deal} getDeal={getDeal} />

          <PipelineContactInfo deal={deal} getDeal={getDeal} />
        </div>

        <div className="col-lg-8 pl-0">
          <div>
            <AddContent
              dataType="deal"
              dealId={deal.id}
              deal={deal}
              organization={deal?.organization}
              getDeal={getDeal}
              setDeal={setDeal}
              me={me}
              contactInfo={deal?.contact}
              organizationId={deal?.organization?.id}
              contactIs={'organization'}
              getProfileInfo={getDeal}
              isDeal={true}
              refreshRecentFiles={refreshRecentFiles}
              setRefreshRecentFiles={setRefreshRecentFiles}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Pipeline;
