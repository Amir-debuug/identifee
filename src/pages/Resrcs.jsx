import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { useLocation } from 'react-router-dom';

import Heading from '../components/heading';
import { TabsContext } from '../contexts/tabsContext';
import ProspectSearch from './Prospects-rocket';
import News from './News';
import AnimatedTabs from '../components/commons/AnimatedTabs';

const Resrcs = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(1);
  const { activatedTab, setActivatedTab } = useContext(TabsContext);

  useEffect(() => {
    if (activatedTab[location.pathname]) {
      setActiveTab(activatedTab[location.pathname]);
    }
  }, []);

  const tabsData = [
    {
      title: 'Prospects',
      icon: 'feed',
      tabId: 1,
      permission: {
        collection: 'prospects',
        action: 'view',
      },
    },
    {
      title: 'News',
      icon: 'person_search',
      tabId: 2,
    },
  ];

  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);

      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
    }
  };

  return (
    <>
      <div className="resources-title mb-1">
        <Heading title="" useBc showGreeting={false}>
          <AnimatedTabs
            tabsData={tabsData}
            activeTab={activeTab}
            toggle={toggle}
            permissionCheck={true}
          />
        </Heading>
      </div>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <ProspectSearch />
        </TabPane>
        <TabPane tabId={2}>
          <News />
        </TabPane>
      </TabContent>
    </>
  );
};

export default Resrcs;
