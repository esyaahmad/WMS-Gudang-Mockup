import React, { useState } from "react";
import { mockOpnameList } from "../mocks/scanner2MockApi";

const ModalListOpnameDummy = ({ isOpen, onClose, type, scannedRack }) => {
  if (!isOpen) return null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const filteredData = mockOpnameList.filter((item) => {
    if (scannedRack) return true;
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const totalQtyWMS = filteredData.reduce((sum, item) => sum + (Number(item?.Qty) || 0), 0);
  const totalQtySO = filteredData.reduce((sum, item) => sum + (Number(item?.qty_so) || 0), 0);
  const totalSelisih = totalQtySO - totalQtyWMS;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div
          className="bg-white p-6 rounded-md shadow-lg max-h-[80vh] flex flex-col"
          style={{ width: "90vw" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              List Opname {type} {scannedRack ? `- Rak: ${scannedRack.split("/").slice(1).join(".")}` : ""}
            </h2>
            <button
              className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-600"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto flex-1 mb-4">
            <table className="table table-xs border">
              <thead className="sticky top-0 bg-slate-300">
                <tr>
                  <th className="border">No.</th>
                  <th className="border">DNc No</th>
                  <th className="border">TTBA No</th>
                  <th className="border">Nama Item</th>
                  <th className="border">Vat</th>
                  <th className="border">Qty WMS</th>
                  <th className="border">Qty SO</th>
                  <th className="border">Selisih</th>
                  <th className="border">Tgl Proses</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, idx) => (
                  <tr key={`${item.DNc_No}-${item.ttba_vatno}`}>
                    <td className="border text-center">{indexOfFirstItem + idx + 1}</td>
                    <td className="border">{item.DNc_No}</td>
                    <td className="border">{item.TTBA_No}</td>
                    <td className="border">{item.item_name}</td>
                    <td className="border text-center">{item.ttba_vatno}</td>
                    <td className="border text-center">{Math.round(item.Qty * 1000) / 1000}</td>
                    <td className="border text-center">{Math.round(item.qty_so * 1000) / 1000}</td>
                    <td className="border text-center">
                      {Math.round((item.qty_so - item.Qty) * 1000) / 1000}
                    </td>
                    <td className="border text-xs">
                      {new Date(item.Process_Date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-200 font-bold">
                <tr>
                  <td colSpan="5" className="border text-right p-2">
                    TOTAL:
                  </td>
                  <td className="border text-center">{Math.round(totalQtyWMS * 1000) / 1000}</td>
                  <td className="border text-center">{Math.round(totalQtySO * 1000) / 1000}</td>
                  <td className="border text-center">{Math.round(totalSelisih * 1000) / 1000}</td>
                  <td className="border"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <button
              className="btn btn-sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalListOpnameDummy;
