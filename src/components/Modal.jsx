import "../styles/modal.css";

export default function Modal({ title, children, onClose, size = "" }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ message, confirmLabel = "Xoá", onConfirm, onCancel }) {
  return (
    <Modal title="Xác nhận" onClose={onCancel} size="modal-sm">
      <p className="confirm-body" dangerouslySetInnerHTML={{ __html: message }} />
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Huỷ</button>
        <button className="btn btn-danger-solid" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}