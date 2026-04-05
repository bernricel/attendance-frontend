export default function DepartmentMismatchModal({ isOpen, message, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="department-mismatch-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="department-mismatch-title">Attendance Session Mismatch</h2>
        <p>
          {message ||
            'You are not assigned to this attendance session. Please scan the QR code for your department or contact the attendance administrator.'}
        </p>
        <button type="button" className="primary-btn" onClick={onClose}>
          Okay
        </button>
      </div>
    </div>
  )
}
