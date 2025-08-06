import { useLocation } from 'react-router-dom';
import Navigation from '../../common/Navigation';

export default function Footer() {
  const location = useLocation();
  const showNavigation = ['/', '/category', '/meeting'].includes(
    location.pathname,
  );

  if (!showNavigation) return null;

  return <Navigation />;
}
