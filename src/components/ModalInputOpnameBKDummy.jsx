import React, { useState } from "react";
import Swal from "sweetalert2";

const ModalInputOpnameBKDummy = ({ isOpen, onClose, scanned, scannedRack, setScannedRack, setOpenQrRack }) => {
  if (!isOpen) return null;
  const [loading, setLoading] = useState(false);

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
              <li>DNC-BB-0001, Vat 1, Qty = 250</li>
              <li>DNC-BB-0001, Vat 2, Qty = 250</li>
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

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-md shadow-lg max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Input Opname</h2>
            <button
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Scan QR: {scanned || "Belum di scan"}
              </label>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rak: {scannedRack || "-"}
              </label>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Silahkan input Opname untuk produk ini. Klik Submit untuk melanjutkan.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 btn btn-sm btn-outline"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn btn-sm btn-primary"
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalInputOpnameBKDummy;
