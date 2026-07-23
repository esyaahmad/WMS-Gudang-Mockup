import { Link } from "react-router-dom";
import {
  MdInventory2,
  MdSwapHoriz,
  MdFactCheck,
  MdSearch,
  MdLocalOffer,
  MdArrowForward,
  MdQrCodeScanner,
} from "react-icons/md";
import NavbarDummy from "../components/NavbarDummy";

const FEATURES = [
  {
    to: "/mock-scanner2",
    icon: MdInventory2,
    title: "Pemetaan Produk",
    desc: "Pemetaan Bahan - Scan dan masukan produk ke rak gudang",
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    to: "/mock-scannerrack3",
    icon: MdSwapHoriz,
    title: "Pemindahan Pemetaan Produk",
    desc: "Pemindahan Bahan - Pindahkan produk antar rak",
    accent: "from-sky-500 to-sky-600",
  },
  {
    to: "/mock-stockopname-yearly",
    icon: MdFactCheck,
    title: "Stock Opname Produk",
    desc: "Opname Tahunan - Verifikasi dan input kuantitas stok",
    accent: "from-amber-500 to-amber-600",
  },
  {
    to: "/mock-scanner-detail-ttba",
    icon: MdSearch,
    title: "Cek Label Identitas Produk",
    desc: "Cek Detail - Lihat informasi lengkap label produk",
    accent: "from-violet-500 to-violet-600",
  },
  {
    to: "/mock-use-bahan-kemas2",
    icon: MdLocalOffer,
    title: "Withdraw Produk",
    desc: "Ambil Bahan Kemas (Produksi) - Cari bon, scan wadah, dan konfirmasi penarikan",
    accent: "from-rose-500 to-rose-600",
  },
];

const DEMO_LABELS = [
  "BB/2026/001#1#1",
  "BB/2026/001#1#2",
  "BB/2026/001#1#3",
  "BB/2026/002#1#1",
  "BB/2026/003#2#1",
  "BK/2026/010#7#1",
];

const DEMO_RACKS = [
  "BB2/R1/1/1",
  "BB2/R1/1/2",
  "BB2/R2/1/1",
  "BK2/K1/1/1",
  "BK2/K1/1/2",
  "AF2/A1/1/1",
];

export default function Home() {
  return (
    <>
      <NavbarDummy />
      <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-700 to-emerald-900 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-yellow-300 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <p className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 px-3 py-1 rounded-full mb-4">
              Warehouse Management System
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 max-w-2xl">
              WMS Gudang Obat Jadi
            </h1>
            <p className="text-emerald-50/90 text-base sm:text-lg max-w-xl mb-8">
              Kelola pemetaan, pemindahan, stock opname, hingga penarikan
              bahan dalam satu aplikasi gudang yang cepat dan modern.
            </p>
            <Link
              to="/mock-scanner-detail-ttba"
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <MdQrCodeScanner size={20} />
              Scan Label Sekarang
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.to}
                  to={feature.to}
                  className="group relative bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:-translate-y-1 overflow-hidden"
                >
                  <div
                    className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${feature.accent} opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity`}
                  />
                  <div
                    className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} text-white flex items-center justify-center mb-4 shadow-md`}
                  >
                    <Icon size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1.5">
                    {feature.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    {feature.desc}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary dark:text-emerald-400 group-hover:gap-2.5 transition-all">
                    Mulai <MdArrowForward size={16} />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 surface-card p-6 sm:p-8 max-w-4xl mx-auto mb-8">
            <h2 className="heading-page text-xl mb-1">Demo Labels</h2>
            <p className="text-muted text-sm mb-4">
              Gunakan QR/label berikut untuk testing di setiap halaman:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DEMO_LABELS.map((label) => (
                <div
                  key={label}
                  className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg font-mono text-sm text-center"
                >
                  {label}
                </div>
              ))}
            </div>

            <h2 className="heading-page text-xl mb-1 mt-8">Demo Racks</h2>
            <p className="text-muted text-sm mb-4">
              Gunakan kode rak berikut untuk testing:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DEMO_RACKS.map((rack) => (
                <div
                  key={rack}
                  className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg font-mono text-sm text-center"
                >
                  {rack}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
