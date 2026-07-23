import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import PreLoader from "./Widgets/PreLoader";

const ModalInputOpnameBKDummy = ({ isOpen, onClose, scanned, scannedRack, setScannedRack, setOpenQrRack }) => {
  if (!isOpen) return null;
  const [loading, setLoading] = useState(false);
  const [product2, setProduct2] = useState([]);
  const [editQty, setEditQty] = useState({});

  const scannedRackSegments = scannedRack?.split("/") || [];

  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProduct2([
        {
          TTBA_SeqID: 1,
          No_analisa: "DNC-BB-0001",
          item_name: "Bahan Dummy",
          ttba_itemid: "ITM-001",
          ttba_vatno: "1",
          TTBA_qty_per_Vat: 250,
          ttba_itemUnit: "KG",
          Status: "Release",
          QtySO: null,
          disabled: false,
        },
        {
          TTBA_SeqID: 2,
          No_analisa: "DNC-BB-0001",
          item_name: "Bahan Dummy",
          ttba_itemid: "ITM-001",
          ttba_vatno: "2",
          TTBA_qty_per_Vat: 250,
          ttba_itemUnit: "KG",
          Status: "Karantina",
          QtySO: null,
          disabled: false,
        },
      ]);
    } catch (error) {
      Swal.fire({
        title: error?.message || "Terjadi kesalahan",
        icon: "error",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value, index) => {
    setEditQty({ ...editQty, [index]: value });
  };

  const handleSaveQty = (index) => {
    const inputQty = editQty[index];

    if (!inputQty || Number(inputQty) <= 0) {
      Swal.fire({
        title: "Oops!",
        text: "Quantity cannot be empty or zero!",
        icon: "error",
      });
      return;
    }

    const updatedProducts = product2.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          QtySO: Number(editQty[index]) || item.QtySO,
          disabled: true,
        };
      }
      return item;
    });

    setProduct2(updatedProducts);
    setEditQty((prev) => ({ ...prev, [index]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      Swal.fire({
        title: "Berhasil Menambahkan!",
        html: `
          <div style="font-size: 1.1em; margin-top: 10px;">
            <strong>No. Analisa:</strong> 
            <ul style="list-style-type: disc; padding-left: 20px;">
              ${product2
                .map((item) => `<li>${item?.No_analisa}, Vat ${item?.ttba_vatno}, Qty = ${item?.QtySO}</li>`)
                .join("")}
            </ul>
          </div>
        `,
        icon: "success",
        iconColor: "#4caf50",
        confirmButtonText: "OK",
        confirmButtonColor: "#4caf50",
        background: "#f0f8ff",
      });

      onClose();
      setProduct2([]);
      setEditQty({});
      setScannedRack(undefined);
      setOpenQrRack(true);
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.message || "Terjadi kesalahan",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      {loading && <PreLoader />}
      <div
        className="modal-panel p-6 w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 gap-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Input Opname {scannedRackSegments[1]}.{scannedRackSegments[2]}.{scannedRackSegments[3]}
          </h2>
          <button className="btn-modern-danger" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="max-w-full overflow-x-auto">
          {product2.length > 0 ? (
            <div className="surface-card overflow-hidden mb-4">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>No. Bets</th>
                    <th>Nama Produk</th>
                    <th>Karton</th>
                    <th className="text-center">
                      Qty
                      <br />
                      Karton
                    </th>
                    <th>Status</th>
                    <th>Qty SO</th>
                  </tr>
                </thead>
                <tbody>
                  {product2?.map((item, idx) => (
                    <tr key={item?.TTBA_SeqID}>
                      <td>{idx + 1}</td>
                      <td>{item?.No_analisa}</td>
                      <td>
                        {item?.item_name} {item?.ttba_itemid}
                      </td>
                      <td>{item?.ttba_vatno}</td>
                      <td>
                        {item?.TTBA_qty_per_Vat} {item?.ttba_itemUnit}
                      </td>
                      <td>
                        {item?.Status === "Release" ? (
                          <span className="badge-release">Release</span>
                        ) : item?.Status === "Reject" ? (
                          <span className="badge-reject">Reject</span>
                        ) : (
                          <span className="badge-karantina">Karantina</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="0"
                            onChange={(e) => handleInputChange(e.target.value, idx)}
                            className="input-modern w-20 py-1"
                            disabled={item.disabled}
                          />
                          <button
                            className="btn-modern-primary py-1 px-2.5 text-xs"
                            onClick={() => handleSaveQty(idx)}
                            disabled={item.disabled}
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert-info-modern mb-4" role="alert">
              <p className="font-bold">Informasi</p>
              <p>Silahkan Scan QR Label Bahan</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          {product2?.length > 0 && (
            <form action="" onSubmit={handleSubmit} className="w-full max-w-sm">
              <button
                className={`w-full btn-modern py-2.5 ${
                  product2.some((product) => !product.QtySO)
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md"
                }`}
                type="submit"
                disabled={product2.some((product) => !product.QtySO) || loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalInputOpnameBKDummy;
