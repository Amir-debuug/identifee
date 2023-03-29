import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { useLocation } from 'react-router-dom';

import Categories from '../views/settings/Resources/Categories';
import Heading from '../components/heading';
import ManageLessons from '../pages/ManageLessons';
import { TabsContext } from '../contexts/tabsContext';
import Courses from '../views/settings/Resources/Courses';
import QuizConfigurationForm from '../components/quizConfiguration/QuizConfigurationForm';
import AnimatedTabs from '../components/commons/AnimatedTabs';

const Resources = () => {
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
      title: 'Lessons',
      component: <ManageLessons />,
      icon: 'list_alt',
      tabId: 1,
    },
    {
      title: 'Courses',
      component: <Courses />,
      icon: 'summarize',
      tabId: '3',
    },
    {
      title: 'Categories',
      component: <Categories />,
      icon: 'category',
      tabId: 2,
    },
    {
      title: 'Configure',
      component: <QuizConfigurationForm />,
      tabId: 4,
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
      <Heading title="Resources" useBc showGreeting={false}>
        <AnimatedTabs
          tabsData={tabsData}
          activeTab={activeTab}
          toggle={toggle}
        />
      </Heading>
      <TabContent>
        <TabPane className="position-relative">
          {tabsData.find((item) => item.tabId === activeTab)?.component}
        </TabPane>
      </TabContent>
    </>
  );
};

export default Resources;
