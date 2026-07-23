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
      return { status: "Reject", className: "badge-reject" };
    } else if (item?.Status === "Release") {
      return { status: "Release", className: "badge-release" };
    } else {
      return { status: "Karantina", className: "badge-karantina" };
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
      <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
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
        <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6">
          <div className="surface-card p-5 mb-4">
            <div className="flex justify-between items-center gap-3 mb-4">
              <p className="heading-page">Pemindahan Pemetaan Produk</p>
              <button
                className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
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
                <div className="surface-card p-5 mb-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                    <p className="heading-page">
                      {scannedRack}
                      <br />
                      <span className="text-xs font-normal text-muted">
                        (Lokasi/Rak/Baris/Kolom)
                      </span>
                    </p>
                    <input
                      type="text"
                      placeholder="Search by No. Bets"
                      className="input-modern sm:max-w-xs"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <button
                      className="btn-modern bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md"
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          return toast.error("No items selected!");
                        }
                        setIsModalOpen(true);
                      }}
                    >
                      Move Selected Items
                    </button>
                    <div className="flex gap-2">
                      {scannedRack && (
                        <button
                          className="btn-modern bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md"
                          onClick={() => setOpenQrLabelModal(true)}
                        >
                          Scan Label
                        </button>
                      )}
                      <button
                        className="btn-modern-danger"
                        onClick={handleResetSelection}
                      >
                        {selectedItems.length} Selected
                        <span>✕</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="surface-card overflow-hidden mb-4 max-w-full overflow-x-auto">
                  <table className="table-modern">
                    <thead>
                      <tr>
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
                              ? "!bg-sky-50 dark:!bg-sky-900/30"
                              : ""
                          }
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item?.no_label)}
                              onChange={() =>
                                handleCheckboxClick(item?.no_label)
                              }
                            />
                          </td>
                          <td>{item.DNc_No}</td>
                          <td>{splitByHashTtba(item?.no_label)}</td>
                          <td>{`${item.Item_Name} ${item.item_ID}`}</td>
                          <td>{Math.round(item?.Qty * 1000) / 1000}</td>
                          <td>{splitByHashVatQty(item?.no_label)}</td>
                          <td>
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
              <div className="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-500 text-sky-700 dark:text-sky-300 p-4 rounded-r-lg mb-4">
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
