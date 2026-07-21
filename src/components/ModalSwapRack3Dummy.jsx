import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import QrScannerRackDummy from "./QrScannerRackDummy";
import { cekRackIntoMock, moveRacksMock, quickDemoRacksScannerRack3 } from "../mocks/scanner2MockApi";
import { toast } from "react-toastify";

export default function ModalSwapRack3Dummy({
  handleCloseModal,
  selectedItems,
  scannedRackFirst,
  setForceUpdate,
  setSelectedItems,
}) {
  const [scannedRackInto, setScannedRackInto] = useState(undefined);
  const [openQrRack, setOpenQrRack] = useState(true);
  const [rackInto, setRackInto] = useState([]);
  const [loading, setLoading] = useState(false);

  const arrTtbaNo = selectedItems.map((item) => item.no_label);

  async function fetchCekRackInto() {
    setLoading(true);
    try {
      await cekRackIntoMock({
        scannedRackInto,
        arrTtbaNo,
        scannedRackFirst,
      });
      setRackInto([]);
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      if (msg === "Tipe Rak tidak sama") {
        Swal.fire({ title: "Tipe Rak tidak sama", icon: "error" });
        setScannedRackInto(undefined);
        setRackInto([]);
      } else if (msg?.includes("sudah terdaftar")) {
        setRackInto([{ label: msg }]);
      } else {
        Swal.fire({ title: "Oops!", text: msg, icon: "error" });
        setScannedRackInto(undefined);
        setRackInto([]);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await moveRacksMock({ selectedItems, scannedRackFirst, scannedRackInto });

      Swal.fire({
        title: "Berhasil Dipindahkan!",
        html: `
          <div style="font-size: 1.1em; margin-top: 10px;">
            <strong>TTBA:</strong>
            <ul style="list-style-type: disc; padding-left: 20px;">
              ${selectedItems.map((item) => `<li>${item?.no_label}</li>`).join("")}
            </ul>
            <strong>Dari Rak:</strong> ${scannedRackFirst}<br/>
            <strong>Ke Rak:</strong> ${scannedRackInto}
          </div>
        `,
        icon: "success",
        iconColor: "#4caf50",
        confirmButtonText: "OK",
        confirmButtonColor: "#4caf50",
        background: "#f0f8ff",
      });

      setSelectedItems([]);
      setForceUpdate((prev) => !prev);
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.response?.data?.message || error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scannedRackInto !== undefined) {
      fetchCekRackInto();
      setOpenQrRack(false);
    }
  }, [scannedRackInto]);

  function splitByHashTtba(s) { return String(s).split("#")[0]; }
  function splitByHashVatNo(s)  { return String(s).split("#")[2]; }

  return (
    <>
      <div className="fixed top-0 left-0 z-[100] h-full w-full bg-gray-600 bg-opacity-40 flex items-center justify-center">
        <div className="w-[80%] md:w-1/2 mb-20 p-6 pb-8 bg-white rounded">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-normal text-gray-900">
              Silahkan Scan Rak Tujuan
            </label>
            <button
              type="button"
              className="font-bold hover:opacity-50 transition-all duration-75"
              onClick={handleCloseModal}
            >
              X
            </button>
          </div>

          <div className="flex justify-center">
            {openQrRack && (
              <QrScannerRackDummy
                setScannedRack={setScannedRackInto}
                quickOptions={quickDemoRacksScannerRack3.filter(
                  (r) => r !== scannedRackFirst
                )}
              />
            )}
          </div>

          <div className="flex justify-center m-4">
            <button
              className="btn btn-sm btn-success"
              onClick={() => setOpenQrRack(!openQrRack)}
            >
              {openQrRack ? "Close" : "Open"} Scan QR
            </button>
          </div>

          {scannedRackInto && rackInto.length !== 0 && (
            <>
              <div
                className="bg-orange-100 border-t-4 border-orange-500 rounded-b text-teal-900 px-4 py-3 shadow-md m-5"
                role="alert"
              >
                <div className="flex">
                  <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-orange-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Terdapat produk pada rak ini,</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {scannedRackInto && rackInto.length === 0 && (
            <>
              <div
                className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md m-5"
                role="alert"
              >
                <div className="flex overflow-auto max-h-72">
                  <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Informasi Rak</p>
                    <p className="text-sm font-bold">
                      Bahan dapat dipindahkan ke rak {scannedRackInto}
                    </p>
                    <p>Product yang ingin dipindahkan,</p>
                    <p>
                      {selectedItems.map((item) => (
                        <ul key={item?.no_label}>
                          <li>{`${splitByHashTtba(item?.no_label)}, Vat No: ${splitByHashVatNo(item?.no_label)}`}</li>
                        </ul>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="m-5">
                <form>
                  {!loading && (
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-4"
                      type="submit"
                      onClick={(e) => handleSubmit(e)}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Submit"}
                    </button>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
