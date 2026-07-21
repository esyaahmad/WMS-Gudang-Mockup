import QrScannerDummy from "../components/QrScannerDummy";
import QrScannerRackDummy from "../components/QrScannerRackDummy";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalInputOpnameBKDummy from "../components/ModalInputOpnameBKDummy";
import ModalListOpnameDummy from "../components/ModalListOpnameDummy";
import NavbarDummy from "../components/NavbarDummy";
import {
  fetchProductStockOpnameMock,
  submitStockOpnameMock,
  quickDemoRacksScannerRack3,
} from "../mocks/scanner2MockApi";

export default function StockOpnameYearlyMockup() {
  const [openQr, setOpenQr] = useState(false);
  const [openQrRack, setOpenQrRack] = useState(true);
  const [scanned, setScanned] = useState(undefined);
  const [scannedRack, setScannedRack] = useState(undefined);
  const [openModalInput, setOpenModalInput] = useState(false);
  const [openListOpname, setOpenListOpname] = useState(false);

  const [product, setProduct] = useState([]);
  const [editQty, setEditQty] = useState({});
  const [totalPerRak, setTotalPerRak] = useState(0);
  const [totalQty, setTotalQty] = useState(0);

  const arrScanned = scanned?.split("#");
  const ttba = arrScanned?.[0]?.replace(/\//g, "-");
  const seqId = arrScanned?.[1];
  const vat = arrScanned?.[2];

  async function fetchProduct() {
    const loadingToastId = toast.info("Fetching product data...", {
      autoClose: false,
    });
    try {
      const data = await fetchProductStockOpnameMock({
        ttba: ttba?.replace(/-/g, "/"),
        seqId,
        vat,
        scannedRack,
      });

      const alreadyScanned = product.some((item) => {
        const isMatch =
          item?.TTBA_No === ttba.replace(/-/g, "/") &&
          item?.TTBA_SeqID === +seqId;
        return isMatch;
      });

      if (alreadyScanned) {
        Swal.fire({
          title: "Bahan sudah diScan!",
          text: "label identitas ini sudah di scan",
          icon: "warning",
          confirmButtonText: "OK",
          confirmButtonColor: "#f0ad4e",
        });
      } else {
        setProduct(data.product);
        setTotalPerRak(data.totalGudangDetailperRak);
        setTotalQty(data.totalGudangDetail);
        setOpenQr(false);
        setScanned(undefined);
      }
    } catch (error) {
      if (error?.response?.data?.message === "Pemetaan Gudang tidak ditemukan") {
        Swal.fire({
          title: "Analisa tidak ditemukan!",
          text: "Silahkan input Opname",
          icon: "warning",
          confirmButtonText: "OK",
        });
        setOpenModalInput(true);
        setOpenQr(false);
      } else {
        Swal.fire({
          title: "Oops!",
          text: error?.response?.data?.message || "Terjadi kesalahan",
          icon: "error",
        });
        setScanned(undefined);
      }
    } finally {
      toast.dismiss(loadingToastId);
    }
  }

  async function fetchRack() {
    if (scannedRack?.split("/").length !== 4) {
      Swal.fire({
        title: "Rak tidak valid!",
        text: "Silahkan scan rak yang valid",
        icon: "error",
        confirmButtonText: "OK",
      });
      setScannedRack(undefined);
      setOpenQrRack(true);
    } else {
      setOpenQrRack(false);
      setOpenQr(true);
    }
  }

  const handleInputChange = (value, index) => {
    setEditQty({ ...editQty, [index]: value });
  };

  const handleSaveQty = (index) => {
    const inputQty = editQty[index];
    if (!inputQty || inputQty <= 0) {
      toast.error("Quantity cannot be empty or zero!");
      return;
    }

    const updatedProducts = product.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          QtySO: Number(inputQty),
          disabled: true,
        };
      }
      return item;
    });
    setProduct(updatedProducts);
    setEditQty((prev) => ({ ...prev, [index]: "" }));
    toast.success("Quantity updated successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitStockOpnameMock({ product, scannedRack });

      Swal.fire({
        title: "Berhasil Menambahkan!",
        html: `
          <div style="font-size: 1.1em; margin-top: 10px;">
            <strong>No. Analisa:</strong>
            <ul style="list-style-type: disc; padding-left: 20px;">
              ${product
                .map(
                  (item) =>
                    `<li>${item?.DNc_No}, Vat ${item?.ttba_vatno}, Qty = ${item?.QtySO ?? item?.Qty}</li>`
                )
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

      setScanned(undefined);
      setScannedRack(undefined);
      setProduct([]);
      setEditQty({});
      setTotalPerRak(0);
      setTotalQty(0);
      setOpenQr(false);
      setOpenQrRack(true);
      setOpenModalInput(false);
      setOpenListOpname(false);
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.response?.data?.message || error?.message,
        icon: "error",
      });
    }
  };

  const handleToggleQr = () => {
    if (openQrRack) {
      setOpenQrRack(false);
    }
    setOpenQr(!openQr);
  };

  const handleToggleQrRack = () => {
    if (openQr) {
      setOpenQr(false);
    }
    setOpenQrRack(!openQrRack);
  };

  useEffect(() => {
    if (scanned !== undefined) {
      fetchProduct();
    }
  }, [scanned]);

  useEffect(() => {
    if (scannedRack !== undefined) {
      fetchRack();
    }
  }, [scannedRack]);

  const scannedRackSegments = scannedRack?.split("/");
  const filteredProducts = product
    .filter(
      (item) =>
        item.Lokasi === scannedRackSegments?.[0] &&
        item.Rak === scannedRackSegments?.[1] &&
        item.Baris === scannedRackSegments?.[2] &&
        item.Kolom === scannedRackSegments?.[3]
    )
    .sort((a, b) => {
      if (a.ttba_vatno < b.ttba_vatno) return -1;
      if (a.ttba_vatno > b.ttba_vatno) return 1;
      return 0;
    });

  return (
    <>
      <NavbarDummy />
      <div className="mt-16">
        <ModalInputOpnameBKDummy
          isOpen={openModalInput}
          onClose={() => setOpenModalInput(false)}
          scanned={scanned}
          scannedRack={scannedRack}
          setScannedRack={setScannedRack}
          setOpenQrRack={setOpenQrRack}
        />
        <ModalListOpnameDummy
          isOpen={openListOpname}
          onClose={() => setOpenListOpname(false)}
          type="BB"
          scannedRack={scannedRack}
        />
        <div className="mt-8 ">
          <div className="px-5 py-3">
            <div className="flex justify-between mt-2 mb-4">
              <p className="text-2xl font-bold text-gray-800">
                Stock Opname Bahan Baku
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm text-white bg-blue-400"
                  onClick={() => setOpenListOpname(!openListOpname)}
                  disabled={!scannedRack}
                >
                  List Opname
                </button>
                <button
                  className="btn btn-sm text-white bg-teal-400"
                  onClick={handleToggleQr}
                  disabled={!scannedRack}
                >
                  {openQr ? "Close" : "Open"} Scan Label
                </button>
              </div>
            </div>
            <div>
              {scannedRack && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-5 ">
                  <div>
                    <p className="font-bold">Rak yang dipilih:</p>
                    <p className="font-bold">
                      {scannedRackSegments?.[1]}.{scannedRackSegments?.[2]}.
                      {scannedRackSegments?.[3]}
                    </p>
                    <br />
                  </div>
                  <div className="flex justify-between">
                    <pre className="font-mono font-bold text-xs">
                      {`Total Rak          : ${(Math.round(totalPerRak * 1000) / 1000).toFixed(3).padStart(10)}`}
                      {`\nTotal Rak SO       : ${filteredProducts
                        .reduce(
                          (sum, item, idx) =>
                            sum +
                            (editQty[idx]
                              ? Number(Math.round(editQty[idx] * 1000) / 1000)
                              : Number(Math.round(((item?.QtySO ?? item?.Qty) || 0) * 1000) / 1000)),
                          0
                        )
                        .toFixed(3)
                        .padStart(10)}`}
                      {`\nSelish (Rak - SO)  : ${(
                        Math.round(totalPerRak * 1000) / 1000 -
                        Math.round(
                          filteredProducts.reduce(
                            (sum, item, idx) =>
                              Math.round(sum * 1000) / 1000 +
                              (editQty[idx]
                                ? Number(Math.round(editQty[idx] * 1000) / 1000)
                                : Number(Math.round(((item?.QtySO ?? item?.Qty) || 0) * 1000) / 1000)),
                            0
                          ) * 1000
                        ) /
                          1000
                      )
                        .toFixed(3)
                        .padStart(10)}`}
                    </pre>

                    <pre className="ml-4 font-mono font-bold text-xs">
                      {`Total WMS          : ${(Math.round(totalQty * 1000) / 1000).toFixed(3).padStart(10)}`}
                      {`\nTotal Qty SO       : ${product
                        .reduce(
                          (sum, item, idx) =>
                            sum +
                            (editQty[idx]
                              ? Number(Math.round(editQty[idx] * 1000) / 1000)
                              : Number(Math.round(((item?.QtySO ?? item?.Qty) || 0) * 1000) / 1000)),
                          0
                        )
                        .toFixed(3)
                        .padStart(10)}`}
                      {`\nSelish (WMS - SO)  : ${(
                        Math.round(totalQty * 1000) / 1000 -
                        Math.round(
                          product.reduce(
                            (sum, item, idx) =>
                              Math.round(sum * 1000) / 1000 +
                              (editQty[idx]
                                ? Number(Math.round(editQty[idx] * 1000) / 1000)
                                : Number(Math.round(((item?.QtySO ?? item?.Qty) || 0) * 1000) / 1000)),
                            0
                          ) * 1000
                        ) /
                          1000
                      )
                        .toFixed(3)
                        .padStart(10)}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            {openQr && <QrScannerDummy setScanned={setScanned} />}
          </div>
          <div className="max-w-full overflow-x-auto max-h-[750px] overflow-y-auto">
            {product.length > 0 ? (
              <table className="table table-xs border m-4">
                <thead className="sticky top-0 bg-slate-300 z-10">
                  <tr>
                    <th className="sticky top-0 bg-slate-300 z-10">No.</th>
                    <th className="sticky top-0 bg-slate-300 z-10">NIE</th>
                    <th className="sticky top-0 bg-slate-300 z-10">No. Bets</th>
                    <th className="sticky top-0 bg-slate-300 z-10">Nama Produk</th>
                    <th className="sticky top-0 bg-slate-300 z-10">Lokasi</th>
                    <th className="sticky top-0 bg-slate-300 z-10">Karton</th>
                    {/* <th className="sticky top-0 bg-slate-300 z-10 text-center">Qty TTBA</th> */}
                    <th className="sticky top-0 bg-slate-300 z-10 text-center">Qty System</th>
                    {/* <th className="sticky top-0 bg-slate-300 z-10 text-center">Qty Sampling</th> */}
                    <th className="sticky top-0 bg-slate-300 z-10">Status</th>
                    {/* <th className="sticky top-0 bg-slate-300 z-10">Sampling</th> */}
                    <th className="sticky top-0 bg-slate-300 z-10">Qty SO</th>
                    <th className="sticky top-0 bg-slate-300 z-10">Koreksi</th>
                  </tr>
                </thead>
                <tbody>
                  {product?.map((item, idx) => (
                    <tr key={`${item.TTBA_No}#${item.TTBA_SeqID}#${item.ttba_vatno}`}>
                      <td className="border border-gray-300">{idx + 1}</td>
                      <td className="border border-gray-300">{item?.DNc_TTBANo.split("#")[0]}</td>
                      <td className="border border-gray-300">{item?.DNc_No}</td>
                      <td className="border border-gray-300">
                        {item?.item_name} {item?.ttba_itemid}
                      </td>
                      <td className="border border-gray-300">
                        {item?.Rak ? `${item?.Rak}.${item?.Baris}.${item?.Kolom}` : "-"}
                      </td>
                      <td className="border border-gray-300">{item?.ttba_vatno}</td>
                      {/* <td className="border border-gray-300">
                        {item?.TTBA_qty_per_Vat} {item?.ttba_itemUnit}
                      </td> */}
                      <td className="border border-gray-300">
                        {Math.round(item?.qtyWms * 1000) / 1000}
                      </td>
                      {/* <td className="border border-gray-300">{item?.QtySampling}</td> */}
                      <td className="border border-gray-300">
                        {item?.StatusVat === "Release" ? (
                          <span className="font-semibold bg-green-400 p-1 rounded-md">Release</span>
                        ) : item?.StatusVat === "Reject" ? (
                          <span className="font-semibold bg-red-300 p-1 rounded-md">Reject</span>
                        ) : (
                          <span className="font-semibold bg-orange-300 p-1 rounded-md">Karantina</span>
                        )}
                      </td>
                      {/* <td className="border border-gray-300">
                        {item?.StatusSampling || "-"}
                      </td> */}
                      <td className="border border-gray-300 text-center">
                        <input
                          type="number"
                          placeholder={item?.QtySO ?? item?.Qty}
                          value={editQty[idx] || ""}
                          onChange={(e) => handleInputChange(e.target.value, idx)}
                          className="input input-sm w-20"
                          disabled={
                            item.disabled ||
                            (scannedRackSegments &&
                              scannedRackSegments[0] !== item.Lokasi) ||
                            (scannedRackSegments &&
                              scannedRackSegments[1] !== item.Rak)
                          }
                        />
                        <button
                          className="btn btn-sm btn-primary mt-2 ml-1"
                          onClick={() => handleSaveQty(idx)}
                          disabled={
                            item.disabled ||
                            (scannedRackSegments &&
                              scannedRackSegments[0] !== item.Lokasi)
                          }
                        >
                          Save
                        </button>
                      </td>
                      <td className="border border-gray-300">
                        {(
                          (editQty[idx]
                            ? Number(Math.round(editQty[idx] * 1000) / 1000)
                            : Math.round(((item?.QtySO ?? item?.Qty) || 0) * 1000) / 1000) -
                          Math.round(((item?.qtyWms ?? item?.Qty) || 0) * 1000) / 1000
                        ).toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                className="fixed bottom-0 w-full bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 m-5"
                role="alert"
              >
                <p className="font-bold">Informasi</p>
                <p>Silahkan Scan QR Rak</p>
              </div>
            )}
          </div>
          <div className="flex justify-center m-5">
            {product?.length > 0 && (
              <form action="">
                <button
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-4"
                  type="submit"
                  onClick={(e) => handleSubmit(e)}
                >
                  Submit
                </button>
              </form>
            )}
          </div>
          {openQrRack && (
            <QrScannerRackDummy
              setScannedRack={setScannedRack}
              quickOptions={quickDemoRacksScannerRack3.filter((r) =>
                Object.keys({ "BB2/R1/1/1": true, "BB2/R1/1/2": true, "BB2/R2/1/1": true }).includes(r)
              )}
            />
          )}
        </div>
      </div>
    </>
  );
}
