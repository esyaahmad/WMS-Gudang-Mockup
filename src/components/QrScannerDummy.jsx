import { useState } from "react";
import { quickDemoLabels } from "../mocks/scanner2MockApi";

export default function QrScannerDummy({ setScanned }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const nextValue = (value || "").trim();
    if (!nextValue) return;
    setScanned(nextValue);
    setValue("");
  };

  return (
    <div className="qr-reader border border-slate-200 rounded p-3 bg-white">
      <span className="flex justify-center bg-yellow-500 text-black font-semibold mb-3 p-1 rounded">
        QR Product (Dummy)
      </span>
      <div className="join w-full mb-2">
        <input
          className="input input-bordered join-item w-full"
          placeholder="Contoh: BB/2026/001#1#1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button className="btn join-item btn-primary" onClick={submit}>
          Scan
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickDemoLabels.map((label) => (
          <button
            key={label}
            className="btn btn-xs"
            onClick={() => setScanned(label)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
