import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="h-full bg-white border-b border-gray-100">
      <div className="h-full flex items-center justify-between px-4">
        <Link
          to="/"
          className="text-xl font-bold text-blue-600"
        >
          logo
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/search"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <i className="ri-search-line text-gray-600 text-lg"></i>
          </Link>

          <Link
            to="/notification"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors relative"
          >
            <i className="ri-notification-2-line text-gray-600 text-lg"></i>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
