"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import styles from './AppSidebar.module.css';
import {

  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  SettingsIcon,
  ChartIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    name: "All Users",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "All Users", path: "/users", pro: false },
      { name: "Users List", path: "/users-list", pro: false },
    ],
  },
  {
    name: "Rides",
    icon: <ChartIcon />,
    subItems: [
      { name: "All Rides", path: "/rides", pro: false },
      { name: "Scheduled Rides", path: "/rides/scheduled", pro: false },
      { name: "Ride History", path: "/rides/history", pro: false },
    ],
  },
  {
    name: "Drivers",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "All Drivers", path: "/drivers", pro: false },
      { name: "Driver Applications", path: "/drivers/applications", pro: false },
      { name: "Driver Ratings", path: "/drivers/ratings", pro: false },
    ],
  },
  {
    name: "Logistics",
    icon: <TableIcon />,
    subItems: [
      { name: "Orders", path: "/logistics/orders", pro: false },
      { name: "Fleet Management", path: "/logistics/fleet", pro: false },
    ],
  },
  {
    icon: <ChartIcon />,
    name: "Finance",
    path: "/finance",
  },
  {
    icon: <PieChartIcon />,
    name: "Analytics",
    path: "/analytics",
  },
  {
    icon: <UserCircleIcon />,
    name: "Role Management",
    path: "/roles",
  },
  {
    icon: <SettingsIcon />,
    name: "Settings",
    path: "/settings",
  },
  {
    icon: <TableIcon />,
    name: "Driver Categories",
    path: "/driver-categories",
  },
  {
    icon: <ListIcon />,
    name: "Subscriptions",
    path: "/subscription",
  },
];

// Remove othersItems as we don't need it anymore
const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`${styles['menu-item']} group cursor-pointer ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? styles['menu-item-active']
                  : styles['menu-item-inactive']
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? styles['menu-item-icon-active']
                  : styles['menu-item-icon-inactive']}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={styles['menu-item-text']}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`${styles['menu-item']} group ${
                  isActive(nav.path) ? styles['menu-item-active'] : styles['menu-item-inactive']
                }`}
              >
                <span
                  className={isActive(nav.path)
                    ? styles['menu-item-icon-active']
                    : styles['menu-item-icon-inactive']}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`${styles['menu-dropdown-item']} ${
                        isActive(subItem.path)
                          ? styles['menu-dropdown-item-active']
                          : styles['menu-dropdown-item-inactive']
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${styles['menu-dropdown-badge']} ${
                              isActive(subItem.path)
                                ? styles['menu-dropdown-badge-active']
                                : styles['menu-dropdown-badge-inactive']
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-30 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/main_logo.svg"
                alt="kaaafika"
                width={40}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/main_logo.svg"
                alt="kaaafika"
                width={40}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4 px-1">
            <div className="min-w-0 flex-1">
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}>
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
        
      </div>
    </aside>
  );
};

export default AppSidebar;
