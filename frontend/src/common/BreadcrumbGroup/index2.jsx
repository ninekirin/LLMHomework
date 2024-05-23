import { insideRoutes } from '@/router';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { siteName } from '@/assets/js/config.js';

const BreadcrumbGroup = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  const getBreadcrumbTitle = (routes, path, fullPath = '') => {
    return routes.reduce((pre, val) => {
      let temp = pre;
      let currentPath = `${fullPath}/${val.path}`.replace(/\/+/g, '/');
      if (currentPath === `/${path}` || new RegExp(`/${path}(/*|:|$)`).test(currentPath)) {
        return (temp += val.title);
      }
      return (temp += getBreadcrumbTitle(val?.items || [], path, currentPath));
    }, '');
  };

  const extraBreadcrumbItems = pathSnippets.map((path, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const breadcrumbTitle = getBreadcrumbTitle(
      insideRoutes.filter(item => item.path !== 'home'),
      path
    );
    console.log('breadcrumbTitle:', breadcrumbTitle);
    return (
      breadcrumbTitle && (
        <Breadcrumb.Item key={url}>
          <Link to={url}>{breadcrumbTitle}</Link>
        </Breadcrumb.Item>
      )
    );
  });

  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/home">{siteName}</Link>
    </Breadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  return <Breadcrumb>{breadcrumbItems}</Breadcrumb>;
};

export default BreadcrumbGroup;
