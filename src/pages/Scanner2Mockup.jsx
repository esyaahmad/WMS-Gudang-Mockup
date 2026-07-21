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
      <div className="mt-16">
        <div className="mt-8 ">
          <div className="px-5 py-3">
            <div className="flex justify-between mt-2 mb-4">
              <p className="text-2xl font-bold text-gray-800">Pemetaan Bahan</p>
              <button
                className="btn btn-sm text-white bg-teal-400"
                onClick={handleToggleQr}
              >
                {openQr ? "Close" : "Open"} Scan Label
              </button>
            </div>
            {openQr && <QrScannerDummy setScanned={setScanned} />}
          </div>

          {savedMappings.length > 0 && (
            <div className="mx-5 mb-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-bold text-blue-800 mb-2">Pemetaan yang Sudah Disimpan:</p>
                {savedMappings.map((mapping, idx) => (
                  <div key={idx} className="mb-3 pb-3 border-b border-blue-200 last:border-b-0">
                    <p className="font-semibold text-blue-700">
                      Pemetaan {idx + 1} - Rak: {mapping.scannedRack}
                    </p>
                    <div className="ml-4 mt-1">
                      <p className="text-sm text-gray-700">Total Karton: {mapping.products.length}</p>
                      <p className="text-xs text-gray-600">TTBA: {mapping.DNc_TTBANo_Arr.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-5">
            {product.length > 0 && (
              <p className="text-lg font-semibold text-gray-700">
                Total Karton ={" "}
                {product[0].TTBA_VATQTY}
                {" / "}
                {product[0].TTBA_VATQTY}
              </p>
            )}
          </div>

          <div className="max-w-full overflow-x-auto">
            {product.length > 0 ? (
              <table className="table table-xs border m-4">
                <tbody>
                  <tr className="bg-slate-300">
                    <th>No.</th>
                    <th>No. Bets</th>
                    <th>Nama Produk</th>
                    <th>Qty</th>
                    <th>No. Karton</th>
                    <th>ED Product</th>
                    <th>Status</th>
                  </tr>
                  {product.flatMap((item, productIdx) =>
                    Array.from({ length: item.TTBA_VATQTY }, (_, vatIdx) => (
                      <tr key={`${getDncTtba(item)}-${vatIdx + 1}`}>
                        <td className="border border-gray-300">{productIdx + 1}</td>
                        <td className="border border-gray-300">{item?.No_analisa}</td>
                        <td className="border border-gray-300">
                          {item?.item_name} {item?.ttba_itemid}
                        </td>
                        <td className="border border-gray-300">
                          {item?.TTBA_qty_per_Vat} {item?.ttba_itemUnit}
                        </td>
                        <td className="border border-gray-300">
                          {vatIdx + 1} dari {item?.TTBA_VATQTY}
                        </td>
                        <td className="border border-gray-300">{item?.Tgl_daluarsa}</td>
                        <td className="border border-gray-300">
                          {item?.Status === "Release" ? (
                            <span className="font-semibold bg-green-400 p-1 rounded-md">
                              Release
                            </span>
                          ) : item?.Status === "Reject" ? (
                            <span className="font-semibold bg-red-300 p-1 rounded-md">
                              Reject
                            </span>
                          ) : (
                            <span className="font-semibold bg-orange-300 p-1 rounded-md">
                              Karantina
                            </span>
                          )}
                          <button
                            className="btn btn-square btn-xs ml-4 mt-2"
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
                              stroke="red"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div
                className="fixed bottom-0 w-full bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 m-5"
                role="alert"
              >
                <p className="font-bold">Informasi</p>
                <p>Silahkan Scan QR Produk</p>
              </div>
            )}
          </div>

          <div className="flex justify-center m-5">
            {product.length > 0 && (
              <button
                className="btn btn-sm btn-warning"
                onClick={handleToggleQrRack}
              >
                {openQrRack ? "Close" : "Open"} Scan Rak
              </button>
            )}
          </div>
          {openQrRack && <QrScannerRackDummy setScannedRack={setScannedRack} />}

          {scannedRack && rack?.length !== 0 && (
            <>
              <div className="px-5 py-3">
                <table className="table">
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
            </>
          )}

          {scannedRack && rack?.length === 0 && (
            <>
              <div className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md m-5">
                <p className="font-bold">Rak {scannedRack} ({tipeRak}) - Rak Kosong</p>
              </div>
              <div className="m-5">
                <form action="">
                  <div className="flex gap-3">
                    {showAddLocater && (
                      <button
                        className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
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
                      } bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4`}
                      type="submit"
                      onClick={(e) =>
                        savedMappings.length > 0
                          ? handleSubmitMultipleRacks(e)
                          : handleSubmit(e)
                      }
                    >
                      Submit {savedMappings.length > 0 ? `(${savedMappings.length + 1} Locater)` : ""}
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
