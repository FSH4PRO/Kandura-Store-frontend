import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/profile';
import { MapPin, Trash2 } from 'lucide-react';
import Spinner from '../components/Spinner';
import Avatar from '../components/Avatar';
import { useToast } from '../context/useToast';
import { useAuth } from '../context/useAuth';
import { getAddresses, createAddress, deleteAddress, FALLBACK_CITIES } from '../services/addresses';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { setUser } = useAuth();

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState({ city_id: '', street: '', details: '' });
  const [addrSaving, setAddrSaving] = useState(false);

  async function loadAddresses() {
    try {
      const { items } = await getAddresses();
      setAddresses(items);
    } catch (err) {
      toast.error(err.message || 'Could not load addresses.');
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setNameEn(data.name || '');
        setPhone(data.phone || '');
        await loadAddresses();
      } catch (err) {
        toast.error(err.message || 'Could not load your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(
        { nameEn, nameAr, phone, password: password || undefined, password_confirmation: passwordConfirmation || undefined },
        imageFile
      );
      setProfile(updated);
      setUser(updated);
      setPassword('');
      setPasswordConfirmation('');
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  }

  async function saveAddress(e) {
    e.preventDefault();
    setAddrSaving(true);
    try {
      await createAddress({
        city_id: parseInt(addrForm.city_id, 10),
        street: addrForm.street,
        details: addrForm.details || undefined,
      });
      setAddrForm({ city_id: '', street: '', details: '' });
      toast.success('Address added.');
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Could not add address.');
    } finally {
      setAddrSaving(false);
    }
  }

  async function removeAddress(id) {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted.');
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Could not delete address.');
    }
  }

  if (loading) return <Spinner label="Loading profile…" full />;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <p className="eyebrow mb-2">Account</p>
        <h1 className="font-serif text-4xl text-midnight-900">Your profile.</h1>
      </div>

      <form onSubmit={saveProfile} className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar src={preview || profile?.avatar_url} name={profile?.name} size="lg" />
          <label className="btn-outline !py-2 !px-4 text-sm cursor-pointer">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Name (English)</label>
            <input className="field-input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Name (Arabic)</label>
            <input className="field-input" dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="field-label">Phone</label>
          <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">New password (optional)</label>
            <input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} />
          </div>
          <div>
            <label className="field-label">Confirm new password</label>
            <input type="password" className="field-input" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} minLength={8} />
          </div>
        </div>

        <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>

      <div className="card p-6">
        <h2 className="font-serif text-lg text-midnight-900 mb-4 border-b border-midnight-100 pb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold-500" /> Delivery addresses
        </h2>

        <div className="space-y-3 mb-5">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between rounded-xl border border-midnight-100 p-3">
              <div>
                <p className="text-sm text-midnight-900">{a.street}</p>
                <p className="text-xs text-midnight-400 mt-0.5">{a.city?.name}{a.details ? ` · ${a.details}` : ''}</p>
              </div>
              <button onClick={() => removeAddress(a.id)} className="text-midnight-300 hover:text-red-500" aria-label="Delete address">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-sm text-midnight-400">No addresses saved yet.</p>}
        </div>

        <form onSubmit={saveAddress} className="grid sm:grid-cols-2 gap-3">
          <select
            className="field-input"
            value={addrForm.city_id}
            onChange={(e) => setAddrForm((f) => ({ ...f, city_id: e.target.value }))}
            required
          >
            <option value="">— City —</option>
            {FALLBACK_CITIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            className="field-input"
            placeholder="Street"
            value={addrForm.street}
            onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))}
            required
          />
          <input
            className="field-input sm:col-span-2"
            placeholder="Details (building, floor…) — optional"
            value={addrForm.details}
            onChange={(e) => setAddrForm((f) => ({ ...f, details: e.target.value }))}
          />
          <button type="submit" className="btn-outline sm:col-span-2" disabled={addrSaving}>
            {addrSaving ? 'Adding…' : '+ Add address'}
          </button>
        </form>
        <p className="text-[11px] text-midnight-400 mt-3">
          City is matched by a client-side placeholder list (API doc §9/§20 gap #3 — no GET /api/cities endpoint exists yet).
        </p>
      </div>
    </div>
  );
}
