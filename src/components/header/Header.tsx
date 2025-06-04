import React from 'react';
import UserMenu from '../UserMenu/UserMenu';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white dark:bg-gray-800 drop-shadow-1">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Mobile menu button - implement if needed */}
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Add notification, settings, etc. icons if needed */}
          </ul>
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
