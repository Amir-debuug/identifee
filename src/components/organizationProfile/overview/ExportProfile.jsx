import SimpleModalCreation from '../../modal/SimpleModalCreation';
import helpOutline from '../../../assets/svg/help_outline.svg';
import { Image } from 'react-bootstrap';
import { CardButton } from '../../layouts/CardLayout';
import RocketReachPeopleCard from './RocketReachPeopleCard';
import { overflowing } from '../../../utils/Utils';

const ExportProfile = ({
  children,
  openModal,
  setOpenModal,
  prospect,
  handleExport,
  loading,
  multiple,
}) => {
  return (
    <div>
      {openModal && (
        <SimpleModalCreation
          open={openModal}
          bodyClassName="text-center"
          customModal="w-30"
          noFooter
          bankTeam
        >
          <div>
            <Image src={helpOutline} className="mb-4" />

            <p className="font-inter">
              {multiple
                ? 'Are you sure you want to export the following profiles'
                : 'Are you sure you want to export the following profile as a Contact'}
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

          <div className="d-flex my-3">
            <CardButton
              type="button"
              title="No, Cancel"
              className="mt-2 btn btn-sm btn-outline-danger mr-2 w-50"
              onClick={() => {
                overflowing();
                setOpenModal(false);
              }}
            />

            <CardButton
              type="button"
              title="Yes, Export"
              variant="primary"
              className="mt-2 btn-sm w-50"
              isLoading={loading}
              onClick={() => {
                overflowing();
                handleExport();
              }}
            />
          </div>
        </SimpleModalCreation>
      )}
      {children}
    </div>
  );
};

export default ExportProfile;
