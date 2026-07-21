import QrScannerDummy from "../components/QrScannerDummy";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchProductDetailMock,
  fetchCekRackDetailMock,
} from "../mocks/scanner2MockApi";
import NavbarDummy from "../components/NavbarDummy";

export default function ScannerDetailTtbaMockup() {
  const [openQr, setOpenQr] = useState(true);
  const [scanned, setScanned] = useState(undefined);
  const [product, setProduct] = useState([]);
  const [productScanned, setProductScanned] = useState({});
  const [cekRack, setCekRack] = useState([]);
  const [cekGudangKecil, setCekGudangKecil] = useState([]);
  const [cekGudangSampling, setCekGudangSampling] = useState([]);
  const [ketentuan, setKetentuan] = useState("");
  const [ketentuanBB, setKetentuanBB] = useState("");
  const [ketentuanBK, setKetentuanBK] = useState("");

  const arrScanned = scanned?.split("#");
  const ttba = arrScanned?.[0]?.replace(/\//g, "-");
  const seqId = arrScanned?.[1];
  const vat = arrScanned?.[2];

  async function fetchProduct() {
    const loadingToastId = toast.info("Fetching product data...", {
      autoClose: false,
    });
    try {
      const data = await fetchProductDetailMock({ ttba, seqId, vat });
      if (data.length === 0) {
        toast.error("Product Not Found");
        setProduct([]);
      } else {
        setProduct(data);
        toast.success("Product data fetched successfully");
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Oops!",
        text: error?.message || "Error fetching product",
        icon: "error",
      });
      setScanned(undefined);
      setProduct([]);
    } finally {
      toast.dismiss(loadingToastId);
    }
  }

  async function fetchCekRack() {
    try {
      if (product.length === 0) return;
      const data = await fetchCekRackDetailMock({
        noAnalisa: product[0]?.No_analisa,
        ttbaNo: product[0]?.TTBA_No,
        seqId: product[0]?.TTBA_SeqID,
      });
      setCekRack(data?.gudangUtama || []);
      setCekGudangKecil(data?.gudangKecil || []);
      setCekGudangSampling(data?.gudangSampling || []);
    } catch (error) {
      console.log(error);
      setCekRack([]);
      setCekGudangKecil([]);
      setCekGudangSampling([]);
    }
  }

  const fetchProductScanned = async () => {
    try {
      const data = await fetchProductDetailMock({ ttba, seqId, vat });
      if (data.length > 0) {
        const scannedData = data[0];
        setProductScanned({
          No_analisa: scannedData.No_analisa,
          item_name: scannedData.item_name,
          ttba_itemid: scannedData.ttba_itemid,
          ttba_batchno: scannedData.ttba_batchno || "NA",
          prc_name: scannedData.prc_name || "PT Industri ABC",
          po_suppname: scannedData.po_suppname,
          uji_ulang_date: scannedData.uji_ulang_date || "NA",
          best_before: scannedData.best_before || "NA",
          ttba_vatno: scannedData.ttba_vatno,
          TTBA_VATQTY: scannedData.TTBA_VATQTY,
          TTBA_qty_per_Vat: scannedData.TTBA_qty_per_Vat,
          ttba_itemUnit: scannedData.ttba_itemUnit,
          Item_Type: scannedData.Item_TypeGroup === "BB" ? "Terapetik" : "halal",
          Item_TypeGroup: scannedData.Item_TypeGroup,
          Tgl_daluarsa: scannedData.Tgl_daluarsa,
          emp_Name: scannedData.emp_Name || "QA Manager",
          tgl_approve: scannedData.tgl_approve || new Date().toISOString(),
          Status: scannedData.Status,
          Status_2: scannedData.Status_2 || "",
          TTBA_NoAnalisa:
            scannedData.Status === "Karantina"
              ? "DNC-TEST-9999"
              : "",
        });
        setKetentuan(
          scannedData.Status === "Karantina" ? "Perlu Uji Ulang" : ""
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function fetchAllData() {
    try {
      await Promise.all([
        fetchProduct(),
        fetchProductScanned(),
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  const formatTTBA = (ttba) => {
    return ttba?.replace(/-/g, "/");
  };

  const displayValue =
    (ketentuan !== "" && ketentuan !== "0" && ketentuan) ||
    (ketentuanBB !== "" && ketentuanBB !== "0" && ketentuanBB) ||
    (ketentuanBK !== "" && ketentuanBK !== "0" && ketentuanBK);

  function formatDateTimeWithMonthName(dateString) {
    let date = new Date(dateString);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let day = String(date.getUTCDate()).padStart(2, "0");
    let month = monthNames[date.getUTCMonth()];
    let year = date.getUTCFullYear();
    let hours = String(date.getUTCHours()).padStart(2, "0");
    let minutes = String(date.getUTCMinutes()).padStart(2, "0");
    let seconds = String(date.getUTCSeconds()).padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    if (scanned !== undefined) {
      fetchAllData();
      setOpenQr(false);
    }
  }, [scanned]);

  useEffect(() => {
    fetchCekRack();
  }, [product]);

  const ttbaSegment = scanned?.split("#")[0]?.split("/");
  const ttbaLastSegment = ttbaSegment?.[ttbaSegment?.length - 1];

  return (
    <>
      <NavbarDummy />
      <div className="mt-16">
        <div className="px-5 py-3">
          <div className="flex justify-between mt-2 mb-4">
            <p className="text-2xl font-bold text-gray-800">Label Identitas</p>
            <button
              className="btn btn-sm bg-teal-400 text-white"
              onClick={() => setOpenQr(!openQr)}
            >
              {openQr ? "Close" : "Open"} Scan Label
            </button>
          </div>

          {openQr && <QrScannerDummy setScanned={setScanned} />}
        </div>

        <div>
          {product.length > 0 ? (
            <>
              <div className="flex ml-5">
                <p className="font-bold">
                  {(ttbaLastSegment == "LL" &&
                    productScanned?.TTBA_NoAnalisa != "" &&
                    product[0]?.Status == "Karantina") ||
                  product[0]?.Status == ""
                    ? "Sedang diuji Kembali"
                    : null}
                </p>
              </div>
              <div className="flex ml-5">
                <p className="text-l font-bold text-gray-800">No. Bets</p>
                <p className="ml-12">: {productScanned?.No_analisa}</p>
                {productScanned?.Status === "Release" ? (
                  <span className="font-semibold bg-green-200 mx-2 rounded-md px-2">
                    {productScanned?.Status}
                  </span>
                ) : productScanned?.Status === "Reject" ? (
                  <span className="font-semibold bg-red-200 mx-2 rounded-md px-2">
                    {productScanned?.Status}
                  </span>
                ) : productScanned?.Status === "Karantina" ? (
                  <span className="font-semibold bg-orange-200 mx-2 rounded-md px-2">
                    {productScanned?.Status}
                  </span>
                ) : (
                  <span className="font-semibold bg-orange-200 mx-2 rounded-md px-2">
                    Karantina
                  </span>
                )}
                {displayValue ? (
                  <span className="font-bold">{`(${displayValue})`}</span>
                ) : (
                  " "
                )}
                {productScanned?.Status_2 ? (
                  <span className="font-semibold">{`( ${productScanned?.Status_2} )`}</span>
                ) : (
                  " "
                )}
              </div>
              <div className="mx-5">
                <table className="table-fixed">
                  <tbody>
                    <tr className="text-left">
                      <th>Nama Produk</th>
                      <td>
                        :{" "}
                        {`${productScanned?.item_name} (${productScanned?.ttba_itemid})`}
                      </td>
                    </tr>
                    <tr className="text-left">
                      <th className="">NIE</th>
                      <td>: {formatTTBA(ttba)}</td>
                    </tr>
                    <tr className="text-left">
                      {/* <th className="">No. Bets/Lot</th>
                      <td>
                        :{" "}
                        {productScanned?.ttba_batchno === "" ? (
                          <span>NA</span>
                        ) : (
                          <span>{productScanned?.ttba_batchno}</span>
                        )}
                      </td>
                    </tr>
                    <tr className="text-left">
                      <th className="">Pabrik</th>
                      <td>: {productScanned?.prc_name}</td>
                    </tr>
                    <tr className="text-left">
                      <th className="">Pemasok</th>
                      <td>: {productScanned?.po_suppname}</td>
                    </tr>
                    <tr className="text-left">
                      <th className="">Uji Ulang</th>
                      <td>
                        :{" "}
                        {productScanned?.uji_ulang_date === "NA" ? (
                          <span>NA</span>
                        ) : (
                          <span>{productScanned?.uji_ulang_date}</span>
                        )}
                      </td> */}
                    </tr>
                    <tr className="text-left">
                      <th className="">Exp Date</th>
                      <td>
                        :{" "}
                        {productScanned?.best_before === "NA" ? (
                          <span>NA</span>
                        ) : (
                          <span>{productScanned?.best_before}</span>
                        )}
                      </td>
                    </tr>
                    <tr className="text-left">
                      <th>Nomor Karton</th>
                      <td>
                        : {productScanned?.ttba_vatno} dari{" "}
                        {productScanned?.TTBA_VATQTY}
                      </td>
                    </tr>
                    <tr className="text-left">
                      {/* <th>Quantity Karton</th>
                      <td>
                        : {productScanned?.TTBA_qty_per_Vat}{" "}
                        {productScanned?.ttba_itemUnit}
                      </td> */}
                    </tr>
                    <tr className="text-left">
                      <th>Tipe Item</th>
                      <td>
                        : {productScanned?.Item_Type} {"("}
                        {productScanned?.Item_TypeGroup}
                        {")"}
                      </td>
                    </tr>
                    <tr className="text-left ">
                      {/* <th>Tanggal Daluarsa</th>
                      <td>
                        :{" "}
                        {productScanned?.Tgl_daluarsa === "NA" ? (
                          <span>NA</span>
                        ) : (
                          <span>{productScanned?.Tgl_daluarsa}</span>
                        )}
                      </td> */}
                    </tr>
                    <tr className="text-left">
                      <th className="">Approved By</th>
                      <td>
                        :{" "}
                        {!productScanned?.emp_Name ? (
                          <span>NA</span>
                        ) : (
                          <span>
                            {productScanned?.emp_Name} (
                            {formatDateTimeWithMonthName(
                              productScanned?.tgl_approve
                            )}
                            )
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <br />

              <div className="flex-col justify-center">
                <div className="flex ml-6">
                  <p className="text-2xl font-bold text-gray-800">
                    Detail Bahan
                  </p>
                </div>
                <div className="flex justify-center max-w-full overflow-x-auto m-2">
                  <table className="table table-xs border">
                    <tbody>
                      <tr className="bg-slate-200 ">
                        <th>No. Karton</th>
                        <th>Status</th>
                        <th>Qty Karton</th>
                        <th>Lokasi</th>
                        <th>Status Sampling</th>
                      </tr>
                      {product?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-300">
                            {item?.ttba_vatno}
                          </td>
                          <td className="border border-gray-300 p-2">
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
                          </td>
                          <td className="border border-gray-300">
                            {cekGudangSampling?.some(
                              (itemRak) =>
                                itemRak?.Dnc_no === `${item?.No_analisa}` &&
                                itemRak?.Vat_no === `${item?.ttba_vatno}`
                            )
                              ? cekGudangSampling
                                  .filter(
                                    (itemRak) =>
                                      itemRak?.Dnc_no ===
                                        `${item?.No_analisa}` &&
                                      itemRak?.Vat_no === `${item?.ttba_vatno}`
                                  )
                                  .map((itemRak, indexRak) => (
                                    <span key={indexRak}>
                                      {Math.round(itemRak?.Qty * 1000) / 1000}
                                    </span>
                                  ))
                              : cekGudangKecil?.some(
                                  (itemRak) =>
                                    itemRak?.Dnc_no ===
                                      `${item?.No_analisa}` &&
                                    itemRak?.Vat_no === `${item?.ttba_vatno}`
                                )
                              ? cekGudangKecil
                                  .filter(
                                    (itemRak) =>
                                      itemRak?.Dnc_no ===
                                        `${item?.No_analisa}` &&
                                      itemRak?.Vat_no === `${item?.ttba_vatno}`
                                  )
                                  .map((itemRak, indexRak) => (
                                    <span key={indexRak}>
                                      {Math.round(itemRak?.Qty * 1000) / 1000}
                                    </span>
                                  ))
                              : cekRack?.some(
                                  (itemRak) =>
                                    itemRak?.DNc_TTBANo ===
                                    `${item?.TTBA_No}#${item?.TTBA_SeqID}#${item?.ttba_vatno}`
                                )
                              ? cekRack
                                  .filter(
                                    (itemRak) =>
                                      itemRak?.DNc_TTBANo ===
                                      `${item?.TTBA_No}#${item?.TTBA_SeqID}#${item?.ttba_vatno}`
                                  )
                                  .map((itemRak, indexRak) => (
                                    <span key={indexRak}>
                                      {Math.round(itemRak?.Qty * 1000) / 1000}
                                    </span>
                                  ))
                              : "-"}
                          </td>
                          <td className="border border-gray-300">
                            {cekGudangSampling?.some(
                              (itemRak) =>
                                itemRak?.Dnc_no === `${item?.No_analisa}` &&
                                itemRak?.Vat_no === `${item?.ttba_vatno}`
                            )
                              ? "Prep. Sampling"
                              : cekGudangKecil?.some(
                                  (itemRak) =>
                                    itemRak?.Dnc_no ===
                                      `${item?.No_analisa}` &&
                                    itemRak?.Vat_no === `${item?.ttba_vatno}`
                                )
                              ? "Prep. Timbang"
                              : cekRack?.some(
                                  (itemRak) =>
                                    itemRak?.DNc_TTBANo ===
                                    `${item?.TTBA_No}#${item?.TTBA_SeqID}#${item?.ttba_vatno}`
                                )
                              ? cekRack
                                  .filter(
                                    (itemRak) =>
                                      itemRak?.DNc_TTBANo ===
                                      `${item?.TTBA_No}#${item?.TTBA_SeqID}#${item?.ttba_vatno}`
                                  )
                                  .map((itemRak, indexRak) => (
                                    <span key={indexRak}>
                                      {itemRak?.Rak}.{itemRak?.Baris}.
                                      {itemRak?.Kolom}
                                    </span>
                                  ))
                              : "-"}
                          </td>
                          <td className="border border-gray-300">
                            {item?.Status_2 ? item?.Status_2 : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 m-5">
                <p className="font-bold">Informasi</p>
                <p>Silahkan Scan QR Label Bahan</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
