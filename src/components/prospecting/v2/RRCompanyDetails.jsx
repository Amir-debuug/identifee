import { useHistory } from 'react-router';
import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import {
  addressify,
  numbersWithComma,
  overflowing,
  roundNumbers,
} from '../../../utils/Utils';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import RocketReachSocialLinks from '../../../components/organizationProfile/overview/RocketReachSocialLinks';
import { Image } from 'react-bootstrap';
import locationCircle from '../../../assets/svg/location-circle.svg';
import phoneCircle from '../../../assets/svg/phone-circle.svg';
import sicCircle from '../../../assets/svg/sic-circle.svg';
import revenueCircle from '../../../assets/svg/revenue-circle.svg';
import foundedCircle from '../../../assets/svg/founded-circle.svg';
import webCircle from '../../../assets/svg/web-circle.svg';
import Skeleton from 'react-loading-skeleton';
import IconTextLoader from '../../../components/loaders/IconText';
import routes from '../../../utils/routes.json';
import NoDataFound from '../../../components/commons/NoDataFound';
import naicsCircle from '../../../assets/svg/naics-circle.svg';
import ProfilePicOrFallbackAvatar from '../../commons/ProfilePicOrFallbackAvatar';
import ViewMoreLess from '../../commons/ViewMoreLess';
import { ProspectTypes } from './constants';

const OrgItemRow = ({ children }) => {
  return <Row className="my-1">{children}</Row>;
};

const OrgItemWithIcon = ({ label, icon, isCustomIcon }) => {
  return (
    <p className="m-0 p-0 lead fs-7 d-flex align-items-center font-weight-semi-bold py-1">
      {isCustomIcon || <Image src={icon} className="mr-1" />}
      <span>{label}</span>
    </p>
  );
};

const LoaderSkeleton = () => {
  return (
    <Card className="col-lg-12">
      <CardHeader className="justify-content-center">
        <div className="d-flex align-items-center py-2">
          <span
            style={{ width: 70, height: 70 }}
            className="avatar-initials avatar-icon-font-size p-2 mr-2 rounded-circle text-primary"
          >
            <Skeleton height={70} width={70} circle />
          </span>
          <h1>
            <Skeleton height={15} width={300} />
            <br />
            <div className="d-flex align-items-center gap-2">
              <Skeleton height={30} width={30} circle className="mr-2" />
              <Skeleton height={30} width={30} circle className="mr-2" />
              <Skeleton height={30} width={30} circle />
            </div>
          </h1>
        </div>
      </CardHeader>
      <CardBody className="justify-content-center text-center">
        <Skeleton height={10} width={600} />
        <br />
        <br />
        <Skeleton height={10} width={300} />
        <br />
        <br />
        <IconTextLoader count={8} />
      </CardBody>
    </Card>
  );
};

const NoCompanyDetailsFound = ({ fromDomainMenu }) => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const tab = params.get('tab');
  const gobackToResources = () => {
    history.push(`${routes.resources}?tab=${tab}`);
  };

  const Description = () => {
    return (
      <div className="text-center">
        <p>
          We couldn&apos;t find details of the company please click below to
        </p>
        <ButtonIcon
          icon="west"
          label="Go back to resources"
          classnames="btn-sm"
          color="primary"
          onclick={gobackToResources}
        />
      </div>
    );
  };
  const Title = () => {
    return <div className="text-gray-search">No company details found.</div>;
  };

  const TitleDomain = () => {
    return <div className="text-gray-search">Let&apos;s start searching!</div>;
  };

  const DescriptionDomain = () => {
    return (
      <>
        Get started by putting a domain name or for a more refined search, use
        the <MaterialIcon icon="filter_alt" /> filters to the left!
      </>
    );
  };
  return (
    <Card className="position-relative col-lg-12">
      <CardBody>
        {fromDomainMenu ? (
          <NoDataFound
            icon="domain_disabled"
            title={<TitleDomain />}
            description={<DescriptionDomain />}
            containerStyle={'text-gray-search py-6 my-6'}
          />
        ) : (
          <NoDataFound
            icon="domain_disabled"
            title={<Title />}
            description={<Description />}
            containerStyle={'text-gray-search py-6 my-6'}
          />
        )}
      </CardBody>
    </Card>
  );
};

const RRCompanyDetails = ({ company, socialLinks, loader, allowBack }) => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const tab = params.get('tab');
  const gobackToResources = () => {
    history.push(`${routes.resources}?tab=${tab}`);
  };

  const redirectToProspectsSearch = () => {
    overflowing();
    history.push(
      `${routes.resources}?current_employer=${company.name}&tab=${ProspectTypes.people}`
    );
  };

  return (
    <>
      <div className="row justify-content-center">
        {loader ? (
          <LoaderSkeleton />
        ) : (
          <>
            {company?.name ? (
              <Card className="position-relative" style={{ minWidth: 940 }}>
                {allowBack && (
                  <ButtonIcon
                    icon="west"
                    label="Back"
                    classnames="position-absolute btn-sm left-0 top-0 m-2"
                    color="white"
                    onclick={gobackToResources}
                  />
                )}
                <CardHeader
                  tag="h1"
                  className="justify-content-center flex-column py-4"
                >
                  <div className="d-flex align-items-center gap-1 py-2">
                    <ProfilePicOrFallbackAvatar
                      prospect={company}
                      style={{ width: 70, height: 70 }}
                    />
                    <h1>
                      <p className="mb-0">{company.name}</p>
                      <RocketReachSocialLinks links={socialLinks} />
                    </h1>
                  </div>
                </CardHeader>
                <CardBody className="justify-content-center">
                  {company?.description && (
                    <ViewMoreLess text={company?.description} limit={900} />
                  )}
                  <div className="text-center">
                    <ButtonIcon
                      icon="search"
                      label="Search Employees"
                      onclick={redirectToProspectsSearch}
                      className="btn btn-success font-weight-semi-bold mt-3 py-2 mb-4 px-6 text-white"
                    />
                  </div>
                  {company.domain && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon icon={webCircle} label="Website" />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7">
                          <a
                            href={`https://${company.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {company.domain}
                          </a>
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.ticker && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon
                          isCustomIcon={
                            <MaterialIcon
                              icon="area_chart"
                              clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                            />
                          }
                          label="Ticker"
                        />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7">{company.ticker?.trim()}</p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.revenue && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon icon={revenueCircle} label="Revenue" />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7">
                          ${roundNumbers(company.revenue, 'long', 2)}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.employees && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon
                          isCustomIcon={
                            <MaterialIcon
                              icon="people"
                              clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                            />
                          }
                          label="Employees"
                        />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7 text-capitalize">
                          {numbersWithComma(company.employees)}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {(company.founded || company.year_founded) && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon icon={foundedCircle} label="Founded" />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7 text-capitalize">
                          {company.founded || company.year_founded}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  <OrgItemRow>
                    <Col md={2}>
                      <OrgItemWithIcon icon={locationCircle} label="Address" />
                    </Col>
                    <Col md={10}>
                      <p className="mb-0 fs-7 text-capitalize">
                        {addressify(company, 'company')}
                      </p>
                    </Col>
                  </OrgItemRow>
                  {company.phone && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon icon={phoneCircle} label="Phone" />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7 text-capitalize">
                          {company.phone}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.fax && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon
                          isCustomIcon={
                            <MaterialIcon
                              icon="fax"
                              clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                            />
                          }
                          label="Fax"
                        />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7 text-capitalize">
                          {company.fax}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.techStack?.length > 0 && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon
                          isCustomIcon={
                            <MaterialIcon
                              icon="apps"
                              clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                            />
                          }
                          label="Technologies"
                        />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7">
                          <ViewMoreLess
                            text={company.techStack.join(', ')}
                            byWords={15}
                          />
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.industries && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon
                          isCustomIcon={
                            <MaterialIcon
                              icon="category"
                              clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                            />
                          }
                          label="Category"
                        />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7 text-capitalize">
                          {company.industries.join(', ')}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.sic && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon icon={sicCircle} label="SIC" />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7 text-capitalize">
                          {company.sic || 'N/A'}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                  {company.naics && (
                    <OrgItemRow>
                      <Col md={2}>
                        <OrgItemWithIcon icon={naicsCircle} label="NAICS" />
                      </Col>
                      <Col md={10}>
                        <p className="mb-0 fs-7 text-capitalize">
                          {company.naics || 'N/A'}
                        </p>
                      </Col>
                    </OrgItemRow>
                  )}
                </CardBody>
              </Card>
            ) : (
              <NoCompanyDetailsFound fromDomainMenu={!allowBack} />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RRCompanyDetails;
