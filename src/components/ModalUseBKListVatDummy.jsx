import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import QrScannerDummy from "./QrScannerDummy";
import {
  createPpicListManualBKMock,
  fetchDetailVatFromBonMock,
} from "../mocks/scanner2MockApi";

export default function ModalUseBKListVatDummy({ isOpen, onClose, selectedItem }) {
  if (!isOpen) return null;

  const [dataVat, setDataVat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openQr, setOpenQr] = useState(false);
  const [scanned, setScanned] = useState(undefined);
  const [mrAmountModal, setMrAmountModal] = useState(0);
  const [selectedVats, setSelectedVats] = useState([]);
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchVatFromBon = async () => {
    setLoading(true);
    const body = {
      formatedItemId: selectedItem?.MR_ItemID,
      formatedMR_NoAnalisa: selectedItem?.MR_NoAnalisa,
      MrNo: selectedItem?.MR_No,
      MrSeqId: selectedItem?.MR_SeqID,
    };

    try {
      const response = await fetchDetailVatFromBonMock(body);
      setDataVat(response);
    } catch (error) {
      Swal.fire({
        title: error?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
      setDataVat([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVat = (
    Lokasi,
    Rak,
    Baris,
    Kolom,
    DNc_No,
    Item_ID,
    Qty,
    No_Vat,
    DNc_TTBANo
  ) => {
    if (mrAmountModal === 0) return;

    const newMrAmountModal = parseFloat((mrAmountModal - Qty).toFixed(3));
    const selectedItemData = {
      Lokasi,
      Rak,
      Baris,
      Kolom,
      DNc_No,
      Item_ID,
      No_Vat,
      DNc_TTBANo,
    };

    if (newMrAmountModal === 0) {
      setSelectedVats([...selectedVats, { ...selectedItemData, Qty }]);
      setMrAmountModal(0);
      setConfirmEnabled(true);
    } else if (newMrAmountModal < 0) {
      setSelectedVats([
        ...selectedVats,
        { ...selectedItemData, Qty: mrAmountModal },
      ]);
      setMrAmountModal(0);
      setConfirmEnabled(true);
    } else {
      setSelectedVats([...selectedVats, { ...selectedItemData, Qty }]);
      setMrAmountModal(newMrAmountModal);
    }
  };

  const isVatSelected = (No_Vat, DNc_No, DNc_TTBANo) => {
    return selectedVats.some(
      (item) =>
        item.No_Vat === No_Vat &&
        item.DNc_No === DNc_No &&
        item.DNc_TTBANo === DNc_TTBANo
    );
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await createPpicListManualBKMock({
        selectedVats,
        selectedItem,
      });

      Swal.fire("Success!", "Bahan berhasil ditarik untuk produksi", "success");
      onClose();
    } catch (error) {
      Swal.fire({
        title: error?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVatFromBon();
    if (selectedItem?.MR_ItemUnit === "kg") {
      setMrAmountModal(selectedItem?.MR_DNcQTY * 1000);
    } else {
      setMrAmountModal(selectedItem?.MR_DNcQTY);
    }
  }, []);

  function getLastNumberFromDNC(dnc) {
    const lastPart = String(dnc).split("#").pop();
    const lastNumber = parseInt(lastPart, 10);
    return lastNumber;
  }

  const handleToggleQr = () => {
    setOpenQr(!openQr);
  };

  const handleSelectButtonClick = (item) => {
    if (!isVatSelected(getLastNumberFromDNC(item?.DNc_TTBANo), item?.DNc_No, item?.DNc_TTBANo)) {
      setOpenQr(true);
      setCurrentItem(item);
      setScanned(undefined);
    }
  };

  useEffect(() => {
    if (scanned && currentItem && scanned === currentItem?.DNc_TTBANo) {
      handleSelectVat(
        currentItem?.Lokasi,
        currentItem?.Rak,
        currentItem?.Baris,
        currentItem?.Kolom,
        currentItem?.DNc_No,
        currentItem?.Item_ID,
        currentItem?.Qty,
        getLastNumberFromDNC(currentItem?.DNc_TTBANo),
        currentItem?.DNc_TTBANo
      );
      setOpenQr(false);
      setCurrentItem(null);
      setScanned(undefined);
    }
  }, [scanned, currentItem]);

  useEffect(() => {
    if (scanned && currentItem && scanned !== currentItem?.DNc_TTBANo) {
      Swal.fire({
        title: "No. Vat atau No. Analisa tidak sesuai",
        icon: "error",
      });

      setOpenQr(false);
      setCurrentItem(null);
      setScanned(undefined);
    }

    if (scanned && currentItem && selectedItem?.MR_NoAnalisa !== currentItem?.DNc_No) {
      Swal.fire({
        title: "No. Analisa tidak sesuai",
        icon: "error",
      });

      setOpenQr(false);
      setCurrentItem(null);
      setScanned(undefined);
    }
  }, [scanned]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel p-6 w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap justify-between items-center gap-3">
          <button className="btn-modern-danger" onClick={onClose}>
            Close
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Jumlah Penarikan: {mrAmountModal}
          </h1>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            List Wadah Bahan
          </h1>
        </div>
        {openQr && (
          <div className="mt-4">
            <button className="btn-modern-primary mb-3" onClick={handleToggleQr}>
              {openQr ? "Close" : "Open"} Scan Label
            </button>
            <QrScannerDummy setScanned={setScanned} />
          </div>
        )}

        <div className="mt-4 overflow-auto max-h-72 rounded-lg border border-gray-100 dark:border-gray-700">
          {loading && (
            <div className="flex justify-center py-3 text-muted">
              <p>Loading....</p>
            </div>
          )}
          <table className="table-modern">
            <thead>
              <tr>
                <th>Lokasi</th>
                <th>NIE</th>
                <th>No. BETS</th>
                <th>Produk Kode</th>
                <th>Produk Name</th>
                <th>Qty</th>
                <th>No. Karton</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dataVat.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item?.Lokasi}/{item?.Rak}/{item?.Baris}/{item?.Kolom}
                  </td>
                  <td>
                    {item?.DNc_TTBANo.split("#")[0]} ({item?.DNc_TTBANo.split("#")[1]})
                  </td>
                  <td>{item?.DNc_No}</td>
                  <td>{item?.Item_ID}</td>
                  <td>{item?.Item_Name}</td>
                  <td>{item?.Qty}</td>
                  <td>{getLastNumberFromDNC(item?.DNc_TTBANo)}</td>
                  <td>
                    <button
                      className="btn-modern-primary py-1 px-2.5 text-xs"
                      onClick={() => handleSelectButtonClick(item)}
                      disabled={isVatSelected(
                        getLastNumberFromDNC(item?.DNc_TTBANo),
                        item?.DNc_No,
                        item?.DNc_TTBANo
                      )}
                    >
                      Scan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {confirmEnabled && (
          <button
            className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md mt-4"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Loading..." : "Confirm"}
          </button>
        )}
      </div>
    </div>
  );
}
