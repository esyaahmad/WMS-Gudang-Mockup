import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  getListTimbangManualBatalScanMock,
  undoWithdrawPpicBkMock,
} from "../mocks/scanner2MockApi";
import PreLoader from "./Widgets/PreLoader";

export default function ModalBatalScanPenarikanDummy({ isOpen, onClose, type }) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [checkedData, setCheckedData] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCheck = (seqID, checked) => {
    const updated = {};
    if (checked) {
      data.forEach((item, idx) => {
        if (item?.MR_SeqID === seqID) {
          updated[idx] = true;
        }
      });
      const firstItem = data.find((item) => item?.MR_SeqID === seqID);
      setCheckedData({
        MR_No: firstItem?.MR_No,
        MR_SeqID: seqID,
        MR_ItemID: firstItem?.MR_ItemID,
        MR_DNcNo: firstItem?.MR_DNcNo,
        type,
      });
    } else {
      setCheckedData({});
    }
    setCheckedItems(updated);
  };

  const handleSearchClick = () => {
    fetchBonUseBK(searchTerm, searchTerm2);
  };

  const fetchBonUseBK = async (mrNo, dncNo) => {
    setLoading(true);
    try {
      const response = await getListTimbangManualBatalScanMock({
        type,
        mr_no: mrNo,
        dnc_no: dncNo,
      });

      if (response.length === 0) {
        toast.error("Data tidak ditemukan");
      }
      setData(response);
      setCheckedItems({});
      setCheckedData({});
    } catch (error) {
      Swal.fire({
        title: error?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoScan = async () => {
    if (Object.keys(checkedData).length === 0) {
      Swal.fire({
        text: "Tidak ada data yang dipilih",
        icon: "error",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Lakukan Batal Scan Pada List Ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await undoWithdrawPpicBkMock(checkedData);
        Swal.fire({
          title: "Success",
          text: "Withdrawal has been undone successfully",
          icon: "success",
        });
        onClose();
      } catch (error) {
        Swal.fire({
          title: error?.response?.data?.message || "Terjadi kesalahan",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            {loading && <PreLoader />}

            <button
              className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-600"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="my-4">
            <p>Cari Nomor Permintaan (Produksi)</p>
            <input
              type="text"
              placeholder="Enter MR No"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-2"
            />
            <input
              type="text"
              placeholder="Enter No. Analisa"
              value={searchTerm2}
              onChange={(e) => setSearchTerm2(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-2"
            />
            <button
              onClick={handleSearchClick}
              className="btn btn-primary"
              disabled={searchTerm2.length < 1 || searchTerm.length < 1}
            >
              Search
            </button>
          </div>

          <table className="table-auto table-xs w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border px-4 py-2">✔</th>
                <th className="border px-4 py-2">MR. No</th>
                <th className="border px-4 py-2">Kode Bahan</th>
                <th className="border px-4 py-2">No. Analisa</th>
                <th className="border px-4 py-2">Tgl. Penarikan</th>
                <th className="border px-4 py-2">No. Vat</th>
                <th className="border px-4 py-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={checkedItems[index] || false}
                      onChange={(e) => handleCheck(item?.MR_SeqID, e.target.checked)}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    {item?.MR_No} ({item?.MR_SeqID})
                  </td>
                  <td className="border px-4 py-2">{item?.MR_ItemID}</td>
                  <td className="border px-4 py-2">{item?.MR_DNcNo}</td>
                  <td className="border px-4 py-2">{item?.Process_Date}</td>
                  <td className="border px-4 py-2">{item?.No_VAT}</td>
                  <td className="border px-4 py-2">{item?.Nett_Gram}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="border px-4 py-2 text-center" colSpan={6}>
                  Total (Checked)
                </td>
                <td className="border px-4 py-2">
                  {data.reduce((sum, item, index) => {
                    if (checkedItems[index]) {
                      return sum + (Number(item?.Nett_Gram) || 0);
                    }
                    return sum;
                  }, 0)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <button
              className="btn btn-sm text-white bg-red-500"
              onClick={handleUndoScan}
              disabled={loading}
            >
              {loading ? "Loading..." : "Undo Scan"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
