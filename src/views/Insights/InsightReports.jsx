import React, { useEffect, useState, useContext } from 'react';
import { Accordion, Card, Col, Row } from 'react-bootstrap';
import { NO_REPORT_SELECTED } from '../../utils/constants';
import Alert from '../../components/Alert/Alert';
import { processableExamples, SwitchAllReports } from './SwitchAllReports';
import { cubeService } from '../../services';
import AlertWrapper from '../../components/Alert/AlertWrapper';
import NoDataFound from '../../components/commons/NoDataFound';
import DashboardService from '../../services/dashboard.service';
import {
  DATE_FORMAT,
  scrollToTop,
  isMatchInCommaSeperated,
} from '../../utils/Utils';
import DashboardComponent from '../Overview/dashboard/DashboardComponent';
import MaterialIcon from '../../components/commons/MaterialIcon';
import Skeleton from 'react-loading-skeleton';
import DatePicker from '../../components/dealsBreakdown/DatePicker';
import moment from 'moment';
import { DASHBOARD_ICONS } from '../Overview/dashboard/dashboard.constants';
import { TenantContext } from '../../contexts/TenantContext';
import { useHistory } from 'react-router';

const ReportSkeletonLoader = ({ rows }) => {
  const [rowCount] = useState(Array(rows).fill(0));
  const Circle = ({ children }) => {
    return (
      <div className="rounded-circle" style={{ height: 20, width: 20 }}>
        {children}
      </div>
    );
  };
  return (
    <>
      {rowCount.map((r, idx) => (
        <div key={idx} className="d-flex col py-1 align-items-center">
          <Circle>
            <Skeleton circle style={{ borderRadius: '50%', lineHeight: 1.3 }} />
          </Circle>
          <div className="w-100 ml-2">
            <Skeleton height="5" />
          </div>
        </div>
      ))}
    </>
  );
};

const format = DATE_FORMAT;

const InsightReports = () => {
  const [dashboardList, setDashboardList] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState({});
  const { tenant } = useContext(TenantContext);
  const [insightReport, setInsightReport] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardComponents, setDashboardComponents] = useState([]);
  const [dashboardWithComponents, setDashboardWithComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState({});
  const [query, setQuery] = useState({});
  const [dateRange, setDateRange] = useState({});
  const history = useHistory();

  useEffect(() => {
    if (selectedComponent?.component) {
      const updatedTimeDimensions = [
        ...selectedComponent?.component?.analytic?.timeDimensions,
      ];
      if (updatedTimeDimensions && updatedTimeDimensions.length) {
        delete updatedTimeDimensions[0]?.compareDateRange;
        updatedTimeDimensions[0].dateRange = [
          moment(dateRange.startDate).format(format),
          moment(dateRange.endDate).format(format),
        ];
      }
      const queryBackup = {
        ...selectedComponent,
        component: {
          ...selectedComponent.component,
          analytic: {
            ...selectedComponent.component.analytic,
            timeDimensions: updatedTimeDimensions,
          },
        },
      };

      setSelectedComponent({});
      setQuery({});
      scrollToTop();

      setDashboardComponents(
        [...dashboardComponents].map((comp) => ({
          ...comp,
          component:
            comp.componentId === queryBackup.componentId
              ? queryBackup.component
              : comp.component,
        }))
      );

      setTimeout(() => {
        setQuery(queryBackup.component.analytic);
        setSelectedComponent(queryBackup);
      });
    }
  }, [dateRange]);

  const dashboardComponentConfig = {
    hideActions: true,
    headingWithoutDash: true,
    wrap: 'text-nowrap', // for wrapping/truncate
  };

  const getDefaultReports = (analytics) => {
    const typeMap = {
      Course: 'TRAINING REPORTS',
      CourseProgress: 'TRAINING REPORTS',
      Deal: 'DEALS REPORTS',
      Lesson: 'TRAINING REPORTS',
      LessonProgress: 'TRAINING REPORTS',
    };
    return analytics.reduce(
      (acc, analytic, idx) => {
        if (!processableExamples[analytic.name]) {
          return acc;
        }
        const type = typeMap[analytic.type];
        acc[type].push({
          ...analytic,
          id: idx,
          insightName: processableExamples[analytic.name],
        });

        return acc;
      },
      {
        'DEALS REPORTS': [],
        'TRAINING REPORTS': [],
      }
    );
  };

  const getDashboardComponents = (dashboard) => {
    return (
      dashboardWithComponents.find((d) => d.dashboard.id === dashboard.id)
        ?.components || []
    );
  };

  const getDashboardFromList = (list, dashId) => {
    return list.find(({ dashboard }) => dashboard.id === dashId) || {};
  };

  const getComponentFromList = (list, cId) => {
    return list.find((cmp) => cmp.componentId === cId) || {};
  };

  const buildLegacyReports = (dashboard, list) => {
    return [...list].map((l) => {
      return {
        component: {
          ...l,
          componentId: l.id,
          analytic: l,
        },
        insightName: l.name,
        rptType: 'legacy',
        componentId: l.id,
        dashboardId: dashboard.id,
      };
    });
  };

  const getDashboards = async () => {
    setLoading(true);

    const urlParams = new URLSearchParams(history.location.search);
    const dashId = urlParams.get('dashboard');
    const componentId = urlParams.get('component');

    const requests = [];
    requests.push(cubeService.getAnalytics({ isPublic: true }));
    requests.push(DashboardService.getDashboards());

    const responses = await Promise.all(requests);
    const defaultReports = getDefaultReports(responses[0]); // this comes as object
    const { data } = responses[1];
    const dashboards = data.map((d) => ({
      ...d,
      key: d.id,
    }));
    const uniqueDashboards = dashboards.filter((dashboard) => {
      const settingsInput = 'Dashboard_' + dashboard?.name;
      return (
        tenant.modules === '*' ||
        isMatchInCommaSeperated(tenant.modules, settingsInput)
      );
    });
    const componentsRequest = uniqueDashboards.map((dashboard) => {
      return DashboardService.getDashboardsComponents(dashboard.id);
    });
    const componentsResponse = await Promise.all(componentsRequest);

    let dashboardWithComponents = componentsResponse
      .map((dwc) => {
        return {
          dashboard: uniqueDashboards.find(
            (ud) => ud.id === dwc.data[0]?.dashboardId
          ),
          components: dwc.data,
        };
      })
      .filter((f) => f.components.length);

    // updating Training with default/legacy reports too
    dashboardWithComponents = dashboardWithComponents.map((dwc) => ({
      ...dwc,
      components:
        dwc.dashboard.name === 'Training'
          ? [
              ...dwc.components,
              ...buildLegacyReports(
                dwc.dashboard,
                defaultReports['TRAINING REPORTS']
              ),
            ]
          : dwc.components,
    }));
    setLoading(false);
    const first = dashId
      ? getDashboardFromList(dashboardWithComponents, dashId)
      : uniqueDashboards[0];

    setDashboardList(uniqueDashboards);
    setSelectedDashboard(first?.dashboard || first);
    setDashboardWithComponents(dashboardWithComponents);
    setDashboardComponents(
      first?.components || dashboardWithComponents[0]?.components
    );

    if (componentId) {
      const component = getComponentFromList(first?.components, componentId);
      const updatedDashboardComponents = [...first?.components].map((comp) => ({
        ...comp,
        isActive: comp.componentId === component.componentId,
      }));
      setDashboardComponents(updatedDashboardComponents);
      setTimeout(() => {
        setQuery(component.component.analytic);
        setSelectedComponent(component);
      });
    }
  };

  useEffect(() => {
    getDashboards();
  }, []);

  useEffect(() => {
    setDashboardComponents(getDashboardComponents(selectedDashboard));
  }, [selectedDashboard]);

  const Title = () => {
    return <div className="text-muted">{NO_REPORT_SELECTED}</div>;
  };

  const TitleNoReports = () => {
    return <div className="text-muted font-size-md">No reports available</div>;
  };

  const handleComponentClick = (dashboardId, component) => {
    setInsightReport({});
    setSelectedComponent({});
    setQuery({});
    scrollToTop();
    if (component?.rptType === 'legacy') {
      setTimeout(() => {
        setSelectedComponent(component);
        setInsightReport(component?.component);
      });
    } else {
      setTimeout(() => {
        setQuery(component.component.analytic);
        setSelectedComponent(component);
      });
    }
  };

  const renderCollapseOfDashboard = (dashboard) => {
    const components = getDashboardComponents(dashboard);
    const subComponents = components.filter(
      (i) => i.dashboardId === dashboard.id
    );
    if (subComponents) {
      return (
        <>
          {subComponents.map((component) => (
            <>
              <Row
                key={component.id}
                onClick={() =>
                  handleComponentClick(component?.dashboard?.id, component)
                }
                className={`cursor-pointer align-items-center p-2 px-3 nav-link item-filter ${
                  selectedComponent?.component?.id === component.component.id
                    ? 'bg-primary text-white active'
                    : ''
                }`}
              >
                <Col>
                  <p className="d-flex align-items-center py-0 my-0">
                    <MaterialIcon
                      icon={DASHBOARD_ICONS[selectedDashboard?.name]}
                      clazz="mr-1"
                    />
                    <span className="font-weight-medium text-truncate font-size-sm2 mb-0">
                      {component.component.name?.split('-')[0]?.trim()}
                    </span>
                  </p>
                </Col>
              </Row>
            </>
          ))}
        </>
      );
    } else {
      return <></>;
    }
  };

  const shouldShowDatePicker = () => {
    const keys = Object.keys(selectedComponent).length;
    return keys && selectedComponent.rptType !== 'legacy';
  };

  return (
    <div>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <Row className="mt-1">
        <Col xl={3} md={3} className="mb-3">
          <Card className="bg-transparent border-0 shadow-none">
            {loading && (
              <>
                <Accordion defaultActiveKey={1} key={1}>
                  <Card>
                    <Accordion.Toggle
                      as={Card.Header}
                      onClick={() => {
                        setActive(!active);
                      }}
                      eventKey={1}
                      className="nav-subtitle card-title text-hover-primary cursor-pointer font-size-sm text-muted font-weight-semibold text-capitalize"
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <h4 className="mb-0">{'My Reports'}</h4>
                        <MaterialIcon
                          icon={active ? 'expand_more' : 'expand_less'}
                        />
                      </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={1}>
                      <Card.Body className="p-1">
                        <ReportSkeletonLoader rows={15} />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </>
            )}
            {dashboardList.map((i, index) => {
              return (
                <>
                  <Accordion defaultActiveKey={index === 0 && i.id} key={i.id}>
                    <Card>
                      <Accordion.Toggle
                        as={Card.Header}
                        onClick={() => {
                          setActive(!active);
                        }}
                        eventKey={i.id}
                        className="nav-subtitle card-title text-hover-primary cursor-pointer font-size-sm text-muted font-weight-semibold text-capitalize"
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <h4 className="mb-0">{i.name}</h4>
                          <MaterialIcon
                            icon={active ? 'expand_more' : 'expand_less'}
                          />
                        </div>
                      </Accordion.Toggle>
                      <Accordion.Collapse eventKey={i.id}>
                        <Card.Body className="p-1">
                          {
                            <>
                              {loading ? (
                                <ReportSkeletonLoader rows={15} />
                              ) : (
                                <>
                                  {dashboardComponents?.length > 0 ? (
                                    <> {renderCollapseOfDashboard(i)} </>
                                  ) : (
                                    <NoDataFound
                                      title={<TitleNoReports />}
                                      icon="analytics"
                                      containerStyle="w-100 text-muted h-100"
                                      iconStyle="font-size-2xl"
                                    />
                                  )}
                                </>
                              )}
                            </>
                          }
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </>
              );
            })}
          </Card>
        </Col>
        <Col xl={9} md={12} className="pl-0 position-relative">
          <div
            className="position-absolute z-index-5"
            style={{
              top: 15,
              right: 35,
              pointerEvents: shouldShowDatePicker() ? '' : 'none',
              opacity: shouldShowDatePicker() ? 1 : 0,
            }}
          >
            <DatePicker
              range={dateRange}
              setRange={setDateRange}
              extraClass="p-0"
            />
          </div>
          {selectedComponent?.component || insightReport?.insightName ? (
            <>
              {insightReport?.insightName ? (
                SwitchAllReports({
                  insight: { ...insightReport },
                  insightName: insightReport.insightName,
                })
              ) : (
                <DashboardComponent
                  item={selectedComponent}
                  query={query}
                  componentHeight={'auto'}
                  config={dashboardComponentConfig}
                />
              )}
            </>
          ) : (
            <NoDataFound
              title={<Title />}
              icon="analytics"
              containerStyle="w-100 height-300 text-muted"
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default InsightReports;
