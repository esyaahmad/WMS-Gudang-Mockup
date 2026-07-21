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

      <div className="mt-16">
        <div className="mt-8">
          <div className="px-5 py-3">
            <div className="flex justify-between mt-2 mb-4">
              <p className="text-2xl font-bold text-gray-800">Withdraw Produk </p>
              <button
                className="btn btn-sm text-white bg-red-400"
                onClick={() => setOpenList(!openList)}
              >
                Batal Scan
              </button>
            </div>
            <div className="flex justify-between gap-4 flex-col md:flex-row">
              <div className="my-4 w-full">
                <p>Cari Nomor Batch</p>
                <input
                  type="text"
                  placeholder="Enter search term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-2"
                />
                <button
                  onClick={handleSearchClick}
                  className="btn btn-primary"
                  disabled={searchTerm.length < 1}
                >
                  Search
                </button>
              </div>

              <div className="my-4 w-full">
                <p>Cari Nomor MR</p>
                <input
                  type="text"
                  placeholder="Enter search term"
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-2"
                />
                <button
                  onClick={handleSearchClick2}
                  className="btn btn-primary"
                  disabled={searchTerm2.length < 1}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 rounded mt-2">
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
          <div className="max-w-full overflow-x-auto px-2 md:px-4">
            <table className="table-xs w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Nomor Bon</th>
                  <th className="border px-4 py-2">Nama Bahan</th>
                  <th className="border px-4 py-2">No. Batch</th>
                  <th className="border px-4 py-2">Qty Penarikan</th>
                  <th className="border px-4 py-2">No. Analisa</th>
                  <th className="border px-4 py-2">Satuan</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">
                      {item?.MR_No} ({item?.MR_SeqID})
                    </td>
                    <td className="border px-4 py-2">
                      {item?.Product_Name ? item?.Product_Name : "-"} ({item?.MR_ItemID ? item?.MR_ItemID : "-"})
                    </td>
                    <td className="border px-4 py-2">{item?.MR_BatchNo ? item?.MR_BatchNo : "-"}</td>
                    <td className="border px-4 py-2">{item?.MR_DNcQTY}</td>
                    <td className="border px-4 py-2">{item?.MR_DNcNo}</td>
                    <td className="border px-4 py-2">{item?.MR_ItemUnit}</td>

                    <td className="border px-4 py-2">
                      <button
                        className="btn btn-sm btn-primary"
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
    </>
  );
}
