import { useState, useEffect, useCallback } from 'react';
import { Plus, Syringe, Edit3, Trash2, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import './VaccinationTab.css';

const EMPTY_VAX = {
  vaccineName: '', vaccinationDate: '', nextDueDate: '',
  doctorName: '', clinicName: '', batchNumber: '', notes: '',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function vaccinationStatus(nextDue) {
  if (!nextDue) return 'completed';
  const now = new Date();
  const due = new Date(nextDue);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 30) return 'due-soon';
  return 'upcoming';
}

const STATUS_CONFIG = {
  completed: { label: 'Completed',  icon: CheckCircle,    color: 'green'  },
  upcoming:  { label: 'Upcoming',   icon: Clock,          color: 'blue'   },
  'due-soon':{ label: 'Due Soon',   icon: AlertTriangle,  color: 'orange' },
  overdue:   { label: 'Overdue',    icon: AlertTriangle,  color: 'red'    },
};

function VaxModal({ open, onClose, onSave, initial }) {
  const [form, setForm]     = useState(EMPTY_VAX);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        vaccineName:      initial.vaccineName || '',
        vaccinationDate:  initial.vaccinationDate?.slice(0, 10) || '',
        nextDueDate:      initial.nextDueDate?.slice(0, 10) || '',
        doctorName:       initial.doctorName || '',
        clinicName:       initial.clinicName || '',
        batchNumber:      initial.batchNumber || '',
        notes:            initial.notes || '',
      });
    } else {
      setForm(EMPTY_VAX);
    }
    setError('');
  }, [initial, open]);

  if (!open) return null;

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vaccineName || !form.vaccinationDate) {
      setError('Vaccine name and date are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Failed to save vaccination.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vax-modal-overlay" onClick={onClose}>
      <div className="vax-modal" onClick={e => e.stopPropagation()}>
        <div className="vax-modal__header">
          <div className="vax-modal__icon">💉</div>
          <div>
            <h2 className="vax-modal__title">{initial ? 'Edit Vaccination' : 'Add Vaccination'}</h2>
            <p className="vax-modal__subtitle">Track your pet's vaccine history</p>
          </div>
          <button className="vax-modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="vax-modal__form" onSubmit={handleSubmit}>
          <div className="vax-form-grid">
            <div className="vax-form-group vax-form-group--full">
              <label>Vaccine Name *</label>
              <input className="med-form-input" placeholder="e.g. Rabies, DHPP, Bordetella" value={form.vaccineName} onChange={set('vaccineName')} required />
            </div>
            <div className="vax-form-group">
              <label>Vaccination Date *</label>
              <input type="date" className="med-form-input" value={form.vaccinationDate} onChange={set('vaccinationDate')} required />
            </div>
            <div className="vax-form-group">
              <label>Next Due Date</label>
              <input type="date" className="med-form-input" value={form.nextDueDate} onChange={set('nextDueDate')} />
            </div>
            <div className="vax-form-group">
              <label>Doctor / Vet</label>
              <input className="med-form-input" placeholder="Dr. Smith" value={form.doctorName} onChange={set('doctorName')} />
            </div>
            <div className="vax-form-group">
              <label>Clinic / Hospital</label>
              <input className="med-form-input" placeholder="PetCare Clinic" value={form.clinicName} onChange={set('clinicName')} />
            </div>
            <div className="vax-form-group vax-form-group--full">
              <label>Batch / Lot Number</label>
              <input className="med-form-input" placeholder="Optional batch number" value={form.batchNumber} onChange={set('batchNumber')} />
            </div>
            <div className="vax-form-group vax-form-group--full">
              <label>Notes</label>
              <textarea className="med-form-input med-form-textarea" placeholder="Any additional notes…" rows={2} value={form.notes} onChange={set('notes')} />
            </div>
          </div>

          {error && <div className="med-form-error"><AlertTriangle size={14} /> {error}</div>}

          <div className="vax-modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : (initial ? 'Save Changes' : 'Add Vaccine')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VaccinationTab({ petId, petName }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deleteId, setDeleteId]         = useState(null);

  const fetchVaccinations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pets/${petId}/medical/vaccinations/list`);
      setVaccinations(res.vaccinations || []);
    } catch (err) {
      console.error('Failed to fetch vaccinations:', err);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => { fetchVaccinations(); }, [fetchVaccinations]);

  const handleSave = async (formData) => {
    if (editing) {
      await api.put(`/pets/${petId}/medical/vaccinations/${editing.id}`, formData);
    } else {
      await api.post(`/pets/${petId}/medical/vaccinations`, formData);
    }
    setModalOpen(false);
    setEditing(null);
    fetchVaccinations();
  };

  const handleDelete = async (id) => {
    await api.delete(`/pets/${petId}/medical/vaccinations/${id}`);
    setDeleteId(null);
    fetchVaccinations();
  };

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (v) => { setEditing(v); setModalOpen(true); };

  const overdue  = vaccinations.filter(v => vaccinationStatus(v.nextDueDate) === 'overdue');
  const dueSoon  = vaccinations.filter(v => vaccinationStatus(v.nextDueDate) === 'due-soon');
  const upcoming = vaccinations.filter(v => vaccinationStatus(v.nextDueDate) === 'upcoming');
  const completed = vaccinations.filter(v => vaccinationStatus(v.nextDueDate) === 'completed');

  return (
    <div className="vax-tab">
      {/* Header */}
      <div className="vax-tab__header">
        <div>
          <h2 className="vax-tab__title">Vaccination Tracker</h2>
          <p className="vax-tab__subtitle">{petName}'s immunization history</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Vaccine
        </button>
      </div>

      {/* Status Summary */}
      {vaccinations.length > 0 && (
        <div className="vax-summary">
          <div className="vax-summary-card vax-summary-card--green">
            <CheckCircle size={20} />
            <div><span>{completed.length}</span><small>Completed</small></div>
          </div>
          <div className="vax-summary-card vax-summary-card--blue">
            <Clock size={20} />
            <div><span>{upcoming.length}</span><small>Upcoming</small></div>
          </div>
          <div className="vax-summary-card vax-summary-card--orange">
            <AlertTriangle size={20} />
            <div><span>{dueSoon.length}</span><small>Due Soon</small></div>
          </div>
          <div className="vax-summary-card vax-summary-card--red">
            <AlertTriangle size={20} />
            <div><span>{overdue.length}</span><small>Overdue</small></div>
          </div>
        </div>
      )}

      {/* Vaccine List */}
      {loading ? (
        <div className="vax-tab__loading">
          {[1,2,3].map(i => <div key={i} className="record-skeleton" />)}
        </div>
      ) : vaccinations.length === 0 ? (
        <div className="vax-tab__empty">
          <div className="vax-tab__empty-icon">💉</div>
          <h3>No vaccinations recorded</h3>
          <p>Start tracking {petName}'s vaccines to stay on top of their health.</p>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add First Vaccine
          </button>
        </div>
      ) : (
        <div className="vax-list">
          {vaccinations.map(vax => {
            const status = vaccinationStatus(vax.nextDueDate);
            const cfg    = STATUS_CONFIG[status];
            const Icon   = cfg.icon;
            return (
              <div key={vax.id} className={`vax-card vax-card--${cfg.color}`}>
                <div className="vax-card__left">
                  <div className={`vax-card__icon vax-card__icon--${cfg.color}`}>
                    <Syringe size={20} />
                  </div>
                </div>
                <div className="vax-card__body">
                  <div className="vax-card__top">
                    <h4 className="vax-card__name">{vax.vaccineName}</h4>
                    <span className={`vax-status-badge vax-status-badge--${cfg.color}`}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                  </div>
                  <div className="vax-card__dates">
                    <span className="vax-date-item">
                      <Calendar size={12} />
                      Given: {formatDate(vax.vaccinationDate)}
                    </span>
                    {vax.nextDueDate && (
                      <span className="vax-date-item">
                        <Calendar size={12} />
                        Due: {formatDate(vax.nextDueDate)}
                      </span>
                    )}
                  </div>
                  {(vax.doctorName || vax.clinicName) && (
                    <div className="vax-card__meta">
                      {vax.doctorName && <span>{vax.doctorName}</span>}
                      {vax.doctorName && vax.clinicName && <span>·</span>}
                      {vax.clinicName && <span>{vax.clinicName}</span>}
                    </div>
                  )}
                  {vax.notes && <p className="vax-card__notes">{vax.notes}</p>}
                </div>
                <div className="vax-card__actions">
                  <button className="record-action-btn" onClick={() => openEdit(vax)} title="Edit"><Edit3 size={14} /></button>
                  <button className="record-action-btn record-action-btn--danger" onClick={() => setDeleteId(vax.id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <VaxModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />

      {deleteId && (
        <div className="medical-delete-overlay" onClick={() => setDeleteId(null)}>
          <div className="medical-delete-dialog" onClick={e => e.stopPropagation()}>
            <div className="medical-delete-dialog__icon">💉</div>
            <h3>Delete Vaccination?</h3>
            <p>This vaccination record will be permanently removed.</p>
            <div className="medical-delete-dialog__actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
