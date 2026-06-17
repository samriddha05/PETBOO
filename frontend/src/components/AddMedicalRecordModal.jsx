import { useState, useEffect } from 'react';
import { X, Calendar, User, Building2, ClipboardList, Pill, FileText, Syringe, AlertCircle } from 'lucide-react';
import './AddMedicalRecordModal.css';

const EMPTY_FORM = {
  visitDate: '',
  doctorName: '',
  clinicName: '',
  symptoms: '',
  diagnosis: '',
  prescriptionNotes: '',
  medicines: '',
  additionalNotes: '',
  nextVisitDate: '',
};

const FIELD_CONFIG = [
  { key: 'visitDate',         label: 'Visit Date *',           type: 'date',     icon: Calendar,      col: 'half', required: true },
  { key: 'nextVisitDate',     label: 'Next Visit Date',        type: 'date',     icon: Calendar,      col: 'half' },
  { key: 'doctorName',        label: 'Doctor / Veterinarian',  type: 'text',     icon: User,          col: 'half', placeholder: 'Dr. Smith' },
  { key: 'clinicName',        label: 'Clinic / Hospital',      type: 'text',     icon: Building2,     col: 'half', placeholder: 'PetCare Clinic' },
  { key: 'symptoms',          label: 'Problem / Symptoms',     type: 'textarea', icon: AlertCircle,   col: 'full', placeholder: 'Describe the symptoms…', rows: 2 },
  { key: 'diagnosis',         label: 'Diagnosis',              type: 'textarea', icon: Syringe,       col: 'full', placeholder: "Vet's diagnosis...",        rows: 2 },
  { key: 'prescriptionNotes', label: 'Prescription Notes',     type: 'textarea', icon: FileText,      col: 'full', placeholder: 'Notes on prescription…', rows: 2 },
  { key: 'medicines',         label: 'Medicines',              type: 'textarea', icon: Pill,          col: 'full', placeholder: 'List medicines & dosage…', rows: 2 },
  { key: 'additionalNotes',   label: 'Additional Notes',       type: 'textarea', icon: ClipboardList, col: 'full', placeholder: 'Any additional info…',   rows: 2 },
];

export default function AddMedicalRecordModal({ open, onClose, onSave, initial }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        visitDate:         initial.visitDate?.slice(0, 10) || '',
        doctorName:        initial.doctorName || '',
        clinicName:        initial.clinicName || '',
        symptoms:          initial.symptoms || '',
        diagnosis:         initial.diagnosis || '',
        prescriptionNotes: initial.prescriptionNotes || '',
        medicines:         initial.medicines || '',
        additionalNotes:   initial.additionalNotes || '',
        nextVisitDate:     initial.nextVisitDate?.slice(0, 10) || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [initial, open]);

  if (!open) return null;

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.visitDate) { setError('Visit date is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="med-modal-overlay" onClick={onClose}>
      <div className="med-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="med-modal__header">
          <div className="med-modal__header-icon">🏥</div>
          <div>
            <h2 className="med-modal__title">{initial ? 'Edit Medical Record' : 'Add Medical Record'}</h2>
            <p className="med-modal__subtitle">Fill in the visit details below</p>
          </div>
          <button className="med-modal__close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Form */}
        <form className="med-modal__form" onSubmit={handleSubmit}>
          <div className="med-form-grid">
            {FIELD_CONFIG.map(({ key, label, type, icon: Icon, col, placeholder, rows, required }) => (
              <div key={key} className={`med-form-group med-form-group--${col}`}>
                <label className="med-form-label">
                  <Icon size={13} />
                  {label}
                </label>
                {type === 'textarea' ? (
                  <textarea
                    className="med-form-input med-form-textarea"
                    placeholder={placeholder}
                    rows={rows}
                    value={form[key]}
                    onChange={set(key)}
                  />
                ) : (
                  <input
                    type={type}
                    className="med-form-input"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                    required={required}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="med-form-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="med-modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : (initial ? 'Save Changes' : 'Add Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
