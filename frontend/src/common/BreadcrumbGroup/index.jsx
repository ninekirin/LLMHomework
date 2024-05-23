import { insideRoutes } from '@/router';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { siteName } from '@/assets/js/config.js';

const BreadcrumbGroup = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  // console.log('pathSnippets:', pathSnippets);

  // Modify pathSnippets to treat view/:id as a single element
  // 目前的处理是不把 view/:id 视为元素
  const modifiedPathSnippets = [];
  for (let i = 0; i < pathSnippets.length; i++) {
    if (pathSnippets[i] === 'view' && i < pathSnippets.length - 1) {
      // modifiedPathSnippets.push(`view/${pathSnippets[i + 1]}`);
      i++; // Skip the next element since it has been combined with 'view'
    } else {
      modifiedPathSnippets.push(pathSnippets[i]);
    }
  }
  // console.log('modifiedPathSnippets:', modifiedPathSnippets);

  // 查找路径片段对应的路由
  const findRouteByPath = (routes, pathSegment) => {
    return routes.find(route => route.path.replace(/^:|\//g, '') === pathSegment);
  };

  // 获取面包屑路径的全部信息，返回路由信息数组
  const getBreadcrumbRoutes = (routes, pathSegments) => {
    let currentRoutes = routes;
    let breadcrumbRoutes = [];

    for (const segment of pathSegments) {
      const route = findRouteByPath(currentRoutes, segment);
      if (route) {
        // 防止重复添加同一路径名，只有在数组为空或最后一个元素不是当前路由时才添加
        if (
          breadcrumbRoutes.length === 0 ||
          breadcrumbRoutes[breadcrumbRoutes.length - 1] !== route
        ) {
          breadcrumbRoutes.push(route);
        }
        currentRoutes = route.items || [];
      } else {
        break;
      }
    }

    return breadcrumbRoutes;
  };

  const extraBreadcrumbItems = modifiedPathSnippets
    .map((_, index) => {
      const pathSegments = modifiedPathSnippets.slice(0, index + 1);
      const breadcrumbRoutes = getBreadcrumbRoutes(insideRoutes, pathSegments);
      return breadcrumbRoutes
        .map((route, idx) => {
          // 只为当前片段添加链接，防止同一层级重复添加
          if (idx === breadcrumbRoutes.length - 1) {
            const url = `/${modifiedPathSnippets.slice(0, idx + 1).join('/')}`;
            return (
              <Breadcrumb.Item key={url}>
                <Link to={url}>{route.title}</Link>
              </Breadcrumb.Item>
            );
          }
          return null;
        })
        .filter(Boolean);
    })
    .flat(); // 将多个数组平坦化为一个数组

  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/home">{siteName}</Link>
    </Breadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  return <Breadcrumb>{breadcrumbItems}</Breadcrumb>;
};

export default BreadcrumbGroup;
