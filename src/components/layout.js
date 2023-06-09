import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Header from '../components/header';
import Sidebar from './sidebar/Sidebar';
import { getTitleBreadcrumb } from '../utils/Breadcrumb';
import { useTenantContext } from '../contexts/TenantContext';
import FullScreenSpinner from './FullScreeenSpinner';

const Layout = ({ children, isSplitView }) => {
  const [mounted, setMounted] = useState(false);

  const location = useLocation();

  const { tenant } = useTenantContext();

  const setTheme = () => {
    if (tenant?.colors) {
      document.documentElement.style.setProperty(
        '--primaryColor',
        tenant.colors.primaryColor
      );
      document.documentElement.style.setProperty(
        '--secondaryColor',
        tenant.colors.secondaryColor
      );
    }
  };

  useEffect(() => {
    setTheme();
    tenant?.id && !mounted && setMounted(true);
  }, [tenant]);

  if (mounted) {
    return (
      <>
        <Helmet>
          <title>{getTitleBreadcrumb(location.pathname)}</title>
        </Helmet>
        <div className="has-navbar-vertical-aside navbar-vertical-aside-show-xl footer-offset">
          <Header />
          <Sidebar />
          {isSplitView ? (
            <main
              id="content"
              role="main"
              className="main splitted-content-main"
            >
              {children}
            </main>
          ) : (
            <main className="main">
              <div className="content container-fluid">{children}</div>
            </main>
          )}
          {/* <Footer /> */}
        </div>
      </>
    );
  } else {
    return <FullScreenSpinner />;
  }
};

export default Layout;
