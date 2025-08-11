import { Link } from 'react-router-dom';
import logo from '../../../assets/image.png';

export default function Header() {
  return (
    <header className="h-full bg-white border-b border-gray-100">
      <div className="h-full flex items-center justify-between px-4">
        <Link
          to="/"
          className="inline-flex items-center h-12"
          aria-label="홈으로"
        >
          <img
            src={logo}
            alt="서비스 로고"
            className="h-10 w-auto block" // 높이만 정하고 가로는 비율 유지
            decoding="async"
            loading="eager"
          />
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/search"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <i className="ri-search-line text-gray-600 text-lg"></i>
          </Link>

          <Link
            to="/notice"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 hover:bg-neutral-100 transition-colors relative"
          >
            <i className="ri-notification-2-line text-gray-600 text-l"></i>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-secondary rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
