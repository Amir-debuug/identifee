import SimpleModalCreation from '../../modal/SimpleModalCreation';
import helpOutline from '../../../assets/svg/help_outline.svg';
import { Image } from 'react-bootstrap';
import { CardButton } from '../../layouts/CardLayout';
import RocketReachPeopleCard from './RocketReachPeopleCard';
import { overflowing } from '../../../utils/Utils';
import React, { useEffect, useState } from 'react';
import { usePagesContext } from '../../../contexts/pagesContext';

// made the component generic so that we can call it from everywhere
// currently its being used in Import Profile click from Find Prospects UI and right bar in Org profile
const ImportProfile = ({
  children,
  openImportModal,
  setOpenImportModal,
  prospect,
  handleImport,
  loading,
  multiple,
  data = {},
  fromAutoAwesome = {},
}) => {
  const [infoLoading, setInfoLoading] = useState(true);
  const { pageContext } = usePagesContext();
  useEffect(() => {
    setInfoLoading(true);
    if (pageContext?.ImportProfileLoaded) {
      setInfoLoading(false);
    }
  }, [pageContext]);

  useEffect(() => {
    setInfoLoading(openImportModal);
  }, [openImportModal]);

  return (
    <div>
      {openImportModal && (
        <SimpleModalCreation
          open={openImportModal}
          bodyClassName="text-center"
          customModal="w-50"
          noFooter
          bankTeam
        >
          <div>
            <Image src={helpOutline} className="mb-4" />

            <p className="font-inter">
              {multiple
                ? 'Are you sure you want to import the following profiles'
                : 'Are you sure you want to import the following profile as a Contact'}
              ?
            </p>

            {multiple ? (
              <div
                style={{
                  maxHeight: 410,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {prospect.map((pros) => (
                  <div key={pros.id} className="card mb-1">
                    <div className="card-body">
                      <RocketReachPeopleCard
                        prospect={pros}
                        showSocialLinks={false}
                        withContactInfo={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="card-body mb-2">
                  <RocketReachPeopleCard
                    prospect={prospect}
                    showSocialLinks={false}
                    withContactInfo={true}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mb-0">
            <CardButton
              type="button"
              title="Cancel"
              className="btn btn-sm btn-outline-danger w-100"
              onClick={() => {
                overflowing();
                setOpenImportModal(false);
              }}
            />

            {data?.external_id && (
              <CardButton
                type="button"
                title="Merge"
                variant="primary"
                className="btn-sm w-100"
                isLoading={fromAutoAwesome.loading}
                disabled={fromAutoAwesome.loading || infoLoading}
                onClick={fromAutoAwesome.handleMerge}
              />
            )}

            <CardButton
              type="button"
              title="Import"
              variant="primary"
              className="btn-sm w-100"
              isLoading={loading}
              disabled={infoLoading}
              onClick={() => {
                overflowing();
                handleImport();
              }}
            />
          </div>
        </SimpleModalCreation>
      )}
      {children}
    </div>
  );
};

export default ImportProfile;
