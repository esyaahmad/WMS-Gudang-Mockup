import { useState } from "react";
import { quickDemoRacks } from "../mocks/scanner2MockApi";

export default function QrScannerRackDummy({ setScannedRack, quickOptions }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const nextValue = (value || "").trim();
    if (!nextValue) return;
    setScannedRack(nextValue);
    setValue("");
  };

  const options = quickOptions ?? quickDemoRacks;

  return (
    <div className="qr-reader border border-slate-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
      <span className="flex justify-center bg-emerald-600 text-white font-semibold mb-3 py-1.5 rounded-lg">
        QR Rak (Dummy)
      </span>
      <div className="flex gap-2 w-full mb-3">
        <input
          className="input-modern"
          placeholder="Contoh: BB2/R1/1/1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button className="btn-modern-primary" onClick={submit}>
          Scan
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((rackCode) => (
          <button
            key={rackCode}
            className="btn-modern-outline py-1 px-2.5 text-xs"
            onClick={() => setScannedRack(rackCode)}
          >
            {rackCode}
          </button>
        ))}
      </div>
    </div>
  );
}
