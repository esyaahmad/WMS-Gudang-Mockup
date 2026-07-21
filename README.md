# WMS Gudang Mockup

Aplikasi demo Warehouse Management System (WMS) untuk mengelola pemetaan, pemindahan, dan opname bahan gudang.

## 🚀 Fitur

- **Pemetaan Bahan** - Scan dan masukan produk ke dalam rak gudang dengan lokasi spesifik
- **Pemindahan Bahan** - Pindahkan produk antar rak dengan validasi tipe item
- **Stock Opname** - Verifikasi dan input kuantitas stok bahan baku secara berkala
- **Cek Identitas** - Lihat informasi lengkap label dan detail produk

## 📋 Requirements

- Node.js v16+
- npm atau yarn

## 🔧 Setup

1. **Clone atau extract project ini**
```bash
cd WMS-Gudang-Mockup
```

2. **Install dependencies**
```bash
npm install
```

3. **Jalankan dev server**
```bash
npm run dev
```

Server akan berjalan di: `http://localhost:5173/WMS-Gudang-Mockup/`

## 📦 Build untuk Production

```bash
npm run build
```

Output akan di folder `dist/`

## 🧪 Testing Demo Data

Gunakan QR/label dan rak berikut untuk testing:

### Demo Labels
- `BB/2026/001#1#1` - Lactose Release (VAT 1)
- `BB/2026/001#1#2` - Lactose Release (VAT 2)
- `BB/2026/001#1#3` - Lactose Release (VAT 3)
- `BB/2026/002#1#1` - Magnesium Release
- `BB/2026/003#2#1` - Talc Release
- `BK/2026/010#7#1` - ALUFOIL Karantina

### Demo Racks
- `BB2/R1/1/1` - Lokasi BB, Rak 1, Baris 1, Kolom 1
- `BB2/R1/1/2` - Lokasi BB, Rak 1, Baris 1, Kolom 2
- `BB2/R2/1/1` - Lokasi BB, Rak 2, Baris 1, Kolom 1
- `BK2/K1/1/1` - Lokasi BK, Rak K1, Baris 1, Kolom 1
- `BK2/K1/1/2` - Lokasi BK, Rak K1, Baris 1, Kolom 2
- `AF2/A1/1/1` - Lokasi AF, Rak A1, Baris 1, Kolom 1

## 🏗️ Struktur Project

```
WMS-Gudang-Mockup/
├── src/
│   ├── components/          # React components
│   │   ├── NavbarDummy.jsx
│   │   ├── QrScannerDummy.jsx
│   │   ├── QrScannerRackDummy.jsx
│   │   ├── ModalInputOpnameBKDummy.jsx
│   │   ├── ModalListOpnameDummy.jsx
│   │   ├── ModalSwapRack3Dummy.jsx
│   │   ├── ModalValidateLabelSwapRackDummy.jsx
│   │   └── Widgets/
│   │       └── LiveDateTime.jsx
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Scanner2Mockup.jsx
│   │   ├── ScannerRack3Mockup.jsx
│   │   ├── StockOpnameYearlyMockup.jsx
│   │   └── ScannerDetailTtbaMockup.jsx
│   ├── config/              # Configuration
│   │   └── config.js
│   ├── mocks/               # Mock data & API
│   │   └── scanner2MockApi.js
│   ├── main.jsx
│   ├── index.css
│   └── App.jsx
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🛠️ Technologies Used

- **React 18.2.0** - UI Library
- **Vite 5.0.8** - Build tool
- **React Router DOM 6.20.0** - Routing
- **Tailwind CSS 3.4.1** - Styling
- **DaisyUI 4.10.2** - Component library
- **SweetAlert2 11.10.5** - Alert/Confirmation dialogs
- **React-Toastify 9.1.3** - Toast notifications
- **React-Icons 4.12.0** - Icon components
- **Axios 1.6.2** - HTTP client

## 📱 Responsive Design

Aplikasi fully responsive untuk desktop dan mobile. Gunakan breakpoint `md:` untuk tampilan desktop dan hamburger menu otomatis di mobile.

## ✨ Fitur Utama

### 1. Pemetaan Bahan (Scanner2)
- Scan QR label produk
- Pilih rak tujuan
- Support multiple VAT untuk 1 TTBA
- Auto-validasi jumlah VAT

### 2. Pemindahan Bahan (ScannerRack3)
- Scan rak sumber
- Pilih item untuk dipindahkan
- Validasi tipe item
- Scan QR item untuk konfirmasi

### 3. Stock Opname (StockOpnameYearly)
- Scan rak untuk opname
- Scan QR label (auto-load semua VAT)
- Edit quantity stock opname
- Submit dan generate laporan

### 4. Cek Label (ScannerDetailTtba)
- Scan QR untuk info lengkap
- Tampilkan: nomor analisa, nama bahan, supplier, batch, expiry
- Lihat lokasi penyimpanan: gudang utama, kecil, sampling
- Status release/karantina/reject

## 🎨 Styling

- **Primary Color**: #21913F (Green)
- **Font**: System font stack
- **Component Library**: DaisyUI for consistent UI

## 📝 Mock Data

Semua data adalah mock (simulasi in-memory):
- **MASTER_PRODUCTS**: 2 produk dengan multiple VAT
- **RACK_MASTER**: 5 rak dengan lokasi berbeda
- **RACK_CONTENTS**: Inventori tersebar di rak
- **OPNAME_PRODUCTS**: Data opname 8 produk
- **GUDANG_STOCK**: Mapping ke gudang utama, kecil, sampling

## ⚙️ Environment Variables

Tidak diperlukan `.env` file untuk menjalankan mockup ini. Semua config ada di `src/config/config.js`.

## 🐛 Troubleshooting

**Issue**: Port 5173 sudah terpakai
```bash
npm run dev -- --port 3000
```

**Issue**: Module not found
```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

Proprietary - Hacktive8

## 👨‍💻 Author

Created as WMS Gudang Mockup Demo
Date: 2026

---

**Status**: ✅ Production Ready for Testing & Demo
