import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import QrScannerDummy from "../components/QrScannerDummy";
import QrScannerRackDummy from "../components/QrScannerRackDummy";
import NavbarDummy from "../components/NavbarDummy";
import {
  fetchProductMock,
  fetchRackByArrTtbaBulkInsertMock,
  insertBulkProductToRackMock,
} from "../mocks/scanner2MockApi";

function getDncTtba(item) {
  return `${item.TTBA_No}#${item.TTBA_SeqID}#${item.ttba_vatno}`;
}

export default function Scanner2Mockup() {
  const [openQr, setOpenQr] = useState(true);
  const [openQrRack, setOpenQrRack] = useState(false);
  const [scanned, setScanned] = useState(undefined);
  const [scannedRack, setScannedRack] = useState(undefined);

  const [product, setProduct] = useState([]);
  const [rack, setRack] = useState([]);
  const [statusVat, setStatusVat] = useState(undefined);
  const [tipeRak, setTipeRak] = useState(undefined);

  const [newQty, setNewQty] = useState(0);
  const [maxQty, setMaxQty] = useState(0);

  const [savedMappings, setSavedMappings] = useState([]);
  const [showAddLocater, setShowAddLocater] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const arrScanned = scanned?.split("#");
  const ttba = arrScanned?.[0]?.replace(/\//g, "-");
  const seqId = arrScanned?.[1];
  const vat = arrScanned?.[2];

  const DNc_TTBANo_Arr = product.map((item) => getDncTtba(item));
  const arrTipeItem = product.map(
    (item) => `${item?.Item_TypeGroup?.toLowerCase()}`
  );
  console.log("product", product);

  async function fetchProduct() {
    try {
      const data = await fetchProductMock({
        ttba: ttba?.replace(/-/g, "/"),
        seqId,
        vat,
      });

      const alreadyScanned = product.some(
        (item) =>
          item?.TTBA_No === ttba.replace(/-/g, "/") &&
          item?.TTBA_SeqID === +seqId &&
          item?.ttba_vatno === +vat
      );

      const scannedInPreviousMappings = savedMappings.some((mapping) =>
        mapping.products.some(
          (item) =>
            item?.TTBA_No === ttba.replace(/-/g, "/") &&
            item?.TTBA_SeqID === +seqId &&
            item?.ttba_vatno === +vat
        )
      );

      if (alreadyScanned) {
        Swal.fire({
          title: "Bahan sudah diScan!",
          text: "label identitas ini sudah di scan",
          icon: "warning",
        });
      } else if (scannedInPreviousMappings) {
        Swal.fire({
          title: "Bahan sudah diScan sebelumnya!",
          text: "Label identitas ini sudah discan pada pemetaan sebelumnya",
          icon: "warning",
        });
        setScanned(undefined);
      } else {
        setProduct((prevProducts) => [...prevProducts, data.product[0]]);
        setStatusVat(data.statusVatFound);
      }
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.response?.data?.message,
        icon: "error",
      });
      setScanned(undefined);
    }
  }

  async function fetchRack() {
    try {
      const rackAlreadyUsed = savedMappings.some(
        (mapping) => mapping.scannedRack === scannedRack
      );

      if (rackAlreadyUsed) {
        Swal.fire({
          title: "Rak sudah digunakan!",
          text: `Rak ${scannedRack} sudah digunakan pada pemetaan sebelumnya`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        setScannedRack(undefined);
        return;
      }

      const data = await fetchRackByArrTtbaBulkInsertMock({
        scannedRack,
        ttbaScanned: DNc_TTBANo_Arr,
        tipeItemScanned: arrTipeItem,
      });

      if (data?.result?.length > 0) {
        setRack(data?.result);
        Swal.fire({
          title: "Rak tidak kosong",
          text: `Sudah terdapat TTBA bahan ${data?.result[0]?.DNc_TTBANo} pada Gudang BB/BK`,
          icon: "warning",
        });
        setScannedRack(undefined);
      } else {
        setRack(data?.result);
        setTipeRak(data?.tipeRak?.[0]?.tipe_item);
        Swal.fire({
          title: "Rack Kosong",
          icon: "success",
        });
      }
    } catch (error) {
      if (error?.response?.data?.message === "Tipe Rak tidak sama") {
        Swal.fire({
          title: `Tipe Bahan tidak sesuai dengan tipe rak ${tipeRak || "-"}`,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Oops!",
          text: error?.response?.data?.message || "Terjadi kesalahan",
          icon: "error",
        });
      }
      setRack([]);
      setScannedRack(undefined);
    }
  }

  const handleDeleteListProduct = (ttbaNo, seqIdRow, vatNo) => {
    setProduct((prevProducts) =>
      prevProducts.filter(
        (item) =>
          item?.TTBA_No !== ttbaNo ||
          item?.TTBA_SeqID !== seqIdRow ||
          item?.ttba_vatno !== vatNo
      )
    );
  };

  const handleSubmit = (e) => {
    if (rack.length === 0) {
      handleCreate(e);
    } else {
      handleUpdate(e);
    }
  };

  const handleAddLocater = () => {
    if (scannedRack && product.length > 0) {
      const mappingRack = scannedRack;
      const productsWithLocation = product.map((item) => ({
        ...item,
        Lokasi: mappingRack.split("/")[0],
        Rak: mappingRack.split("/")[1],
        Baris: mappingRack.split("/")[2],
        Kolom: mappingRack.split("/")[3],
      }));

      setSavedMappings((prev) => [
        ...prev,
        {
          products: productsWithLocation,
          scannedRack: mappingRack,
          rack,
          DNc_TTBANo_Arr: product.map((item) => getDncTtba(item)),
        },
      ]);

      setProduct([]);
      setScannedRack(undefined);
      setRack([]);
      setScanned(undefined);
      setOpenQr(true);
      setOpenQrRack(false);
      setShowAddLocater(false);
      Swal.fire({
        title: "Pemetaan disimpan",
        text: `Pemetaan untuk ${mappingRack} disimpan. Scan produk baru.`,
        icon: "success",
      });
    }
  };

  const handleSubmitMultipleRacks = async (e) => {
    e.preventDefault();
    try {
      const currentProductsWithLocation = product.map((item) => ({
        ...item,
        Lokasi: scannedRack.split("/")[0],
        Rak: scannedRack.split("/")[1],
        Baris: scannedRack.split("/")[2],
        Kolom: scannedRack.split("/")[3],
      }));

      const allMappings = [
        ...savedMappings,
        {
          products: currentProductsWithLocation,
          scannedRack,
          rack,
          DNc_TTBANo_Arr,
        },
      ];

      const totalVats = allMappings.reduce(
        (acc, mapping) => acc + mapping.DNc_TTBANo_Arr.length,
        0
      );

      // if (product[0].TTBA_VATQTY !== totalVats) {
      //   Swal.fire({
      //     title: "Perhatian!",
      //     text: `Silahkan scan seluruh vat (${totalVats} / ${product[0].TTBA_VATQTY})`,
      //     icon: "warning",
      //     confirmButtonText: "OK",
      //   });
      //   return;
      // }

      for (const mapping of allMappings) {
        await insertBulkProductToRackMock({
          scannedRack: mapping.scannedRack,
          products: mapping.products,
          savedMappings: [],
        });
      }

      const summaryHTML = allMappings
        .map(
          (mapping, idx) => `
            <div style="margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
              <strong>Locater ${idx + 1}:</strong>
              <ul style="list-style-type: disc; padding-left: 20px;">
                ${mapping.DNc_TTBANo_Arr.map((item) => `<li>${item}</li>`).join("")}
              </ul>
              <strong>Rak:</strong> ${mapping.scannedRack}
            </div>
          `
        )
        .join("");

      Swal.fire({
        title: "Berhasil Menambahkan!",
        html: `<div style="font-size: 1.0em; margin-top: 10px;">${summaryHTML}</div>`,
        icon: "success",
      });

      resetAll();
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (rack.length > 0) {
        if (newQty <= 0) {
          throw new Error("Quantity must be greater than 0.");
        }
        if (newQty > maxQty) {
          throw new Error("Quantity exceeds maximum quantity.");
        }

        Swal.fire({
          title: `Success Updated ${newQty} Product to ${scannedRack}`,
          icon: "success",
        });
        resetAll();
      }
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.response?.data?.message || error?.message,
        icon: "error",
      });
      setScannedRack(undefined);
      setRack([]);
      setOpenQrRack(true);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // if (product[0].TTBA_VATQTY !== product.length) {
      //   Swal.fire({
      //     title: "Perhatian!",
      //     text: `Silahkan scan seluruh vat (${product.length} / ${product[0].TTBA_VATQTY})`,
      //     icon: "warning",
      //     confirmButtonText: "OK",
      //   });
      //   return;
      // }

      const productsWithLocation = product.map((item) => ({
        ...item,
        Lokasi: scannedRack.split("/")[0],
        Rak: scannedRack.split("/")[1],
        Baris: scannedRack.split("/")[2],
        Kolom: scannedRack.split("/")[3],
      }));

      await insertBulkProductToRackMock({
        scannedRack,
        products: productsWithLocation,
        savedMappings,
      });

      Swal.fire({
        title: "Berhasil Menambahkan!",
        html: `
          <div style="font-size: 1.1em; margin-top: 10px;">
            <strong>TTBA:</strong>
            <ul style="list-style-type: disc; padding-left: 20px;">
              ${DNc_TTBANo_Arr.map((item) => `<li>${item}</li>`).join("")}
            </ul>
            <strong>Rak:</strong> ${scannedRack}
          </div>
        `,
        icon: "success",
      });
      resetAll();
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
      setScannedRack(undefined);
      setRack([]);
      setOpenQrRack(true);
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
      if (
        product.length > 0 &&
        (product[0].TTBA_No !== ttba.replace(/-/g, "/") ||
          product[0].TTBA_SeqID !== +seqId)
      ) {
        Swal.fire({
          title: "Error!",
          text: "Silahkan scan TTBA yang sama",
          icon: "error",
          confirmButtonText: "OK",
        });
        setScanned(undefined);
        return;
      }
      fetchProduct();
    }
  }, [scanned]);

  useEffect(() => {
    const realQty = Math.ceil(product[0]?.ttba_qty / product[0]?.TTBA_VATQTY);
    setNewQty(realQty || 0);
    setMaxQty(product[0]?.ttba_qty || 0);
  }, [product]);

  useEffect(() => {
    if (scannedRack !== undefined) {
      fetchRack();
      setOpenQrRack(false);
      setShowAddLocater(true);
    }
  }, [scannedRack]);

  const resetAll = () => {
    setProduct([]);
    setScannedRack(undefined);
    setRack([]);
    setScanned(undefined);
    setOpenQr(true);
    setOpenQrRack(false);
    setShowAddLocater(false);
    setSavedMappings([]);
    setStatusVat(undefined);
    setTipeRak(undefined);
    setNewQty(0);
    setMaxQty(0);
  };

  return (
    <>
      <NavbarDummy />
      <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6">
          <div className="surface-card p-5 mb-4">
            <div className="flex justify-between items-center gap-3 mb-4">
              <p className="heading-page">Pemetaan Bahan</p>
              <button
                className="btn-modern-primary"
                onClick={handleToggleQr}
              >
                {openQr ? "Close" : "Open"} Scan Label
              </button>
            </div>
            {openQr && <QrScannerDummy setScanned={setScanned} />}
          </div>

          {savedMappings.length > 0 && (
            <div className="mb-4 surface-card border-l-4 border-l-sky-500 p-4">
              <p className="font-bold text-sky-700 dark:text-sky-400 mb-2">
                Pemetaan yang Sudah Disimpan:
              </p>
              {savedMappings.map((mapping, idx) => (
                <div
                  key={idx}
                  className="mb-3 pb-3 border-b border-sky-100 dark:border-gray-700 last:border-b-0 last:mb-0 last:pb-0"
                >
                  <p className="font-semibold text-sky-700 dark:text-sky-400">
                    Pemetaan {idx + 1} - Rak: {mapping.scannedRack}
                  </p>
                  <div className="ml-4 mt-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Total Karton: {mapping.products.length}
                    </p>
                    <p className="text-xs text-muted">
                      TTBA: {mapping.DNc_TTBANo_Arr.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.length > 0 && (
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Total Karton = {product[0].TTBA_VATQTY} / {product[0].TTBA_VATQTY}
            </p>
          )}

          <div className="max-w-full overflow-x-auto">
            {product.length > 0 ? (
              <div className="surface-card overflow-hidden mb-4">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>No. Bets</th>
                      <th>Nama Produk</th>
                      <th>Qty</th>
                      <th>No. Karton</th>
                      <th>ED Product</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.flatMap((item, productIdx) =>
                      Array.from({ length: item.TTBA_VATQTY }, (_, vatIdx) => (
                        <tr key={`${getDncTtba(item)}-${vatIdx + 1}`}>
                          <td>{productIdx + 1}</td>
                          <td>{item?.No_analisa}</td>
                          <td>
                            {item?.item_name} {item?.ttba_itemid}
                          </td>
                          <td>
                            {item?.TTBA_qty_per_Vat} {item?.ttba_itemUnit}
                          </td>
                          <td>
                            {vatIdx + 1} dari {item?.TTBA_VATQTY}
                          </td>
                          <td>{item?.Tgl_daluarsa}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {item?.Status === "Release" ? (
                                <span className="badge-release">Release</span>
                              ) : item?.Status === "Reject" ? (
                                <span className="badge-reject">Reject</span>
                              ) : (
                                <span className="badge-karantina">
                                  Karantina
                                </span>
                              )}
                              <button
                                type="button"
                                title="Hapus"
                                className="w-7 h-7 flex items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                                onClick={() =>
                                  handleDeleteListProduct(
                                    item?.TTBA_No,
                                    item?.TTBA_SeqID,
                                    vatIdx + 1
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert-info-modern mb-4" role="alert">
                <p className="font-bold">Informasi</p>
                <p>Silahkan Scan QR Produk</p>
              </div>
            )}
          </div>

          <div className="flex justify-center mb-4">
            {product.length > 0 && (
              <button
                className="btn-modern bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md"
                onClick={handleToggleQrRack}
              >
                {openQrRack ? "Close" : "Open"} Scan Rak
              </button>
            )}
          </div>
          {openQrRack && (
            <div className="mb-4">
              <QrScannerRackDummy setScannedRack={setScannedRack} />
            </div>
          )}

          {scannedRack && rack?.length !== 0 && (
            <div className="surface-card overflow-hidden mb-4">
              <table className="table-modern">
                <tbody>
                  <tr>
                    <th>Lokasi</th>
                    <td>{rack[0]?.Lokasi}</td>
                  </tr>
                  <tr>
                    <th>Rak</th>
                    <td>{rack[0]?.Rak}</td>
                  </tr>
                  <tr>
                    <th>Qty</th>
                    <td>{rack[0]?.Qty}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {scannedRack && rack?.length === 0 && (
            <>
              <div className="bg-teal-50 dark:bg-teal-900/30 border-t-4 border-teal-500 rounded-b-lg text-teal-900 dark:text-teal-200 px-4 py-3 shadow-sm mb-4">
                <p className="font-bold">
                  Rak {scannedRack} ({tipeRak}) - Rak Kosong
                </p>
              </div>
              <div className="mb-8">
                <form action="">
                  <div className="flex gap-3">
                    {showAddLocater && (
                      <button
                        className="flex-1 btn-modern bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md py-2.5"
                        type="button"
                        onClick={handleAddLocater}
                        disabled={
                          product.length > 0 &&
                          (product[0].TTBA_VATQTY ===
                            savedMappings.reduce(
                              (acc, mapping) =>
                                acc + mapping.DNc_TTBANo_Arr.length,
                              0
                            ) +
                              product.length ||
                            product[0].TTBA_VATQTY === product.length)
                        }
                      >
                        Tambah Locater
                      </button>
                    )}
                    <button
                      className={`${
                        showAddLocater ? "flex-1" : "w-full"
                      } btn-modern bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md py-2.5`}
                      type="submit"
                      onClick={(e) =>
                        savedMappings.length > 0
                          ? handleSubmitMultipleRacks(e)
                          : handleSubmit(e)
                      }
                    >
                      Submit{" "}
                      {savedMappings.length > 0
                        ? `(${savedMappings.length + 1} Locater)`
                        : ""}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
