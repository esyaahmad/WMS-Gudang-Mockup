import React, { useEffect, useRef, useState } from "react";
import { LuUser } from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdLayers } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import LiveDateTime from "./Widgets/LiveDateTime";
import { NAMA_PROGRAM } from "../config/config";

const DUMMY_USER = {
  Nama: "Dummy User",
  log_NIK: "DUMMY-001",
  Jabatan: "Staff Gudang (Test)",
  emp_DeptID: "Warehouse",
  emp_JobLevelID: "Staff",
};

const DUMMY_MENUS = {
  Mockup: [
    { label: "Mock Scanner2 — Pemetaan Bahan", page: "mock-scanner2" },
    { label: "Mock ScannerRack3 — Pemindahan Bahan", page: "mock-scannerrack3" },
    { label: "Mock Stock Opname Bahan Baku", page: "mock-stockopname-yearly" },
    { label: "Mock Label Identitas", page: "mock-scanner-detail-ttba" },
  ],
};

export default function NavbarDummy() {
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [openSubMenuProfile, setOpenSubMenuProfile] = useState(false);

  const subMenuRef = useRef(null);
  const subMenuProfileRef = useRef(null);

  useEffect(() => {
    if (openSubMenu) setOpenSubMenuProfile(false);
  }, [openSubMenu]);

  useEffect(() => {
    if (openSubMenuProfile) setOpenSubMenu(null);
  }, [openSubMenuProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target)) {
        setOpenSubMenu(null);
      }
      if (subMenuProfileRef.current && !subMenuProfileRef.current.contains(event.target)) {
        setOpenSubMenuProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSubMenu = (_menuId) => {
    setOpenSubMenu(openSubMenu === _menuId ? null : _menuId);
  };

  const handleNavigate = (page) => {
    setOpenSubMenu(null);
    setOpenSubMenuProfile(false);
    setOpenMobileNav(false);
    window.location.href = `/${NAMA_PROGRAM}/${page}`;
  };

  return (
    <nav className="z-[99] fixed top-0 left-0 w-full h-16 border-b border-primary bg-primary text-white flex items-center">
      <div className="mx-4 md:mx-8 w-full flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleNavigate("")}
            className="flex items-center gap-2"
          >
            <MdLayers size={28} className="text-yellow-400" />
            <div className="text-xl font-bold">WMS Gudang Mockup</div>
          </button>

          <div className="p-2 hidden md:block">
            <ul className="flex flex-col md:flex-row gap-2">
              {Object.keys(DUMMY_MENUS).map((menu) => (
                <li key={menu} className="relative">
                  <button
                    onClick={() => toggleSubMenu(menu)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded transition duration-300 hover:bg-forest-green-100 hover:text-tertiary ${
                      openSubMenu === menu
                        ? "bg-forest-green-100 text-tertiary opacity-70"
                        : "bg-transparent text-white"
                    }`}
                  >
                    <span>{menu}</span>
                    <span className="ml-1">
                      {openSubMenu === menu ? (
                        <FaChevronUp size={10} />
                      ) : (
                        <FaChevronDown size={10} />
                      )}
                    </span>
                  </button>

                  {openSubMenu === menu && (
                    <div className="absolute z-[99] w-fit min-w-[250px] top-full left-0 mt-6 bg-white rounded border shadow py-2">
                      <ul className="overflow-y-auto max-h-[600px]">
                        {DUMMY_MENUS[menu].map((subMenu) => (
                          <li key={subMenu.label}>
                            <button
                              type="button"
                              onClick={() => handleNavigate(subMenu.page)}
                              className="w-full text-left block py-2 pl-4 pr-6 whitespace-nowrap text-gray-900 rounded transition duration-200 hover:bg-gray-100 hover:text-primary"
                            >
                              {subMenu.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-16 hidden md:flex items-center">
          <div className="flex items-center gap-3">
            <LiveDateTime />
            <div className="divider divider-horizontal mx-2 h-8"></div>
            <button
              onClick={() => setOpenSubMenuProfile(!openSubMenuProfile)}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-opacity-20 hover:bg-white transition"
            >
              <LuUser size={20} />
              <span className="text-sm font-semibold">{DUMMY_USER.Nama}</span>
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>

        <button
          className="md:hidden flex items-center justify-center"
          onClick={() => setOpenMobileNav(!openMobileNav)}
        >
          {openMobileNav ? (
            <IoMdClose size={24} />
          ) : (
            <RxHamburgerMenu size={24} />
          )}
        </button>
      </div>

      {openMobileNav && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-primary text-white p-4 shadow-lg max-h-[calc(100vh-64px)] overflow-y-auto">
          <ul className="space-y-2">
            {Object.keys(DUMMY_MENUS).map((menu) => (
              <li key={menu}>
                <button
                  onClick={() => toggleSubMenu(menu)}
                  className="w-full text-left px-4 py-2 rounded hover:bg-opacity-20 hover:bg-white flex justify-between items-center"
                >
                  <span>{menu}</span>
                  {openSubMenu === menu ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                {openSubMenu === menu && (
                  <ul className="pl-4 space-y-1 mt-2">
                    {DUMMY_MENUS[menu].map((subMenu) => (
                      <li key={subMenu.label}>
                        <button
                          onClick={() => handleNavigate(subMenu.page)}
                          className="w-full text-left px-4 py-1 text-sm rounded hover:bg-opacity-20 hover:bg-white"
                        >
                          {subMenu.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
