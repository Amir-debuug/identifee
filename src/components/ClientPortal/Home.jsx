import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane, Card, CardBody } from 'reactstrap';
import { TabsContext } from '../../contexts/tabsContext';
import DataTab from './Tabs/DataTab';
import { PublicVideo } from './Tabs/Video';
import './style.css';
import AnimatedTabs from '../commons/AnimatedTabs';

const Home = ({ contactId, organizationId }) => {
  const [activeTabId, setActiveTabId] = useState(0);
  const { activatedTab, setActivatedTab } = useContext(TabsContext);

  const tabsData = [
    {
      title: 'Data',
      component: <DataTab organizationId={organizationId} />,
      tabId: 0,
    },
    {
      title: 'Videos',
      component: <PublicVideo />,
      tabId: 1,
    },
  ];

  useEffect(() => {
    if (activatedTab[location.pathname]) {
      setActiveTabId(activatedTab[location.pathname]);
    }
  }, []);

  const toggle = (tabId) => {
    if (activeTabId !== tabId) {
      setActiveTabId(tabId);

      setActivatedTab({
        [location.pathname]: tabId,
      });
    }
  };

  return (
    <div className="col-lg-7">
      <Card className="shadow">
        <CardBody className="p-0">
          <div className="border-bottom w-100 pt-2">
            <AnimatedTabs
              tabsData={tabsData}
              activeTab={activeTabId}
              toggle={(tab) => toggle(tab.tabId)}
              tabClasses="nav-justified link-active-wrapper w-100 nav-sm-down-break"
            />
          </div>
          <TabContent>
            <TabPane className="mt-1">
              {tabsData.find((item) => item.tabId === activeTabId)?.component}
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </div>
  );
};

export default Home;
