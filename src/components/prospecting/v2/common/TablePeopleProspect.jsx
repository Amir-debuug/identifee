import React, { forwardRef, useEffect, useState } from 'react';
import {
  Button,
  Card,
  FormControl,
  FormGroup,
  InputGroup,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';

import Table from '../../../GenericTable';
import { columnsTablePeople } from '../../constants';
import constantsString from '../../../../utils/stringConstants.json';
import MaterialIcon from '../../../commons/MaterialIcon';
import RocketReachPeopleCard from '../../../organizationProfile/overview/RocketReachPeopleCard';
import RocketReachViewInfoCard from '../../../organizationProfile/overview/RocketReachViewInfoCard';
import LookupPeopleLoader from '../../../loaders/LookupPeople';
import Skeleton from 'react-loading-skeleton';
import { useFilterProspectContext } from '../../../../contexts/filterProspectContext';
import TableSelectedCount from './TableSelectedCount';
import NoDataFound from '../../../commons/NoDataFound';
import TooltipComponent from '../../../lesson/Tooltip';
import { Col, PopoverBody, Row, Spinner } from 'reactstrap';
import prospectService from '../../../../services/prospect.service';
import {
  addressify,
  getKeysWithData,
  numbersWithComma,
  roundNumbers,
} from '../../../../utils/Utils';
import ButtonIcon from '../../../commons/ButtonIcon';
import ProspectResults from '../ProspectResults';
import { ProspectTypes } from '../constants';
import { Link } from 'react-router-dom';
import routes from '../../../../utils/routes.json';
import ProfilePicOrFallbackAvatar from '../../../commons/ProfilePicOrFallbackAvatar';
import TableStartSearchPlaceholder from './TableStartSearchPlaceholder';
import { usePagesContext } from '../../../../contexts/pagesContext';

const constants = constantsString.deals.prospecting;

const SearchButton = ({ onClick }) => (
  <InputGroup.Text
    role="button"
    onClick={onClick}
    className="position-absolute border-0 p-0 z-10"
    style={{ top: 13, left: 10 }}
  >
    <MaterialIcon icon="search" />
  </InputGroup.Text>
);

const SearchInput = forwardRef(
  ({ value, onChange, onClear, onSearch }, ref) => (
    <div className="p-3">
      <FormGroup className="position-relative" size="sm">
        <SearchButton onClick={onSearch} />
        <FormControl
          id="search-input"
          ref={ref}
          aria-label="Search"
          className={`form-control w-100 rounded px-5`}
          placeholder="Search"
          value={value}
          onChange={onChange}
          onKeyDown={onSearch}
        />
        {value && <ResetButton onClick={onClear} show={true} />}
      </FormGroup>
    </div>
  )
);

SearchInput.displayName = 'SearchInput';

const ResetButton = ({ onClick, show = true }) =>
  show && (
    <Button
      variant="link"
      className="border-0 pl-0 p-0 position-absolute"
      style={{ top: 13, right: 10 }}
      size="sm"
      onClick={onClick}
    >
      <span className="material-icons-outlined search-close">close</span>
    </Button>
  );

const NameColumn = ({ prospect }) => {
  return (
    <RocketReachPeopleCard
      prospect={prospect}
      showSocialLinks
      withCompany={false}
      withLocation={false}
      avatarStyle={{ width: 50, height: 50 }}
      containerStyle="pt-1 pb-3"
    />
  );
};

const RocketReachCompanyProfile = ({ prospect }) => {
  // load company details when hover on, so...
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState({});
  const [isOpened, setIsOpened] = useState(false);
  const [noDataFound, setNoDataFound] = useState(false);

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const { data } = await prospectService.query(
        { name: [prospect.employer || prospect.current_employer] },
        {
          page: 1,
          limit: 1,
          type: ProspectTypes.company,
        }
      );

      if (data?.data?.length) {
        setCompany(data?.data[0]);
      } else {
        setCompany({});
        setNoDataFound(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isOpened && loadCompany();
  }, [isOpened]);

  const OrgItemRow = ({ children }) => {
    return <Row className="my-1">{children}</Row>;
  };

  const Title = () => {
    return <h5 className="mb-0">No company details found.</h5>;
  };

  // TODO: this overlay trigger needs to be a generic component, will make it.
  return (
    <>
      <OverlayTrigger
        trigger={['hover', 'focus']}
        show={isOpened}
        placement="bottom"
        onToggle={setIsOpened}
        overlay={
          isLoading ? (
            <Popover className="rounded">
              <PopoverBody className="py-2 px-3">
                <Spinner className="text-primary spinner-grow-xs" />
              </PopoverBody>
            </Popover>
          ) : (
            <Popover style={{ minWidth: 300 }} className="rounded">
              <PopoverBody className={noDataFound ? 'py-2 px-0' : ''}>
                <>
                  {noDataFound ? (
                    <NoDataFound
                      title={<Title />}
                      icon="search"
                      iconStyle="font-size-2em"
                      containerStyle="w-100 text-gray-900 py-2 my-0"
                    />
                  ) : (
                    <>
                      <Row className="mb-2">
                        <Col>
                          <div className="d-flex align-items-center gap-1">
                            <ProfilePicOrFallbackAvatar
                              prospect={company}
                              style={{ width: 40, height: 40 }}
                            />
                            <h5>
                              {prospect.employer || prospect.current_employer}
                            </h5>
                          </div>
                        </Col>
                      </Row>
                      {company.domain && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Website
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8">{company.domain}</p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {company.ticker && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Ticker
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8">{company.ticker}</p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {company.revenue && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Revenue
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8">
                              ${roundNumbers(company.revenue, 'long', 2)}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {company.employees && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Employees
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8 text-capitalize">
                              {numbersWithComma(company.employees)}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {(company.founded || company.year_founded) && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Founded
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8 text-capitalize">
                              {company.founded || company.year_founded}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                      <OrgItemRow>
                        <Col md={4}>
                          <p className="mb-0 fs-8 font-weight-semi-bold">
                            Address
                          </p>
                        </Col>
                        <Col md={8}>
                          <p className="mb-0 fs-8 text-capitalize">
                            {addressify(company, 'company')}
                          </p>
                        </Col>
                      </OrgItemRow>
                      {company.phone && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Phone
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8 text-capitalize">
                              {company.phone}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {company.fax && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Fax
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8 text-capitalize">
                              {company.fax}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {company.industry && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              Category
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8 text-capitalize">
                              {company.industry}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {company.sic && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              SIC
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8 text-capitalize">
                              {company.sic}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                      {company.naics && (
                        <OrgItemRow>
                          <Col md={4}>
                            <p className="mb-0 fs-8 font-weight-semi-bold">
                              NAICS
                            </p>
                          </Col>
                          <Col md={8}>
                            <p className="mb-0 fs-8 text-capitalize">
                              {company.naics}
                            </p>
                          </Col>
                        </OrgItemRow>
                      )}
                    </>
                  )}
                </>
              </PopoverBody>
            </Popover>
          )
        }
      >
        <Link
          to={`${routes.resourcesOrganization.replace(
            ':name',
            prospect.employer
          )}?tab=${ProspectTypes.people}`}
          className="prospect-typography-h6 cursor-pointer hoverLink p-0 m-0"
        >
          <span className="hoverLink text-wrap">{prospect.employer}</span>
        </Link>
      </OverlayTrigger>
    </>
  );
};

const CompanyColumn = ({ prospect }) => {
  return (
    <>
      {prospect.employer && prospect.employer.toLowerCase() !== 'undefined' ? (
        <RocketReachCompanyProfile prospect={prospect} />
      ) : (
        ''
      )}
    </>
  );
};

const LocationColumn = ({ prospect }) => {
  return (
    <>
      {prospect.location ? (
        <p className="prospect-typography-h6 text-wrap p-0 m-0">
          <span className="text-gray-900">
            {prospect.location ? (
              <span>{prospect.location}</span>
            ) : (
              <span>
                {prospect.city && <span>{prospect.city}</span>}
                {prospect.state && <span>, {prospect.state}</span>}{' '}
              </span>
            )}
          </span>
        </p>
      ) : (
        ''
      )}
    </>
  );
};

const ContactInfoColumn = ({ prospect, setProspect }) => {
  return (
    <RocketReachViewInfoCard
      prospect={prospect}
      setProspect={setProspect}
      layout="column"
    />
  );
};

const TablePeopleProspect = ({
  data = [],
  checkbox = false,
  pagination,
  onPageChange,
  selectedProspects,
  setSelectedProspects,
  onHandleEdit,
  domain,
  selectAll,
  setSelectAll,
  onSearch,
  showLoading,
  chargeFilter,
  importProspects,
  exportProspects,
  clearSelection,
  filter,
  setErrorMessage,
  setSuccessMessage,
  permissionExportImport,
}) => {
  const { globalFilters } = useFilterProspectContext();
  const [localFilter, setLocalFilter] = useState(globalFilters);
  const [searchClicked, setSearchClicked] = useState(false);

  const updateProspects = (prospect) => {
    const newProspects = [...selectedProspects];
    newProspects.forEach((pros) => {
      if (pros.id === prospect.id) {
        pros.emails_list = prospect.emails_list;
        pros.phones_list = prospect.phones_list;
      }
    });
    setSelectedProspects(newProspects);
  };

  const rows = data.map((item) => {
    const response = {
      ...item,
      dataRow: [
        {
          key: 'Name',
          component: <NameColumn prospect={item} />,
        },
        {
          key: 'Company',
          component: <CompanyColumn prospect={item} />,
        },
        {
          key: 'Location',
          component: <LocationColumn prospect={item} />,
        },
        {
          key: 'Available Details',
          component: (
            <ContactInfoColumn
              prospect={item}
              setProspect={(item) => updateProspects(item)}
            />
          ),
        },
      ],
    };

    return response;
  });

  const componentAction = (
    <>
      {permissionExportImport.import ? (
        <TooltipComponent
          title={`${
            permissionExportImport.import
              ? constants.importLabel + ' Profile'
              : 'Imports Disabled.'
          }`}
        >
          <button
            type="button"
            className="btn d-flex align-items-center justify-content-center btn-success btn-xs text-white"
          >
            {' '}
            <MaterialIcon icon="add" />{' '}
          </button>
        </TooltipComponent>
      ) : (
        <></>
      )}
    </>
  );

  const handleOnEdit = (row) => {
    if (!permissionExportImport.import) {
      return;
    }

    onHandleEdit(row);
  };
  const { pageContext, setPageContext } = usePagesContext();

  useEffect(() => {
    setLocalFilter(globalFilters);
    const filters = getKeysWithData(globalFilters);
    setSearchClicked(!!Object.keys(filters).length);
    setPageContext({
      ...pageContext,
      PeopleSearch: { global: globalFilters, local: filters },
    });
  }, [globalFilters]);

  return (
    <>
      <Card>
        <Card.Header className="border-bottom d-flex prospect-detail-heading align-items-center justify-between">
          <h4 className="mb-0">People</h4>
          {data && data.length > 0 && (
            <div>
              {domain && <span className="fw-bold">Contacts at {domain}</span>}
              {pagination?.total && (
                <ProspectResults
                  pagination={pagination}
                  filter={localFilter}
                  type={ProspectTypes.people}
                  setErrorMessage={setErrorMessage}
                  setSuccessMessage={setSuccessMessage}
                />
              )}
            </div>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          {showLoading && (
            <div className="px-3 pt-3">
              <LookupPeopleLoader
                count={7}
                circle={<Skeleton height={60} width={60} circle />}
                container
              />
            </div>
          )}

          {selectedProspects.length > 0 && (
            <TableSelectedCount
              list={selectedProspects}
              containerPadding="p-3"
              btnClick={importProspects}
              btnClass="btn-sm text-white"
              btnIcon="add"
              btnLabel="Import Profiles"
              btnColor="success"
              onClear={clearSelection}
              customButton={
                <>
                  {permissionExportImport.import && (
                    <ButtonIcon
                      onclick={importProspects}
                      icon="add"
                      label="Import Profiles"
                      classnames={`btn-sm text-white ${
                        permissionExportImport.import
                          ? ''
                          : 'd-flex align-items-center justify-content-center'
                      }`}
                      color="success"
                      tooltip={
                        !permissionExportImport.import ? 'Imports Disabled' : ''
                      }
                    />
                  )}
                  {permissionExportImport.export && (
                    <ButtonIcon
                      onclick={exportProspects}
                      icon="file_download"
                      label="Export Profiles"
                      classnames="btn-sm ml-2"
                      color="outline-primary"
                    />
                  )}
                </>
              }
            />
          )}

          {showLoading ? (
            <div className="px-3 pt-3">
              <LookupPeopleLoader
                count={7}
                circle={<Skeleton height={60} width={60} circle />}
                container
              />
            </div>
          ) : (
            <>
              {data?.length > 0 || rows.length > 0 ? (
                <Table
                  className={`prospect-table`}
                  checkbox={
                    permissionExportImport.import ||
                    permissionExportImport.export
                  }
                  selectedData={selectedProspects}
                  setSelectedData={setSelectedProspects}
                  columns={columnsTablePeople}
                  data={rows}
                  showLoading={showLoading}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={onPageChange}
                  onHandleEdit={handleOnEdit}
                  componentAction={componentAction}
                  title="prospects"
                  usePagination
                  dataInDB={rows.length > 9}
                  noDataInDbValidation
                />
              ) : (
                <>
                  {searchClicked ? (
                    <TableStartSearchPlaceholder
                      title="No Results Found."
                      description="Results matching this query could not be displayed. Please try refining your search or clearing some of your filters."
                    />
                  ) : (
                    <TableStartSearchPlaceholder />
                  )}
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default TablePeopleProspect;
