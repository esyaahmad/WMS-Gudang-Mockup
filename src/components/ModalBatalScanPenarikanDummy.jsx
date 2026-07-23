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
    <div className="modal-overlay" onClick={onClose}>
      {loading && <PreLoader />}
      <div
        className="modal-panel p-6 w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end items-center mb-4">
          <button className="btn-modern-danger" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
            Cari Nomor Permintaan (Produksi)
          </p>
          <input
            type="text"
            placeholder="Enter MR No"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern mb-2"
          />
          <input
            type="text"
            placeholder="Enter No. Analisa"
            value={searchTerm2}
            onChange={(e) => setSearchTerm2(e.target.value)}
            className="input-modern mb-2"
          />
          <button
            onClick={handleSearchClick}
            className="btn-modern-primary"
            disabled={searchTerm2.length < 1 || searchTerm.length < 1}
          >
            Search
          </button>
        </div>

        <div className="surface-card overflow-hidden mb-4">
          <table className="table-modern">
            <thead>
              <tr>
                <th>✔</th>
                <th>MR. No</th>
                <th>Kode Bahan</th>
                <th>No. Analisa</th>
                <th>Tgl. Penarikan</th>
                <th>No. Vat</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={checkedItems[index] || false}
                      onChange={(e) => handleCheck(item?.MR_SeqID, e.target.checked)}
                    />
                  </td>
                  <td>
                    {item?.MR_No} ({item?.MR_SeqID})
                  </td>
                  <td>{item?.MR_ItemID}</td>
                  <td>{item?.MR_DNcNo}</td>
                  <td>{item?.Process_Date}</td>
                  <td>{item?.No_VAT}</td>
                  <td>{item?.Nett_Gram}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100 dark:bg-gray-700/70">
                <td className="text-center" colSpan={6}>
                  Total (Checked)
                </td>
                <td>
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
        </div>
        <div className="flex justify-end">
          <button
            className="btn-modern-danger"
            onClick={handleUndoScan}
            disabled={loading}
          >
            {loading ? "Loading..." : "Undo Scan"}
          </button>
        </div>
      </div>
    </div>
  );
}
