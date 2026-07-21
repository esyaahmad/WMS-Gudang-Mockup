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
    <div className="qr-reader border border-slate-200 rounded p-3 bg-white">
      <span className="flex justify-center bg-green-600 text-black font-semibold mb-3 p-1 rounded">
        QR Rak (Dummy)
      </span>
      <div className="join w-full mb-2">
        <input
          className="input input-bordered join-item w-full"
          placeholder="Contoh: BB2/R1/1/1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button className="btn join-item btn-secondary" onClick={submit}>
          Scan
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((rackCode) => (
          <button
            key={rackCode}
            className="btn btn-xs"
            onClick={() => setScannedRack(rackCode)}
          >
            {rackCode}
          </button>
        ))}
      </div>
    </div>
  );
}
