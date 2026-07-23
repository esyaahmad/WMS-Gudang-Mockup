import { useEffect, useState } from "react";
import { LuUser } from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  MdQrCodeScanner,
  MdOutlineHome,
  MdPublic,
  MdLightMode,
  MdDarkMode,
} from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import WorldClock from "./Widgets/WorldClock";
import useTheme from "../hooks/useTheme";
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
    { label: "Mock Ambil Bahan Kemas (Produksi)", page: "mock-use-bahan-kemas2" },
  ],
};

const SCANNER_PAGE = "mock-scanner-detail-ttba";

export default function NavbarDummy() {
  const { theme, toggleTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [openWorldTime, setOpenWorldTime] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const anyPanelOpen = openMenu || openWorldTime || openProfile;

  useEffect(() => {
    document.body.style.overflow = anyPanelOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [anyPanelOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") closeAllPanels();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const closeAllPanels = () => {
    setOpenMenu(false);
    setOpenSubMenu(null);
    setOpenWorldTime(false);
    setOpenProfile(false);
  };

  const toggleSubMenu = (menuId) => {
    setOpenSubMenu(openSubMenu === menuId ? null : menuId);
  };

  const handleNavigate = (page) => {
    closeAllPanels();
    window.location.href = `/${NAMA_PROGRAM}/${page}`;
  };

  const showOnly = (panel) => {
    setOpenMenu(panel === "menu");
    setOpenWorldTime(panel === "worldtime");
    setOpenProfile(panel === "profile");
  };

  return (
    <>
      <button
        type="button"
        title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        onClick={toggleTheme}
        className="fixed z-[99] top-4 right-4 w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-yellow-300 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:scale-105 active:scale-95 transition"
      >
        {theme === "dark" ? <MdLightMode size={19} /> : <MdDarkMode size={19} />}
      </button>

      {anyPanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[100]"
          onClick={closeAllPanels}
        />
      )}

      <div
        className={`fixed z-[101] top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300 ${
          openMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-700 bg-primary text-white">
          <span className="font-bold text-lg">Menu</span>
          <button type="button" onClick={closeAllPanels}>
            <IoMdClose size={22} />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-64px)] py-2">
          {Object.keys(DUMMY_MENUS).map((menu) => (
            <div key={menu} className="border-b border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => toggleSubMenu(menu)}
                className="w-full flex items-center justify-between px-5 py-3 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <span>{menu}</span>
                {openSubMenu === menu ? (
                  <FaChevronUp size={12} />
                ) : (
                  <FaChevronDown size={12} />
                )}
              </button>
              {openSubMenu === menu && (
                <ul className="bg-gray-50 dark:bg-gray-900/40 pb-2">
                  {DUMMY_MENUS[menu].map((subMenu) => (
                    <li key={subMenu.label}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(subMenu.page)}
                        className="w-full text-left px-8 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-gray-800 transition"
                      >
                        {subMenu.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {openWorldTime && (
        <div
          className="fixed z-[101] inset-0 flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4"
          onClick={closeAllPanels}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
              <span className="font-bold flex items-center gap-2">
                <MdPublic size={18} /> World Time
              </span>
              <button type="button" onClick={closeAllPanels}>
                <IoMdClose size={20} />
              </button>
            </div>
            <WorldClock />
          </div>
        </div>
      )}

      {openProfile && (
        <div
          className="fixed z-[101] inset-0 flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4"
          onClick={closeAllPanels}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
              <span className="font-bold">Profil Pengguna</span>
              <button type="button" onClick={closeAllPanels}>
                <IoMdClose size={20} />
              </button>
            </div>
            <div className="p-5 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <LuUser size={32} className="text-primary" />
              </div>
              <p className="font-bold text-gray-800 dark:text-gray-100">
                {DUMMY_USER.Nama}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {DUMMY_USER.log_NIK}
              </p>
              <div className="w-full mt-3 text-sm divide-y divide-gray-100 dark:divide-gray-700">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 dark:text-gray-400">Jabatan</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {DUMMY_USER.Jabatan}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 dark:text-gray-400">Departemen</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {DUMMY_USER.emp_DeptID}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 dark:text-gray-400">Level</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {DUMMY_USER.emp_JobLevelID}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Mode Tampilan
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-200"
                  >
                    {theme === "dark" ? (
                      <>
                        <MdDarkMode size={14} /> Gelap
                      </>
                    ) : (
                      <>
                        <MdLightMode size={14} /> Terang
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed z-[99] bottom-0 left-0 w-full h-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-stretch">
        <div className="w-full max-w-xl sm:max-w-2xl mx-auto flex items-stretch">
          <button
            type="button"
            onClick={() => handleNavigate("")}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-emerald-400 transition"
          >
            <MdOutlineHome size={22} />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => showOnly(openMenu ? null : "menu")}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-emerald-400 transition"
          >
            <RxHamburgerMenu size={20} />
            <span className="text-[11px] font-medium">Menu</span>
          </button>

          <div className="flex-1 flex items-center justify-center relative">
            <button
              type="button"
              title="Scan Label"
              onClick={() => handleNavigate(SCANNER_PAGE)}
              className="absolute -top-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg flex items-center justify-center ring-4 ring-white dark:ring-gray-800 active:scale-95 transition"
            >
              <MdQrCodeScanner size={26} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => showOnly(openWorldTime ? null : "worldtime")}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-emerald-400 transition"
          >
            <MdPublic size={20} />
            <span className="text-[11px] font-medium">Waktu</span>
          </button>

          <button
            type="button"
            onClick={() => showOnly(openProfile ? null : "profile")}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-emerald-400 transition"
          >
            <LuUser size={20} />
            <span className="text-[11px] font-medium">Profil</span>
          </button>
        </div>
      </nav>
    </>
  );
}
