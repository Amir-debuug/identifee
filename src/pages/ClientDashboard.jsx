import qs from 'qs';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import Home from '../components/ClientPortal/Home';
import LeftSidebar from '../components/ClientPortal/LeftSidebar';
import authService from '../services/auth.service';
import RightSidebar from '../components/ClientPortal/RightSideBar';
import Loading from '../components/Loading';
import MaterialIcon from '../components/commons/MaterialIcon';
import organizationService from '../services/organization.service';
import Skeleton from 'react-loading-skeleton';
import PageTitle from '../components/commons/PageTitle';

const ClientDashboard = () => {
  const history = useHistory();
  const [loader, setLoader] = useState(false);
  const [organization, setOrganization] = useState({});
  const [contactId, setContactId] = useState('');
  const [owner, setOwner] = useState({});
  const [organizationId, setOrganizationId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const query = qs.parse(location.search, { ignoreQueryPrefix: true });
        const hasQueryKeys = Object.keys(query).length > 0;

        // no query keys, redirect to login
        if (!hasQueryKeys || !query.token) {
          history.push('/clientportal/login');
        }

        const token = {
          access_token: query.token,
        };
        const tokenPayload = await authService.introspect(token.access_token);

        sessionStorage.setItem('idftoken-public', JSON.stringify(token));

        setContactId(tokenPayload.contact_id);
        setOwner(tokenPayload.shared_by);
        setOrganizationId(tokenPayload.resource_access.organization[0].id);
      } catch (error) {
        history.push('/clientportal/login');
      }
    })();
  }, []);

  const getOrganization = async () => {
    setLoader(true);
    try {
      const organizationObj = await organizationService.getOrganizationById(
        organizationId
      );
      setOrganization(organizationObj);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      getOrganization();
    }
  }, [organizationId]);

  if (!contactId || !organizationId) {
    return <Loading />;
  }

  return (
    <div className="d-flex AppBackground overflow-x-hidden w-100">
      <PageTitle page={organization?.name} pageModule="" />
      <LeftSidebar
        contactId={contactId}
        organizationId={organizationId}
        owner={owner}
      />
      <div className="client-main-content w-100">
        <div className="row p-3 my-2">
          <div className="col-lg-12">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <MaterialIcon
                  icon="corporate_fare"
                  clazz="mr-2 p-2 rounded-circle font-size-2xl shadow text-center bg-white text-blue"
                />
                <h3 className="mb-0">
                  {' '}
                  {loader ? (
                    <Skeleton height={10} width={120} />
                  ) : (
                    organization?.name
                  )}
                </h3>
              </div>
            </div>
          </div>
        </div>
        <div className="row w-100 m-auto">
          <Home contactId={contactId} organizationId={organizationId} />
          <RightSidebar contactId={contactId} organizationId={organizationId} />
        </div>
        <Toaster position="bottom-right" reverseOrder={true} />
      </div>
    </div>
  );
};

export default ClientDashboard;
