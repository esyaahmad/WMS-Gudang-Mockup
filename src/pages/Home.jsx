import { Link } from "react-router-dom";
import NavbarDummy from "../components/NavbarDummy";

export default function Home() {
  return (
    <>
      <NavbarDummy />
      <div className="mt-16">
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                WMS Gudang Mockup
              </h1>
              <p className="text-xl text-gray-600">
                Aplikasi demo untuk Warehouse Management System
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link
                to="/mock-scanner2"
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 hover:bg-green-50"
              >
                <div className="text-3xl mb-2">📦</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600">
                  Scanner2
                </h2>
                <p className="text-gray-600 mb-4">
                  Pemetaan Bahan - Scan dan masukan produk ke rak gudang
                </p>
                <div className="text-green-600 font-semibold group-hover:translate-x-1 transition-transform">
                  Mulai →
                </div>
              </Link>

              <Link
                to="/mock-scannerrack3"
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 hover:bg-green-50"
              >
                <div className="text-3xl mb-2">🔄</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600">
                  ScannerRack3
                </h2>
                <p className="text-gray-600 mb-4">
                  Pemindahan Bahan - Pindahkan produk antar rak
                </p>
                <div className="text-green-600 font-semibold group-hover:translate-x-1 transition-transform">
                  Mulai →
                </div>
              </Link>

              <Link
                to="/mock-stockopname-yearly"
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 hover:bg-green-50"
              >
                <div className="text-3xl mb-2">📊</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600">
                  Stock Opname
                </h2>
                <p className="text-gray-600 mb-4">
                  Opname Tahunan - Verifikasi dan input kuantitas stok
                </p>
                <div className="text-green-600 font-semibold group-hover:translate-x-1 transition-transform">
                  Mulai →
                </div>
              </Link>

              <Link
                to="/mock-scanner-detail-ttba"
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 hover:bg-green-50"
              >
                <div className="text-3xl mb-2">🔍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600">
                  Label Identitas
                </h2>
                <p className="text-gray-600 mb-4">
                  Cek Detail - Lihat informasi lengkap label produk
                </p>
                <div className="text-green-600 font-semibold group-hover:translate-x-1 transition-transform">
                  Mulai →
                </div>
              </Link>
            </div>

            <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Demo Labels</h2>
              <p className="text-gray-600 mb-4">
                Gunakan QR/label berikut untuk testing di setiap halaman:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-sm">
                <div className="bg-gray-100 p-2 rounded">BB/2026/001#1#1</div>
                <div className="bg-gray-100 p-2 rounded">BB/2026/001#1#2</div>
                <div className="bg-gray-100 p-2 rounded">BB/2026/001#1#3</div>
                <div className="bg-gray-100 p-2 rounded">BB/2026/002#1#1</div>
                <div className="bg-gray-100 p-2 rounded">BB/2026/003#2#1</div>
                <div className="bg-gray-100 p-2 rounded">BK/2026/010#7#1</div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Demo Racks</h2>
              <p className="text-gray-600 mb-4">
                Gunakan kode rak berikut untuk testing:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-sm">
                <div className="bg-gray-100 p-2 rounded">BB2/R1/1/1</div>
                <div className="bg-gray-100 p-2 rounded">BB2/R1/1/2</div>
                <div className="bg-gray-100 p-2 rounded">BB2/R2/1/1</div>
                <div className="bg-gray-100 p-2 rounded">BK2/K1/1/1</div>
                <div className="bg-gray-100 p-2 rounded">BK2/K1/1/2</div>
                <div className="bg-gray-100 p-2 rounded">AF2/A1/1/1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
