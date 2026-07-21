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
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-3xl h-auto max-h-[80vh] overflow-auto">
          <div className="flex justify-between">
            <button className="btn btn-sm btn-danger" onClick={onClose}>
              Close
            </button>

            <span>
              <h1 className="text-xl font-bold">Jumlah Penarikan: {mrAmountModal}</h1>
            </span>
            <span>
              <h1 className="text-xl font-bold">List Wadah Bahan</h1>
            </span>
          </div>
          {openQr && (
            <div>
              <button
                className="btn btn-sm text-white bg-teal-400 mt-4"
                onClick={handleToggleQr}
              >
                {openQr ? "Close" : "Open"} Scan Label
              </button>
              <QrScannerDummy setScanned={setScanned} />
            </div>
          )}

          <div className="mt-4 overflow-auto max-h-72">
            {loading && (
              <div className="flex justify-center">
                <p>Loading....</p>
              </div>
            )}
            <table className="table-xs w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Lokasi</th>
                  <th className="border px-4 py-2">TTBA</th>
                  <th className="border px-4 py-2">No. Analisa</th>
                  <th className="border px-4 py-2">Item ID</th>
                  <th className="border px-4 py-2">Item Name</th>
                  <th className="border px-4 py-2">Qty</th>
                  <th className="border px-4 py-2">No. Wadah</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {dataVat.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">
                      {item?.Lokasi}/{item?.Rak}/{item?.Baris}/{item?.Kolom}
                    </td>
                    <td className="border px-4 py-2">
                      {item?.DNc_TTBANo.split("#")[0]} ({item?.DNc_TTBANo.split("#")[1]})
                    </td>
                    <td className="border px-4 py-2">{item?.DNc_No}</td>
                    <td className="border px-4 py-2">{item?.Item_ID}</td>
                    <td className="border px-4 py-2">{item?.Item_Name}</td>
                    <td className="border px-4 py-2">{item?.Qty}</td>
                    <td className="border px-4 py-2">{getLastNumberFromDNC(item?.DNc_TTBANo)}</td>
                    <td className="border px-4 py-2">
                      <button
                        className="btn btn-sm btn-primary"
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
              className="btn btn-sm btn-success mt-4"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Loading..." : "Confirm"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
