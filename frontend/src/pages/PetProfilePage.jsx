import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, PawPrint, Calendar, Weight,
  Stethoscope, Syringe, FileText, Edit3, Plus
} from 'lucide-react';
import { api } from '../lib/api';
import MedicalRecordsTab from '../components/MedicalRecordsTab';
import VaccinationTab from '../components/VaccinationTab';
import './PetProfilePage.css';

const TABS = [
  { id: 'overview',    label: 'Overview',         icon: PawPrint },
  { id: 'medical',     label: 'Medical Records',  icon: Stethoscope },
  { id: 'vaccination', label: 'Vaccinations',     icon: Syringe },
];

export default function PetProfilePage() {
  const { petId } = useParams();
  const navigate  = useNavigate();
  const [pet, setPet]       = useState(null);
  const [tab, setTab]       = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await api.get('/pets');
        const found = (res.pets || []).find(p => p.id === petId);
        if (found) setPet(found);
        else navigate('/pets');
      } catch {
        navigate('/pets');
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId, navigate]);

  if (loading) {
    return (
      <div className="pet-profile-loading">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!pet) return null;

  const breedLower = (pet.breed || '').toLowerCase();
  const petEmoji =
    breedLower.includes('cat') || breedLower.includes('persian') || breedLower.includes('siamese') || breedLower.includes('tabby') ? '🐱' :
    breedLower.includes('bird') || breedLower.includes('parrot') || breedLower.includes('canary') ? '🦜' :
    breedLower.includes('rabbit') || breedLower.includes('bunny') ? '🐰' :
    breedLower.includes('fish') || breedLower.includes('goldfish') ? '🐠' :
    breedLower.includes('hamster') || breedLower.includes('guinea') ? '🐹' :
    '🐶';

  return (
    <div className="pet-profile-page">
      {/* ── Back Button ─────────────────────────────── */}
      <button className="pet-profile__back" onClick={() => navigate('/pets')}>
        <ArrowLeft size={18} />
        Back to My Pets
      </button>

      {/* ── Hero Banner ─────────────────────────────── */}
      <div className="pet-profile__hero">
        <div className="pet-profile__hero-bg" />
        <div className="pet-profile__hero-content">
          <div className="pet-profile__avatar">{petEmoji}</div>
          <div className="pet-profile__hero-info">
            <h1 className="pet-profile__name">{pet.name}</h1>
            <span className="pet-profile__breed">{pet.breed}</span>
            <div className="pet-profile__meta">
              <span className="pet-profile__meta-item">
                <Calendar size={14} /> {pet.age} {pet.age === 1 ? 'year' : 'years'} old
              </span>
              <span className="pet-profile__meta-item">
                <Weight size={14} /> {pet.weight} kg
              </span>
              {pet.gender && (
                <span className="pet-profile__meta-item">
                  {pet.gender.toLowerCase() === 'male' ? '♂' : '♀'} {pet.gender}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────── */}
      <div className="pet-profile__tabs">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`pet-profile__tab${tab === t.id ? ' pet-profile__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────── */}
      <div className="pet-profile__content">
        {tab === 'overview' && (
          <div className="pet-profile__overview page-enter">
            <div className="overview-cards">
              <OverviewCard icon={<Calendar size={22} />} label="Age" value={`${pet.age} ${pet.age === 1 ? 'yr' : 'yrs'}`} color="blue" />
              <OverviewCard icon={<Weight size={22} />}   label="Weight" value={`${pet.weight} kg`} color="green" />
              <OverviewCard icon={<PawPrint size={22} />} label="Breed"  value={pet.breed}          color="purple" />
              {pet.species && <OverviewCard icon={<FileText size={22} />} label="Species" value={pet.species} color="orange" />}
            </div>

            <div className="overview-quick-links">
              <h3 className="overview-section-title">Quick Actions</h3>
              <div className="quick-links-grid">
                <button className="quick-link-btn" onClick={() => setTab('medical')}>
                  <div className="quick-link-icon quick-link-icon--teal"><Stethoscope size={24} /></div>
                  <span>View Medical Records</span>
                </button>
                <button className="quick-link-btn" onClick={() => setTab('vaccination')}>
                  <div className="quick-link-icon quick-link-icon--purple"><Syringe size={24} /></div>
                  <span>Vaccination History</span>
                </button>
                <button className="quick-link-btn" onClick={() => setTab('medical')}>
                  <div className="quick-link-icon quick-link-icon--orange"><Plus size={24} /></div>
                  <span>Add Medical Record</span>
                </button>
                <button className="quick-link-btn" onClick={() => navigate('/pets')}>
                  <div className="quick-link-icon quick-link-icon--blue"><Edit3 size={24} /></div>
                  <span>Edit Pet Info</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'medical' && (
          <div className="page-enter">
            <MedicalRecordsTab petId={petId} petName={pet.name} />
          </div>
        )}

        {tab === 'vaccination' && (
          <div className="page-enter">
            <VaccinationTab petId={petId} petName={pet.name} />
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewCard({ icon, label, value, color }) {
  return (
    <div className={`overview-card overview-card--${color}`}>
      <div className="overview-card__icon">{icon}</div>
      <div className="overview-card__info">
        <span className="overview-card__label">{label}</span>
        <span className="overview-card__value">{value}</span>
      </div>
    </div>
  );
}
