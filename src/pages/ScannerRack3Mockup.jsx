import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import QrScannerRackDummy from "../components/QrScannerRackDummy";
import ModalValidateLabelSwapRackDummy from "../components/ModalValidateLabelSwapRackDummy";
import ModalSwapRack3Dummy from "../components/ModalSwapRack3Dummy";
import NavbarDummy from "../components/NavbarDummy";
import {
  fetchRackByLocationMock,
  quickDemoRacksScannerRack3,
} from "../mocks/scanner2MockApi";

export default function ScannerRack3Mockup() {
  const [openQrRack, setOpenQrRack] = useState(true);
  const [scanned, setScanned] = useState(undefined);
  const [scannedRack, setScannedRack] = useState(undefined);
  const [rack, setRack] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [scannedRackFirst, setScannedRackFirst] = useState(undefined);

  const [forceUpdate, setForceUpdate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentItemId, setCurrentItemId] = useState(null);
  const [openQrLabelModal, setOpenQrLabelModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  async function fetchRack() {
    const loadingToastId = toast.info("Fetching product data...", {
      autoClose: false,
    });
    try {
      const data = await fetchRackByLocationMock(scannedRack);
      setRack(data);
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.error(error?.response?.data?.message);
        setScannedRack(undefined);
        setRack([]);
      } else {
        toast.error(error?.response?.data?.message || "Terjadi kesalahan");
        setScannedRack(undefined);
        setRack([]);
      }
    } finally {
      toast.dismiss(loadingToastId);
    }
  }

  function splitByHashTtba(inputString) {
    return String(inputString).split("#")[0];
  }

  function splitByHashVatQty(inputString) {
    return String(inputString).split("#")[2];
  }

  function determineStatus(item) {
    if (item?.Status === "Reject") {
      return {
        status: "Reject",
        className: "font-semibold bg-red-200 p-1 rounded-md",
      };
    } else if (item?.Status === "Release") {
      return {
        status: "Release",
        className: "font-semibold bg-green-200 p-1 rounded-md",
      };
    } else {
      return {
        status: "Karantina",
        className: "font-semibold bg-orange-200 p-1 rounded-md",
      };
    }
  }

  useEffect(() => {
    if (scannedRack !== undefined) {
      fetchRack();
      setScannedRackFirst(scannedRack);
      setOpenQrRack(false);
    }
  }, [scannedRack, forceUpdate]);

  useEffect(() => {
    if (scanned) {
      const itemToCheck = rack.find((item) => item?.no_label === scanned);
      if (itemToCheck) {
        handleCheckboxChange(itemToCheck?.no_label);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No item found with the scanned label!",
        });
      }
      setOpenQrLabelModal(true);
      setScanned(null);
    }
  }, [scanned]);

  useEffect(() => {
    if (selectedItems.length === filteredRack.length && filteredRack.length > 0) {
      setOpenQrLabelModal(false);
    }
  }, [selectedItems]);

  const filteredRack = rack.filter((item) =>
    splitByHashTtba(item?.no_label)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleCheckboxClick = (itemId) => {
    setCurrentItemId(itemId);
    setOpenQrLabelModal(true);
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemId)
        ? prevSelectedItems.filter((id) => id !== itemId)
        : [...prevSelectedItems, itemId]
    );
  };

  const handleSelectAll = () => {
    const allItemIds = rack.map((item) => item?.no_label);
    setSelectedItems(allItemIds);
  };

  const handleResetSelection = () => {
    setSelectedItems([]);
  };

  return (
    <>
      <NavbarDummy />
      <div className="mt-16">
        {isModalOpen && (
          <ModalSwapRack3Dummy
            handleCloseModal={() => setIsModalOpen(false)}
            selectedItems={rack.filter((item) =>
              selectedItems.includes(item?.no_label)
            )}
            scannedRackFirst={scannedRackFirst}
            setForceUpdate={setForceUpdate}
            setSelectedItems={setSelectedItems}
          />
        )}
        <div className="mt-8 ">
          <div className="px-5 py-3">
            <div className="flex justify-between mt-2 mb-4">
              <p className="text-2xl font-bold text-gray-800">
                Pemindahan Pemetaan Produk
              </p>
              <button
                className="btn btn-sm btn-success mr-4"
                onClick={() => setOpenQrRack(!openQrRack)}
              >
                {openQrRack ? "Close" : "Open"} Scan Rak
              </button>
            </div>

            {openQrRack && (
              <QrScannerRackDummy
                setScannedRack={setScannedRack}
                quickOptions={quickDemoRacksScannerRack3}
              />
            )}
          </div>

          <div>
            {rack.length > 0 ? (
              <>
                <div className="flex justify-between mt-2 mb-4">
                  <p className=" ml-4 text-2xl font-bold text-gray-800">
                    {scannedRack} <br />
                    <span className="text-xs text-gray-800">
                      (Lokasi/Rak/Baris/Kolom)
                    </span>
                  </p>
                  <input
                    type="text"
                    placeholder="Search by No. Bets"
                    className="input input-bordered mx-4 input-md w-full max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex justify-between m-2">
                  <button
                    className="btn bg-blue-500 text-white"
                    onClick={() => {
                      if (selectedItems.length === 0) {
                        return toast.error("No items selected!");
                      }
                      setIsModalOpen(true);
                    }}
                  >
                    Move Selected Items
                  </button>
                  <div>
                    {scannedRack && (
                      <button
                        className="btn btn-sm bg-teal-500 text-white ml-2"
                        onClick={() => setOpenQrLabelModal(true)}
                      >
                        Scan Label
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-error ml-2"
                      onClick={handleResetSelection}
                    >
                      {selectedItems.length} Selected
                      <span className="ml-1">✕</span>
                    </button>
                  </div>
                </div>

                <div className="max-w-full overflow-x-auto">
                  <table className="table table-xs mt-4">
                    <thead>
                      <tr className="bg-slate-200">
                        <th>
                          <button
                            onClick={
                              selectedItems.length > 0
                                ? handleResetSelection
                                : handleSelectAll
                            }
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedItems.length === rack.length &&
                                rack.length > 0
                              }
                              onChange={() => {}}
                            />
                          </button>
                        </th>
                        <th>No. Bets</th>
                        <th>NIE</th>
                        <th>Produk Name</th>
                        <th>Qty</th>
                        <th>No. Karton</th>
                        <th>status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRack?.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            selectedItems.includes(item?.no_label)
                              ? "bg-blue-100"
                              : ""
                          }
                        >
                          <td className="border border-gray-300">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item?.no_label)}
                              onChange={() =>
                                handleCheckboxClick(item?.no_label)
                              }
                            />
                          </td>
                          <td className="border border-gray-300">
                            {item.DNc_No}
                          </td>
                          <td className="border border-gray-300">
                            {splitByHashTtba(item?.no_label)}
                          </td>
                          <td className="border border-gray-300">{`${item.Item_Name} ${item.item_ID}`}</td>
                          <td className="border border-gray-300">
                            {Math.round(item?.Qty * 1000) / 1000}
                          </td>
                          <td className="border border-gray-300">
                            {splitByHashVatQty(item?.no_label)}
                          </td>
                          <td className="border border-gray-300">
                            <span className={determineStatus(item).className}>
                              {determineStatus(item)?.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div
                className="fixed bottom-0 w-full bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 m-5"
                role="alert"
              >
                <p className="font-bold">Informasi</p>
                <p>Silahkan Scan QR Rak</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalValidateLabelSwapRackDummy
        isOpen={openQrLabelModal}
        onClose={() => setOpenQrLabelModal(false)}
        setScanned={setScanned}
      />
    </>
  );
}
