import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import MaterialIcon from './MaterialIcon';

// generic component to filter out table UI data, for ref check MyLessons.js and Training->My Favorites-> Filters top right button
const ButtonFilterDropdown = ({
  buttonText = 'Filters',
  options,
  handleFilterSelect,
  filterOptionSelected,
  btnToggleStyle = 'btn-sm',
  btnAddConfig,
  showOnlyIcon = false,
  menuClass,
  openFilter,
  setOpenFilter,
  customKeys = ['key', 'name'],
  icon,
  children,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown show={openFilter || open} onToggle={setOpenFilter || setOpen}>
      <Dropdown.Toggle
        variant="white"
        className={`btn btn-white dropdown-toggle ${btnToggleStyle}`}
        id="dropdown-basic"
      >
        <div className="d-flex text-left w-100">
          <MaterialIcon
            icon={filterOptionSelected?.icon || icon || 'filter_list'}
            clazz={showOnlyIcon ? '' : 'mr-1'}
          />
          {!showOnlyIcon && (
            <p className="d-inline-block text-truncate mb-0 w-100">
              {filterOptionSelected.name || buttonText}
            </p>
          )}
        </div>
      </Dropdown.Toggle>

      <>
        {children || (
          <Dropdown.Menu className="p-0 py-1 min-w-170 idf-dropdown-item-list">
            <div className={`overflow-y-auto ${menuClass}`}>
              {options.map((option) => (
                <Dropdown.Item
                  key={option.id}
                  href="#"
                  onClick={(e) => handleFilterSelect(e, option)}
                  className="px-3"
                >
                  <div className="d-flex align-items-center justify-content-between py-1">
                    <div className="d-flex align-items-center">
                      {option.icon && (
                        <MaterialIcon icon={option.icon} clazz="mr-2" />
                      )}
                      <span
                        className={
                          filterOptionSelected[customKeys[0]] ===
                          option[customKeys[0]]
                            ? 'fw-bold'
                            : ''
                        }
                      >
                        {option[customKeys[1]]}
                      </span>
                    </div>
                    {filterOptionSelected[customKeys[0]] ===
                      option[customKeys[0]] && (
                      <MaterialIcon icon="check" clazz="fw-bold" />
                    )}
                  </div>
                </Dropdown.Item>
              ))}
            </div>
            {btnAddConfig && (
              <div className="idf-dropdown-item-list">
                <a
                  className="btn-soft-light w-100 dropdown-item btn-block cursor-pointer py-2 px-2 mt-2 border-top"
                  onClick={btnAddConfig.onClick}
                >
                  <div className="d-flex align-items-center">
                    <MaterialIcon icon={btnAddConfig.icon} clazz="mr-1" />
                    <span>{btnAddConfig.text}</span>
                  </div>
                </a>
              </div>
            )}
          </Dropdown.Menu>
        )}
      </>
    </Dropdown>
  );
};

export default ButtonFilterDropdown;
