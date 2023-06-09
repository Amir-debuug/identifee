import { BreadcrumbItem, Breadcrumb as RBreadcrumb } from 'react-bootstrap';
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../utils/routes.json';
import { BRANDING_LABEL } from './constants';
import { TenantContext } from '../contexts/TenantContext';
import { getRootComponentName } from '../utils/Utils';
const breadcrumbLocation = ({ pathname }) => {
  if (pathname.includes(routes.dealsPipeline)) {
    return ['Deals'];
  } else if (pathname.includes(routes.quizConfiguration)) {
    return ['Quiz Configuration'];
  } else if (pathname.includes('organization/profile')) {
    return ['Contacts', 'Organization'];
  } else if (pathname === '/contacts') {
    return ['Contacts'];
  } else if (pathname.includes(routes.companies)) {
    return ['Companies'];
  } else if (pathname.includes('contacts/')) {
    return ['Contacts', 'People'];
  } else if (pathname.includes(routes.resources)) {
    return ['Resources'];
  } else if (pathname.includes('insights/dashboard')) {
    return ['Insights', 'Dashboard'];
  } else if (pathname.includes(routes.insights)) {
    return ['Insights'];
  } else if (pathname === '/settings') {
    return ['Settings'];
  } else if (pathname === '/settings/profile') {
    return ['Settings', 'Profile'];
  } else if (pathname.includes('/settings/security')) {
    return ['Settings', 'Security'];
  } else if (pathname.includes('/settings/notifications')) {
    return ['Settings', 'Notifications'];
  } else if (pathname.includes(routes.integrations)) {
    return ['Settings', 'Integrations'];
  } else if (pathname.includes(routes.pipelinesAndStages)) {
    return ['Settings', 'Pipelines and Stages'];
  } else if (pathname.includes(routes.fields)) {
    return ['Settings', 'Fields'];
  } else if (pathname.includes(routes.tenant)) {
    return ['Tenants'];
  } else if (pathname.includes(routes.Activities)) {
    return ['Activities'];
  } else if (
    pathname.includes('/settings/users') ||
    pathname.includes('/settings/profile/users')
  ) {
    return ['Settings', 'Manage Users'];
  } else if (pathname.includes(routes.training)) {
    return ['Settings', 'Training'];
  } else if (pathname.includes(routes.branding)) {
    return ['Settings', BRANDING_LABEL];
  } else if (pathname.includes('/settings/products')) {
    return ['Settings', 'Products'];
  } else if (pathname.includes(routes.favorites)) {
    return ['Training', 'My Favorites'];
  } else if (pathname.includes('/training/lessons')) {
    return ['Training', 'Lessons'];
  } else if (pathname.includes('/training/categories')) {
    return ['Training', 'Explore'];
  } else if (pathname.includes('/training/learningPath')) {
    return ['Training', 'Learning Path'];
  } else if (pathname.includes('/training/courses')) {
    return ['Training', 'Learning Path'];
  } else if (pathname.includes(routes.notificationsAll)) {
    return ['Notifications'];
  } else {
    return [];
  }
};

export const getTitleBreadcrumb = (pathname) => {
  const { tenant } = useContext(TenantContext);
  let splitSection = breadcrumbLocation({ pathname });
  if (pathname === '/') {
    splitSection = getRootComponentName(tenant);
  }
  const tenantName = `${tenant?.name ?? 'Identifee'}`;
  if (splitSection.length === 0) return tenantName;
  return `${splitSection[splitSection.length - 1]} - ${tenantName}`;
};

const Breadcrumb = () => {
  const { tenant } = useContext(TenantContext);
  const getUrlBySection = (modules) => {
    if (modules.length > 1) {
      const mainModule = modules[0];
      if (mainModule === 'Settings') {
        return '/settings';
      } else if (mainModule === 'Contacts') {
        return '/contacts';
      }
    }

    return '#';
  };

  const location = useLocation();
  let splitSection = breadcrumbLocation(location);
  const modules = splitSection;
  if (location.pathname === '/') {
    splitSection = getRootComponentName(tenant);
  }

  return (
    <RBreadcrumb className="mt-3 text-normal-bold">
      {splitSection?.map((section, index) =>
        splitSection?.length > 1 && !modules.includes('Training') ? (
          <BreadcrumbItem
            key={section}
            linkAs={Link}
            linkProps={{ to: getUrlBySection(modules) }}
            active={index > 0 && splitSection.length > 1 && 'text-muted'}
            className={index === 0 && splitSection.length > 1 && 'text-black'}
          >
            {section}
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem
            key={section}
            active
            className={index === 0 && splitSection.length > 1 && 'text-muted'}
          >
            {section}
          </BreadcrumbItem>
        )
      )}
    </RBreadcrumb>
  );
};

export default Breadcrumb;
