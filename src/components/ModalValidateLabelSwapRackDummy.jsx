import QrScannerDummy from "./QrScannerDummy";

const ModalValidateLabelSwapRackDummy = ({ isOpen, onClose, setScanned }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="surface-panel p-6 w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="btn-modern-danger mb-3" onClick={onClose}>
          Close
        </button>
        <QrScannerDummy setScanned={setScanned} />
      </div>
    </div>
  );
};

export default ModalValidateLabelSwapRackDummy;
