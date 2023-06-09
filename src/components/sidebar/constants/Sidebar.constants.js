import routes from '../../../utils/routes.json';

export const SidebarMenuConstants = {
  Dashboards: 'Dashboards',
  Contacts: 'Contacts',
  Deals: 'Deals',
  Resources: 'Resources',
  Reports: 'Reports',
  Training: 'Training',
  Tenant: 'Tenant',
};

export const sidebarData = [
  {
    id: '1',
    title: 'Dashboards',
    icon: 'dashboard',
    path: '/',
    adminAccess: false,
    permissions: { collection: 'dashboard', action: 'view' },
    ownerAccess: true,
  },
  {
    id: '2',
    title: 'Companies',
    path: routes.companies,
    icon: 'corporate_fare',
    adminAccess: false,
    ownerAccess: true,
    permissions: { collection: 'contacts', action: 'view' },
  },
  {
    id: '3',
    title: 'Contacts',
    path: routes.contacts,
    icon: 'people',
    adminAccess: false,
    ownerAccess: true,
    permissions: { collection: 'contacts', action: 'view' },
  },
  {
    id: '4',
    title: 'Deals',
    icon: 'monetization_on',
    path: routes.pipeline,
    adminAccess: false,
    ownerAccess: true,
    permissions: { collection: 'deals', action: 'view' },
  },
  {
    id: '5',
    title: 'Activities',
    path: routes.Activities,
    icon: 'event_available',
    permissions: { collection: 'activities', action: 'view' },
    adminAccess: false,
    ownerAccess: true,
  },
  {
    id: '6',
    title: 'Resources',
    path: routes.resources,
    adminAccess: false,
    ownerAccess: true,
    icon: 'person_search',
  },
  {
    id: '7',
    title: 'Insights',
    path: routes.insights,
    icon: 'analytics',
    permissions: { collection: 'insights', action: 'view' },
    adminAccess: false,
    ownerAccess: true,
  },
  {
    id: '9',
    title: 'Tenants',
    path: routes.tenant,
    adminAccess: true,
    ownerAccess: false,
    icon: 'corporate_fare',
  },
  {
    id: '8',
    title: 'Training',
    icon: 'school',
    adminAccess: false,
    permissions: { collection: 'lessons', action: 'view' },
    ownerAccess: true,
    submenu: true,
    items: [
      {
        id: '6.1',
        title: 'My Favorites',
        adminAccess: false,
        ownerAccess: true,
        path: routes.favorites,
      },
      {
        id: '6.2',
        title: 'Explore',
        submenu: true,
        adminAccess: false,
        ownerAccess: true,
        items: [],
      },
    ],
  },
  {
    id: '10',
    title: 'Training',
    path: '/training',
    adminAccess: true,
    ownerAccess: false,
    icon: 'school',
  },
];
