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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="surface-panel p-6 max-h-[80vh] flex flex-col"
        style={{ width: "90vw" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 gap-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            List Opname {type} {scannedRack ? `- Rak: ${scannedRack.split("/").slice(1).join(".")}` : ""}
          </h2>
          <button className="btn-modern-danger" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="overflow-y-auto flex-1 mb-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <table className="table-modern">
            <thead className="sticky top-0 z-10">
              <tr>
                <th>No.</th>
                <th>No. Bets</th>
                <th>NIE</th>
                <th>Nama Produk</th>
                <th>Karton</th>
                <th>Qty System</th>
                <th>Qty SO</th>
                <th>Selisih</th>
                <th>Tgl Proses</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, idx) => (
                <tr key={`${item.DNc_No}-${item.ttba_vatno}`}>
                  <td className="text-center">{indexOfFirstItem + idx + 1}</td>
                  <td>{item.DNc_No}</td>
                  <td>{item.TTBA_No}</td>
                  <td>{item.item_name}</td>
                  <td className="text-center">{item.ttba_vatno}</td>
                  <td className="text-center">{Math.round(item.Qty * 1000) / 1000}</td>
                  <td className="text-center">{Math.round(item.qty_so * 1000) / 1000}</td>
                  <td className="text-center">
                    {Math.round((item.qty_so - item.Qty) * 1000) / 1000}
                  </td>
                  <td className="text-xs">
                    {new Date(item.Process_Date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 dark:bg-gray-700/70 font-bold text-gray-700 dark:text-gray-200">
              <tr>
                <td colSpan="5" className="text-right p-2 border-t border-gray-100 dark:border-gray-700">
                  TOTAL:
                </td>
                <td className="text-center border-t border-gray-100 dark:border-gray-700">
                  {Math.round(totalQtyWMS * 1000) / 1000}
                </td>
                <td className="text-center border-t border-gray-100 dark:border-gray-700">
                  {Math.round(totalQtySO * 1000) / 1000}
                </td>
                <td className="text-center border-t border-gray-100 dark:border-gray-700">
                  {Math.round(totalSelisih * 1000) / 1000}
                </td>
                <td className="border-t border-gray-100 dark:border-gray-700"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-between items-center">
          <button
            className="btn-modern-outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn-modern-outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalListOpnameDummy;
