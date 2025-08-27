import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import publicRoutes from './routeConfig/publicRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path='*' element={<div style={{ padding: 16 }}>404</div>} />
      </Routes>
    </>
  );
}
