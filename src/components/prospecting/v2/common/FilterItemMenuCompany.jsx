import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';

import InputSearch from './InputSearch';
import InputDefault from './InputDefault';
import { USACitiesByState } from '../../constants';
import { revenueListNew, employeeCountListNew } from '../constants';
import _ from 'lodash';
import CategoryMenuCompany from '../CategoryMenuCompany';
import InputRange from './InputRange';

// converting city to city, state like pattern
const flattenCitiesList = _.flatten(
  _.values(
    _.mapValues(USACitiesByState, (cities, state) => {
      return cities.map((city) => `${city}, ${state}`);
    })
  )
);

const stepItems = {
  global: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Company Name"
              keyType="global"
              keyFilter="name"
              placeholder="Enter company name search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 11,
      icon: 'domain',
      titleWrapper: 'Company Name',
      keyFilter: ['name'],
      titles: ['Company Name'],
    },
  ],
  domain: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Domain"
              keyType="domain"
              keyFilter="domain"
              placeholder="Enter domain"
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 12,
      icon: 'language',
      keyFilter: ['domain'],
      titles: ['Domain'],
    },
  ],
  location: [
    {
      components: [
        {
          component: (
            <InputSearch
              name="City, State"
              list={flattenCitiesList}
              limit={flattenCitiesList?.length}
              keyType="location"
              keyFilter="location"
              placeholder="Enter city, state search..."
              showLabelColon={false}
            />
          ),
        },
        {
          component: <InputRange keyType="location" keyFilter="radius" />,
        },
      ],
      id: 13,
      icon: 'pin_drop',
      keyFilter: ['location'],
      titles: ['Location'],
    },
  ],
  employer: [
    {
      components: [
        {
          component: (
            <InputSearch
              name="Employee Count"
              limit={9}
              keyType="employer"
              keyFilter="employees"
              customKey="key"
              list={employeeCountListNew}
              placeholder="Enter employee count search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 14,
      icon: 'group',
      titleWrapper: 'Employee Count',
      keyFilter: ['employees'],
      titles: ['Employee Count'],
    },
  ],
  revenue: [
    {
      components: [
        {
          component: (
            <InputSearch
              name="Revenue"
              limit={7}
              list={revenueListNew}
              customKey="key"
              keyType="revenue"
              keyFilter="revenue"
              placeholder="Enter revenue search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 15,
      icon: 'monetization_on',
      titleWrapper: 'Revenue',
      keyFilter: ['revenue'],
      titles: ['Revenue'],
    },
  ],
  industry: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Industry"
              keyType="industry"
              keyFilter="industry"
              placeholder="Enter a industry search..."
              showLabelColon={false}
            />
          ),
        },
        {
          component: (
            <InputDefault
              name="SIC Code"
              keyType="industry"
              keyFilter="sic_code"
              placeholder="Enter a SIC code search..."
              showLabelColon={false}
            />
          ),
        },
        {
          component: (
            <InputDefault
              name="NAICS Code"
              keyType="industry"
              keyFilter="naics_code"
              placeholder="Enter a NAICS code search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 16,
      titleWrapper: 'Industry',
      icon: 'area_chart',
      keyFilter: ['industry', 'sic_code', 'naics_code'],
      titles: ['Industry', 'SIC Code', 'NAICS Code'],
    },
  ],
  technology: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="technology"
              keyType="technology"
              keyFilter="techstack"
              placeholder="Enter a technology search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 18,
      icon: 'apps',
      titleWrapper: 'Technologies',
      keyFilter: ['techstack'],
      titles: ['Technologies'],
    },
  ],
};

const FilterItemMenuCompany = ({
  title,
  data,
  setData,
  onEnter,
  active,
  setActive,
}) => {
  const [activeTap] = useState(true);

  return (
    <div className="w-100">
      <Collapse in={activeTap}>
        <div>
          {Array.isArray(stepItems[title]) ? (
            <CategoryMenuCompany
              stepItems={stepItems}
              title={title}
              data={data}
              setData={setData}
              onEnter={onEnter}
              active={active}
              setActive={setActive}
            />
          ) : (
            <></>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default FilterItemMenuCompany;
