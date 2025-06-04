import React, { useRef, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useClickAway } from 'react-use';
import { AuthContext } from '@/context/AuthContext';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  useClickAway(menuRef, () => {
    setIsOpen(false);
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 rounded-lg py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {user?.name || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <Link href="/profile" className="menu-item-inactive">
              Profile Settings
            </Link>
            <Link href="/2fa-settings" className="menu-item-inactive">
              2FA Settings
            </Link>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              onClick={handleLogout}
              className="menu-item-inactive text-red-600 dark:text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
