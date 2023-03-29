import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import Header from '../../../components/peopleProfile/Header';
import contactService from '../../../services/contact.service';
import Deals from '../../../components/peopleProfile/deals/Deals';
import Overview from '../../../components/peopleProfile/overview/Overview';
import RightBar from '../../../components/organizationProfile/overview/RightBar';
import Organization from '../../../components/peopleProfile/organization/Organization';
import AddContent from '../../../components/peopleProfile/AddContent';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import userService from '../../../services/user.service';

const Profile = () => {
  const history = useHistory();
  const { contactId, activityId } = useParams();
  const [, setIsLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({});
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshOwners, setRefresOwners] = useState(false);
  const [, setActivityIdOpen] = useState(activityId);
  const [me, setMe] = useState(null);

  const isPrincipalOwner =
    me && profileInfo
      ? me?.role?.admin_access ||
        me?.role?.owner_access ||
        profileInfo?.assigned_user?.id === me?.id
      : false;

  useEffect(() => {
    getCurrentUser();
  }, [profileInfo]);

  useEffect(() => {
    if (refreshOwners) {
      setRefresOwners(false);
    }
  }, [refreshOwners]);

  useEffect(() => {
    getProfileInfo();
  }, []);

  useEffect(() => {
    if (refreshRecentFiles) {
      getProfileInfo();
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles]);

  useEffect(() => {
    getProfileInfo();
  }, [contactId]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const goToHome = () => {
    history.push('/');
  };

  const getProfileInfo = (message) => {
    setIsLoading(true);
    if (message) {
      setActivityIdOpen('');
      setSuccessMessage(message);
    }
    Promise.all([
      contactService.getContactById(contactId),
      contactService.getFieldByContact(contactId, {}),
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

  return (
    <>
      <div className="splitted-content-fluid container-fluid content-with-insights">
        <AlertWrapper>
          <Alert message={successMessage} setMessage={setSuccessMessage} />
        </AlertWrapper>

        <Header
          contactId={contactId}
          data={profileInfo}
          refreshOwners={refreshOwners}
          setRefresOwners={setRefresOwners}
          isPrincipalOwner={isPrincipalOwner}
        />
        <hr className="mt-0" />
        <div className="row">
          <div className="col-lg-5">
            <Overview
              labelType="contact"
              data={profileInfo}
              getProfileInfo={getProfileInfo}
              isPrincipalOwner={isPrincipalOwner}
            />
            <Organization
              data={profileInfo.organization}
              contactId={contactId}
              getProfileInfo={getProfileInfo}
              isPrincipalOwner={isPrincipalOwner}
            />

            <Deals contactId={contactId} />
          </div>

          <div className="col-lg-7 pl-0">
            <div>
              <AddContent
                dataType="contact"
                contactId={contactId}
                contactInfo={profileInfo}
                getProfileInfo={getProfileInfo}
                organizationId={profileInfo?.organization?.id}
                contactIs={'profile'}
                isContact
                me={me}
                refreshRecentFiles={refreshRecentFiles}
                setRefreshRecentFiles={setRefreshRecentFiles}
              />
            </div>
          </div>
        </div>
      </div>
      <RightBar profileInfo={profileInfo?.organization} isPeople={true} />
    </>
  );
};

export default Profile;
