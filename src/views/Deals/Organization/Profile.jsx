import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import Deals from '../../../components/peopleProfile/deals/Deals';
import Header from '../../../components/organizationProfile/Header';
import AddContent from '../../../components/peopleProfile/AddContent';
import organizationService from '../../../services/organization.service';
import Contacts from '../../../components/organizationProfile/contacts/Contacts';
import RelatedOrg from '../../../components/organizationProfile/relatedOrgs/RelatedOrg';
import Overview from '../../../components/organizationProfile/overview/Organization';
import RightBar from '../../../components/organizationProfile/overview/RightBar';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import stringConstants from '../../../utils/stringConstants.json';
import userService from '../../../services/user.service';

const Profile = ({ children }) => {
  const constants = stringConstants.deals.contacts.profile;
  const history = useHistory();
  const { organizationId, activityId } = useParams();

  const [, setIsLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({});
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshOwners, setRefresOwners] = useState(false);
  const [activityIdOpen, setActivityIdOpen] = useState(activityId);
  const [organization, setOrganization] = useState({});
  const [me, setMe] = useState(null);
  const isPrincipalOwner =
    me && profileInfo
      ? me?.role?.admin_access ||
        me?.role?.owner_access ||
        profileInfo?.assigned_user_id === me?.id
      : false;

  useEffect(() => {
    getCurrentUser();
  }, [profileInfo]);

  useEffect(() => {
    if (refreshOwners) {
      setRefresOwners(false);
    }
  }, [refreshOwners]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const goToHome = () => {
    history.push('/');
  };
  const permissionCheck = {
    collection: 'contacts',
    action: 'edit',
  };
  const getOrganizationById = async () => {
    const organizationObj = await organizationService.getOrganizationById(
      organizationId
    );
    setOrganization(organizationObj);
  };
  const getProfileInfo = (message) => {
    if (message) {
      setActivityIdOpen(''); // After activity update to not open activity modal
      switch (message) {
        case constants.contactUpdated:
          setSuccessMessage(constants.contactUpdated);

          break;
        case constants.errorContactUpdated:
          setErrorMessage(constants.errorContactUpdated);
          break;
        default:
          setSuccessMessage(message);
      }
    }
    setIsLoading(true);
    Promise.all([
      organizationService.getOrganizationById(organizationId),
      organizationService.getFieldByOrganization(organizationId, {}),
    ])
      .then(([result, response]) => {
        if (!result) {
          goToHome();
        }

        const fields = response?.data?.sort((a, b) => {
          return a.field.order - b.field.order;
        });

        setProfileInfo({ ...result, fields });

        setIsLoading(false);
      })
      .catch(() => {
        goToHome();
      });
  };

  useEffect(() => {
    getProfileInfo();
    getCurrentUser();
    getOrganizationById();
  }, []);

  useEffect(() => {
    if (refreshRecentFiles) {
      getProfileInfo();
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles]);

  const updateLabel = (label) => {
    if (label.id === profileInfo?.label?.id) {
      setProfileInfo({ ...profileInfo, label });
    }
  };

  return (
    <>
      {children}
      <div className="splitted-content-fluid position-relative container-fluid content-with-insights overflow-x-hidden">
        <AlertWrapper>
          <Alert
            color="success"
            message={successMessage}
            setMessage={setSuccessMessage}
          />
          <Alert
            message={errorMessage}
            setMessage={setErrorMessage}
            color="danger"
          />
        </AlertWrapper>
        <Header
          me={me}
          service={organizationService}
          withFollowers={organizationId}
          mainOwner={profileInfo?.assigned_user}
          data={profileInfo}
          refreshOwners={refreshOwners}
          setRefresOwners={setRefresOwners}
          isPrincipalOwner={isPrincipalOwner}
          getProfileInfo={getProfileInfo}
        />
        <hr className="mt-0" />
        <div className="row">
          <div className="col-lg-5">
            <Overview
              data={profileInfo}
              me={me}
              labelType="organization"
              setProfileInfo={setProfileInfo}
              getProfileInfo={getProfileInfo}
              isPrincipalOwner={isPrincipalOwner}
              updateLabel={updateLabel}
              permissionCheck={permissionCheck}
            />
            <Contacts
              organizationId={organizationId}
              getProfileInfo={getProfileInfo}
              isPrincipalOwner={isPrincipalOwner}
              mainOwner={profileInfo?.assigned_user}
            />
            <Deals organizationId={organizationId} profileInfo={profileInfo} />
            <RelatedOrg
              organizationId={organizationId}
              getProfileInfo={getProfileInfo}
              isPrincipalOwner={isPrincipalOwner}
              mainOwner={profileInfo?.assigned_user}
            />
          </div>

          <div className="col-lg-7 pl-0">
            <div>
              <AddContent
                dataType="organization"
                organizationId={organizationId}
                getProfileInfo={getProfileInfo}
                profileInfo={profileInfo}
                dataSection
                organization={organization}
                contactIs={'organization'}
                refreshRecentFiles={refreshRecentFiles}
                setRefreshRecentFiles={setRefreshRecentFiles}
                isPrincipalOwner={isPrincipalOwner}
                me={me}
                openActivityId={activityIdOpen}
              />
            </div>
          </div>
        </div>
        <RightBar profileInfo={profileInfo} />
      </div>
    </>
  );
};

export default Profile;
