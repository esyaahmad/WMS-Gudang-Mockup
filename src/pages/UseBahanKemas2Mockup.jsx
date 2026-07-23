import { useState } from "react";
import Swal from "sweetalert2";
import NavbarDummy from "../components/NavbarDummy";
import PreLoader from "../components/Widgets/PreLoader";
import ModalUseBKListVatDummy from "../components/ModalUseBKListVatDummy";
import ModalBatalScanPenarikanDummy from "../components/ModalBatalScanPenarikanDummy";
import {
  fetchBonKeluarUseBKByMRMock,
  fetchBonKeluarUseBKMock,
} from "../mocks/scanner2MockApi";

export default function UseBahanKemas2Mockup() {
  const [loading, setLoading] = useState(false);
  const [dataBon, setDataBon] = useState([]);
  const [openModalBKListMR, setOpenModalBKListMR] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    MR_No: "",
    MR_SeqID: "",
    MR_ItemID: "",
    MR_DNcQTY: 0,
    MR_NoAnalisa: "",
    MR_ItemUnit: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [openList, setOpenList] = useState(false);

  const fetchBonUseBK = async (batchNo) => {
    setLoading(true);
    try {
      const response = await fetchBonKeluarUseBKMock(batchNo);
      setDataBon(response);
    } catch (error) {
      Swal.fire({
        title: error?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
      setDataBon([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBonUseBKByMR = async (mrNo) => {
    setLoading(true);
    try {
      const response = await fetchBonKeluarUseBKByMRMock(mrNo);
      setDataBon(response);
    } catch (error) {
      Swal.fire({
        title: error?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
      setDataBon([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClick = (
    MR_No,
    MR_SeqID,
    MR_ItemID,
    MR_DNcQTY,
    MR_NoAnalisa,
    MR_ItemUnit
  ) => {
    setSelectedItem({
      MR_No,
      MR_SeqID,
      MR_ItemID,
      MR_DNcQTY,
      MR_NoAnalisa,
      MR_ItemUnit,
    });
    setOpenModalBKListMR(true);
  };

  const filteredData = dataBon.filter((item) =>
    item?.MR_BatchNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchClick = () => {
    if (searchTerm) {
      setSearchTerm2("");
      fetchBonUseBK(searchTerm);
    }
  };

  const handleSearchClick2 = () => {
    if (searchTerm2) {
      setSearchTerm("");
      fetchBonUseBKByMR(searchTerm2);
    }
  };

  return (
    <>
      <NavbarDummy />
      {loading && <PreLoader />}

      <ModalUseBKListVatDummy
        isOpen={openModalBKListMR}
        onClose={() => setOpenModalBKListMR(false)}
        selectedItem={selectedItem}
      />
      <ModalBatalScanPenarikanDummy
        isOpen={openList}
        onClose={() => setOpenList(false)}
        type="BK"
      />

      <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6">
          <div className="surface-card p-5 mb-4">
            <div className="flex justify-between items-center gap-3 mb-4">
              <p className="heading-page">Withdraw Produk</p>
              <button
                className="btn-modern-danger"
                onClick={() => setOpenList(!openList)}
              >
                Batal Scan
              </button>
            </div>
            <div className="flex justify-between gap-4 flex-col md:flex-row">
              <div className="w-full">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  Cari Nomor Batch
                </p>
                <input
                  type="text"
                  placeholder="Enter search term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern mb-2"
                />
                <button
                  onClick={handleSearchClick}
                  className="btn-modern-primary"
                  disabled={searchTerm.length < 1}
                >
                  Search
                </button>
              </div>

              <div className="w-full">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                  Cari Nomor MR
                </p>
                <input
                  type="text"
                  placeholder="Enter search term"
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className="input-modern mb-2"
                />
                <button
                  onClick={handleSearchClick2}
                  className="btn-modern-primary"
                  disabled={searchTerm2.length < 1}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-500 text-sky-900 dark:text-sky-200 p-4 rounded-r-lg mt-4">
              <p className="font-bold mb-2">Info Data Dummy Use Bahan Kemas</p>
              <div className="text-sm space-y-1">
                <p>Search by Batch: BK-BATCH-001, BK-BATCH-002, BK-BATCH-003</p>
                <p>Search by MR: 00055/II/24/PN1/MR atau 00078/III/24/PN3/MR</p>
                <p>Contoh transaksi 1 (kg): MR 00055/II/24/PN1/MR Seq 1, Qty 1 kg (1000 gram), DNC-BK-0107</p>
                <p>Contoh transaksi 2 (kg): MR 00055/II/24/PN1/MR Seq 2, Qty 0.5 kg (500 gram), DNC-BK-0108</p>
                <p>Contoh transaksi 3 (pcs): MR 00078/III/24/PN3/MR Seq 1, Qty 300 pcs, DNC-BK-0110</p>
                <p className="font-semibold mt-2">Label scan VAT yang valid:</p>
                <p>BK/2026/010#7#1, BK/2026/010#7#2, BK/2026/010#7#3</p>
                <p>BK/2026/011#5#1, BK/2026/011#5#2</p>
                <p>BK/2026/050#1#1, BK/2026/050#1#2</p>
                <p className="italic mt-2">Alur: Search - Select - Scan di modal - Confirm - cek/undo lewat tombol Batal Scan.</p>
              </div>
            </div>
          </div>
          <div className="surface-card overflow-hidden">
            <div className="max-w-full overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Nomor Bon</th>
                    <th>Nama Bahan</th>
                    <th>No. Batch</th>
                    <th>Qty Penarikan</th>
                    <th>Satuan</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item?.MR_No} ({item?.MR_SeqID})
                      </td>
                      <td>
                        {item?.Product_Name ? item?.Product_Name : "-"} ({item?.MR_ItemID ? item?.MR_ItemID : "-"})
                      </td>
                      <td>{item?.MR_BatchNo ? item?.MR_BatchNo : "-"}</td>
                      <td>{item?.MR_DNcQTY}</td>
                      <td>{item?.MR_ItemUnit}</td>
                      <td>
                        <button
                          className="btn-modern-primary py-1.5 px-3 text-xs"
                          onClick={() =>
                            handleSelectClick(
                              item?.MR_No,
                              item?.MR_SeqID,
                              item?.MR_ItemID,
                              item?.MR_DNcQTY,
                              item?.MR_DNcNo,
                              item?.MR_ItemUnit
                            )
                          }
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
