import React, { forwardRef, useEffect, useState } from 'react';
import {
  Button,
  Card,
  FormControl,
  FormGroup,
  InputGroup,
} from 'react-bootstrap';

import Table from '../../../GenericTable';
import { columnsTableCompany } from '../../constants';
import MaterialIcon from '../../../commons/MaterialIcon';
import LookupPeopleLoader from '../../../loaders/LookupPeople';
import Skeleton from 'react-loading-skeleton';
import { useFilterProspectContext } from '../../../../contexts/filterProspectContext';
import TableSelectedCount from './TableSelectedCount';
import RocketReachPeopleCard from '../../../organizationProfile/overview/RocketReachPeopleCard';
import RocketReactCompanyDetails from '../../../organizationProfile/overview/RocketReactCompanyDetails';
import ButtonIcon from '../../../commons/ButtonIcon';
import { ProspectTypes } from '../constants';
import ProspectResults from '../ProspectResults';
import { addressify, getKeysWithData } from '../../../../utils/Utils';
import TableStartSearchPlaceholder from './TableStartSearchPlaceholder';
import { usePagesContext } from '../../../../contexts/pagesContext';

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

const CompanyColumn = ({ prospect, chargeFilter, refreshView }) => {
  return (
    <RocketReachPeopleCard
      prospect={{ ...prospect, full_name: prospect.name }}
      showSocialLinks
      withCompany={false}
      isCompanyProfile={true}
      withLocation={false}
      avatarStyle={{ width: 50, height: 50 }}
      containerStyle={'pt-1 pb-3'}
      chargeFilter={chargeFilter}
      refreshView={refreshView}
    />
  );
};

const LocationColumn = ({ prospect }) => {
  return (
    <p
      className="prospect-typography-h6 text-wrap p-0 m-0 font-size-sm2"
      style={{ maxWidth: 180 }}
    >
      {addressify(prospect, 'company')}
    </p>
  );
};

const CompanyInfoColumn = ({ prospect }) => {
  return (
    <p className="prospect-typography-h6 text-wrap p-0 m-0">
      <RocketReactCompanyDetails prospect={prospect} />
    </p>
  );
};

const TableCompanyProspect = ({
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
  clearSelection,
  refreshView,
  setErrorMessage,
  setSuccessMessage,
  permissionExportImport,
}) => {
  const { globalFiltersCompany } = useFilterProspectContext();
  const [localFilter, setLocalFilter] = useState(globalFiltersCompany);
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
          key: 'Company',
          component: (
            <CompanyColumn
              prospect={item}
              chargeFilter={chargeFilter}
              refreshView={refreshView}
            />
          ),
        },
        {
          key: 'Location',
          component: <LocationColumn prospect={item} />,
        },
        {
          key: 'Details',
          component: (
            <CompanyInfoColumn
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
    <ButtonIcon
      icon="search"
      label="Employees"
      className="btn btn-success btn-xs text-white"
    />
  );

  const { pageContext, setPageContext } = usePagesContext();

  useEffect(() => {
    setLocalFilter(globalFiltersCompany);
    const filters = getKeysWithData(globalFiltersCompany);
    setSearchClicked(!!Object.keys(filters).length);

    setPageContext({
      ...pageContext,
      CompanySearch: { global: globalFiltersCompany, local: filters },
    });
  }, [globalFiltersCompany]);

  return (
    <>
      <Card>
        <Card.Header className="border-bottom prospect-detail-heading d-flex align-items-center justify-between">
          <h4 className="mb-0">Companies</h4>
          {data && data.length > 0 && (
            <div>
              {pagination?.total && (
                <ProspectResults
                  pagination={pagination}
                  filter={localFilter}
                  type={domain ? ProspectTypes.domain : ProspectTypes.company}
                  setErrorMessage={setErrorMessage}
                  setSuccessMessage={setSuccessMessage}
                />
              )}
            </div>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          {selectedProspects.length > 0 && (
            <TableSelectedCount
              list={selectedProspects}
              containerPadding="p-3"
              btnClick={importProspects}
              btnClass="btn-sm text-white"
              btnIcon="add"
              btnLabel="Import Companies"
              btnColor="success"
              onClear={clearSelection}
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
                  checkbox={permissionExportImport.import}
                  selectedData={selectedProspects}
                  setSelectedData={setSelectedProspects}
                  columns={columnsTableCompany}
                  data={rows}
                  showLoading={showLoading}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={onPageChange}
                  onHandleEdit={(item) => onHandleEdit(item, true)}
                  onClick={(item) => onHandleEdit(item, false)}
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

export default TableCompanyProspect;
