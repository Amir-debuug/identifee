import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { useContext } from 'react';
import Overview from './views/Overview/View';
import MyLessons from './views/Resources/MyLessons';
import Category from './views/Resources/category/Category';
import Lesson from './views/Resources/Lesson';
import CourseBoard from './views/Resources/courses/CourseBoard';
import Login from './pages/Login';
import Reset from './pages/Reset';
import Request from './pages/Request';
import SignUp from './pages/SignUp';
import PrivateRoute from './routes/private';
import Deals from './pages/Deals';
import PipelineDetail from './pages/PipelineDetail';
import Insights from './pages/Insights';
import Settings from './views/settings/Settings';
import ResendInvite from './views/settings/Resources/ResendInvite';
import CaseStudy from './views/Resources/casestudies/CaseStudy';
import CaseStudyVideo from './views/Resources/casestudies/CaseStudyVideo';
import Security from './pages/Security';
import Notification from './pages/Notification';
import SiteSettings from './pages/SiteSettings';
import Users from './pages/Users';
import Resources from './pages/Resources';
import Products from './pages/Products';
import Roles from './pages/Roles';
import PeopleProfile from './pages/PeopleProfile';
import Contacts from './pages/Contacts';
import OrganizationProfile from './pages/OrganizationProfile';
import routes from './utils/routes.json';
import LearningPath from './pages/LearningPath';
import Questionary from './pages/Questionary';
import Accounts from './pages/Accounts';
import Resrcs from './pages/Resrcs';
import CompanyDetail from './components/prospecting/v2/Profile/CompanyDetail';
import UserProfile from './views/settings/ManageUsers/Profile';
import Groups from './pages/Groups';
import ManageRoles from './pages/ManageRoles';
import Unauthorized from './views/Errors/403';
import PeopleDetail from './components/prospecting/v2/Profile/PeopleDetail';
import BulkImportPage from './pages/BulkImport';
import BulkImport from './components/BulkImport';
import Integrations from './pages/Integrations';
import { TenantContext } from './contexts/TenantContext';
import { isModuleAllowed } from './utils/Utils';
import Tenants from './pages/Tenant';
import PipelinesAndStages from './pages/PipelinesAndStages';
import Fields from './pages/Fields';
import WorkFlow from './pages/WorkFlow';
import { WorkFlowDetail } from './components/workFlow/workFlowDetail';
import { useProfileContext } from './contexts/profileContext';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import ProspectCompanyDetails from './pages/ProspectCompanyDetails';
import NotificationsAll from './pages/NotificationsAll';
import Activities from './pages/Activities';
import OrganizationsPage from './pages/Organizations';
import ProfilePage from './pages/ProfilePage';
export const AppRouter = () => {
  const { tenant } = useContext(TenantContext);

  const getRootComponent = (name, component) => {
    if (tenant.modules === '*') return component;
    else if (isModuleAllowed(tenant.modules, name)) {
      return component;
    } else {
      return Overview;
    }
  };
  const { profileInfo } = useProfileContext();
  return (
    <Router>
      <Switch>
        <Route exact path="/sign-up" component={SignUp} />
        <Route exact path="/login" component={Login} />
        {!tenant?.modules && <Route exact path="/" component={Login} />}
        <Route
          exact
          path="/login?access_token=:access_token&refresh_token=:refresh_token"
          component={Login}
        />
        <Route exact path="/request-password" component={Request} />
        <Route exact path="/reset-password" component={Reset} />

        <Route exact path="/clientportal/login" component={ClientLogin} />
        <Route
          exact
          path="/clientportal/dashboard"
          component={ClientDashboard}
        />

        <PrivateRoute exact path={routes.accounts} component={Accounts} />

        <PrivateRoute
          exact
          path={routes.pipeline}
          component={getRootComponent('deals', Deals)}
        />
        <PrivateRoute
          exact
          path={`${routes.pipeline}/:id/activity/:activityId`}
          component={getRootComponent('activities', PipelineDetail)}
        />
        <PrivateRoute
          exact
          path={`${routes.pipeline}/:id`}
          component={PipelineDetail}
        />

        <PrivateRoute
          exact
          path={routes.contacts}
          component={getRootComponent('contacts', Contacts)}
        />
        <PrivateRoute
          exact
          path={routes.companies}
          component={getRootComponent('companies', OrganizationsPage)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:contactId/profile/activity/:activityId`}
          component={getRootComponent('contacts', PeopleProfile)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:contactId/profile`}
          component={getRootComponent('contacts', PeopleProfile)}
        />
        <PrivateRoute
          isSplitView={true}
          path={routes.Activities}
          component={getRootComponent('activities', Activities)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:organizationId/organization/profile/activity/:activityId`}
          component={getRootComponent('companies', OrganizationProfile)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.companies}/:organizationId/organization/profile`}
          component={getRootComponent('companies', OrganizationProfile)}
        />

        <PrivateRoute
          path={routes.insights}
          component={getRootComponent('insights', Insights)}
        />

        <PrivateRoute
          path={routes.favorites}
          component={getRootComponent('training', MyLessons)}
        />
        <PrivateRoute
          path="/training/categories/:slug"
          component={getRootComponent('training', Category)}
        />
        <PrivateRoute
          path="/training/lessons/:id/page/:page_id/course/:course_id"
          component={getRootComponent('training', Lesson)}
        />
        <PrivateRoute
          path="/training/lessons/:id/page/:page_id"
          component={getRootComponent('training', Lesson)}
        />

        <PrivateRoute
          path={routes.lesson}
          component={getRootComponent('training', Lesson)}
        />
        <PrivateRoute
          path="/training/courses/:id"
          exact
          component={getRootComponent('training', CourseBoard)}
        />
        <PrivateRoute
          path="/training/courses/:courseId/take-quiz"
          exact
          component={getRootComponent('training', Questionary)}
        />
        <PrivateRoute
          path="/training/case-studies/:slug"
          component={getRootComponent('training', CaseStudyVideo)}
        />
        <PrivateRoute
          path="/training/case-studies"
          component={getRootComponent('training', CaseStudy)}
        />
        <PrivateRoute
          path="/training/learningPath"
          component={getRootComponent('training', LearningPath)}
        />

        <PrivateRoute
          exact
          path="/settings"
          component={getRootComponent('settings', Settings)}
        />
        <PrivateRoute
          exact
          path="/settings/profile"
          component={getRootComponent('setting_profile', ProfilePage)}
        />
        <PrivateRoute
          path="/settings/security"
          component={getRootComponent('setting_security', Security)}
        />
        <PrivateRoute
          path="/settings/notifications"
          component={getRootComponent('setting_notifications', Notification)}
        />
        <PrivateRoute
          path={routes.notificationsAll}
          component={NotificationsAll}
        />
        <PrivateRoute
          path={routes.branding}
          component={getRootComponent('setting_branding', SiteSettings)}
        />
        <PrivateRoute
          path={routes.integrations}
          component={getRootComponent('setting_integrations', Integrations)}
        />
        <PrivateRoute
          path={routes.pipelinesAndStages}
          component={getRootComponent(
            'setting_pipeline_stages',
            PipelinesAndStages
          )}
        />
        <PrivateRoute path={routes.fields} component={Fields} />
        <PrivateRoute
          path="/settings/bulk-import"
          component={getRootComponent('resources', BulkImportPage)}
          exact
        />
        <PrivateRoute
          path="/settings/bulk-import/:type"
          component={getRootComponent('resources', BulkImport)}
          exact
        />
        <PrivateRoute
          exact
          path={routes.training}
          component={getRootComponent('training', Resources)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/settings/resources/:userId"
          component={getRootComponent('resources', ResendInvite)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/settings/workflow"
          component={WorkFlow}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={`${routes.workflow}/view`}
          component={WorkFlowDetail}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={routes.users}
          component={getRootComponent('setting_profile', Users)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/settings/products"
          component={getRootComponent('setting_products', Products)}
        />

        <PrivateRoute
          requireAdminAccess
          path={`${routes.roles}/:id`}
          component={getRootComponent('setting_profile', Roles)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:organizationId/organization/profile/activity/:activityId`}
          component={getRootComponent('companies', OrganizationProfile)}
        />

        <PrivateRoute
          exact
          path={routes.resources}
          component={getRootComponent('resources', Resrcs)}
        />
        <PrivateRoute
          exact
          path={routes.resourcesOrganization}
          component={ProspectCompanyDetails}
        />
        <PrivateRoute
          exact
          path="/prospects/people/:id"
          component={getRootComponent('contacts', PeopleDetail)}
        />
        <PrivateRoute
          exact
          path="/prospects/company/:id"
          component={getRootComponent('companies', CompanyDetail)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={`${routes.users}/:id`}
          component={ResendInvite}
        />
        <PrivateRoute
          exact
          path={`${routes.usersProfile}/:id`}
          component={UserProfile}
        />
        <PrivateRoute
          requireAdminAccess
          path={`${routes.groups}/:id`}
          component={Groups}
        />
        <PrivateRoute
          requireAdminAccess
          path={`${routes.ManageRoles}/:id`}
          component={ManageRoles}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={routes.tenant}
          component={Tenants}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/training"
          component={Resources}
        />

        {/* Errors views */}

        <PrivateRoute
          exact
          path={routes.errors.Unauthorized}
          component={Unauthorized}
        />
        {!profileInfo?.role?.admin_access && tenant?.modules && (
          <PrivateRoute
            path="/"
            component={getRootComponent('dashboard', Overview)}
          />
        )}
        {profileInfo?.role?.admin_access && (
          <>
            {window.location.pathname === '/tenants' ||
            window.location.pathname === '/settings' ? (
              <>
                <PrivateRoute path={routes.tenant} component={Tenants} />
                <PrivateRoute path="/settings" component={Settings} />
                <PrivateRoute
                  path="/settings/profile"
                  component={ProfilePage}
                />
                <PrivateRoute path="/settings/security" component={Security} />
                <PrivateRoute
                  path="/settings/notifications"
                  component={Notification}
                />
                <PrivateRoute path={routes.branding} component={SiteSettings} />
              </>
            ) : (
              <Redirect to="/tenants" />
            )}
            <Redirect to="/tenants" />
          </>
        )}
      </Switch>
    </Router>
  );
};
