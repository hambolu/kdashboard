import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside className={`fixed top-0 left-0 z-50 h-screen w-[290px] transform bg-white transition-all duration-300 ease-in-out dark:bg-gray-900 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-[70px] items-center justify-center border-b border-gray-200 px-6 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo/main_logo.svg"
              alt="Logo"
              width={154}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {/* Add your navigation items here */}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
