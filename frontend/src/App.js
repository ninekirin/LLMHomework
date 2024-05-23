import React, { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/common/Layout';
import getRoutes from '@/common/RouteMap';
import { outsideRoutes } from '@/router';
import RouteLoading from '@/common/RouteLoading';
import { useDispatch } from 'react-redux';

const App = () => {
  const dispatch = useDispatch();

  const handleResize = () => {
    dispatch({ type: 'setSideBarCollapsed', data: window.innerWidth < 768 });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/*" element={<Layout />} />
        {getRoutes(outsideRoutes)}
      </Routes>
    </Suspense>
  );
};

export default App;
