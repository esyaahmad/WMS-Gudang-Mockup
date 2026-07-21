import QrScannerDummy from "./QrScannerDummy";

const ModalValidateLabelSwapRackDummy = ({ isOpen, onClose, setScanned }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <button className="btn btn-sm btn-error mb-3" onClick={onClose}>
          Close
        </button>
        <QrScannerDummy setScanned={setScanned} />
      </div>
    </div>
  );
};

export default ModalValidateLabelSwapRackDummy;
