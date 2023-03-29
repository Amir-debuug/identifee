import React, { useEffect, useState } from 'react';
import { options } from './ManageUsers.constants';
import ButtonFilterDropdown from '../commons/ButtonFilterDropdown';
import { Dropdown, Tab, Tabs } from 'react-bootstrap';
import MaterialIcon from '../commons/MaterialIcon';
import AutoComplete from '../AutoComplete';
import roleService from '../../services/role.service';

export default function Filters({
  openFilter,
  setOpenFilter,
  filterTabs,
  setFilterTabs,
  filterOptionSelected,
  handleFilterSelect,
  onHandleFilterUsers,
  clearFilters,
}) {
  const [roleData, setRoleData] = useState([]);
  const filterKeys = options.map((k) => k.id);
  const [filterSearch, setFilterSearch] = useState({
    name: !filterKeys.includes(filterOptionSelected?.id)
      ? filterOptionSelected?.title || ''
      : '',
  });

  const getRoles = async (search = '') => {
    const searchResults = await roleService
      .GetRoles({ filter: { search } })
      .catch((err) => console.log(err));

    const { data } = searchResults || {};
    setRoleData(data);
  };

  const onAutocompleteChange = async (e) => {
    const { value } = e.target;
    setFilterSearch({ name: value });
    getRoles(value);
    if (!value) {
      clearFilters();
    }
  };

  const onHandleFilterRole = (role) => {
    onHandleFilterUsers(role);
  };

  useEffect(() => {
    if (filterTabs === 'profiles') {
      getRoles();
    }
  }, [filterTabs]);

  return (
    <>
      <ButtonFilterDropdown
        filterOptionSelected={filterOptionSelected}
        options={options}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        customKeys={['id', 'title']}
        handleFilterSelect={handleFilterSelect}
      >
        <Dropdown.Menu className="p-0" style={{ minWidth: 320 }}>
          <Tabs
            fill
            justify
            id="controlled-tab-example"
            activeKey={filterTabs}
            onSelect={(k) => {
              setFilterTabs(k);
            }}
            className="mb-1 w-100 idf-tabs"
          >
            <Tab
              eventKey="profiles"
              title={
                <span>
                  <MaterialIcon icon="person" /> <span> Profile </span>
                </span>
              }
            >
              <div className="p-3">
                <AutoComplete
                  id={'searchForProfile'}
                  placeholder={'Search for Profile'}
                  name={'searchForProfile'}
                  showAvatar={false}
                  loading={false}
                  onChange={onAutocompleteChange}
                  data={roleData}
                  showIcon={false}
                  onHandleSelect={(item) => {
                    onHandleFilterRole(item);
                  }}
                  customKey="name"
                  selected={filterSearch?.name || ''}
                />
              </div>
            </Tab>
            <Tab
              eventKey="statuses"
              title={
                <span>
                  <MaterialIcon icon="filter_list" /> <span> Status </span>
                </span>
              }
            >
              <div className="py-1 idf-dropdown-item-list">
                {options.map((option) => (
                  <Dropdown.Item
                    key={option.id}
                    href="#"
                    onClick={(e) => handleFilterSelect(e, option)}
                    className="px-3"
                  >
                    <div className="d-flex align-items-center justify-content-between py-1">
                      <span
                        className={
                          filterOptionSelected.id === option.id ? 'fw-bold' : ''
                        }
                      >
                        {option.title}
                      </span>
                      {filterOptionSelected.id === option.id && (
                        <MaterialIcon icon="check" clazz="fw-bold" />
                      )}
                    </div>
                  </Dropdown.Item>
                ))}
              </div>
            </Tab>
          </Tabs>
        </Dropdown.Menu>
      </ButtonFilterDropdown>
    </>
  );
}
