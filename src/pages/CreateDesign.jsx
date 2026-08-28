// src/pages/CreateDesign.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDesign, FALLBACK_SIZES, FALLBACK_OPTIONS } from '../services/designs';
import { Upload, X } from 'lucide-react';
import { useToast } from '../context/useToast';

export default function CreateDesign() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [price, setPrice] = useState('350');
  const [selectedSizes, setSelectedSizes] = useState([2, 3]); // Defaults: S, M
  const [optionValues, setOptionValues] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleSizeToggle = (sizeId) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
    );
  };

  const handleOptionChange = (optId, value) => {
    setOptionValues((prev) => ({ ...prev, [optId]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedSizes.length === 0) {
      setError('Please select at least one size option.');
      return;
    }
    if (imageFiles.length === 0) {
      setError('Please upload at least one image of your design.');
      return;
    }

    setLoading(true);
    try {
      const formattedOptions = Object.entries(optionValues)
        .filter(([, val]) => val.trim() !== '')
        .map(([id, val]) => ({ id: parseInt(id), valueEn: val }));

      await createDesign(
        { nameEn, nameAr, descriptionEn, price: parseFloat(price), sizeIds: selectedSizes, options: formattedOptions },
        imageFiles
      );

      toast.success('Design created.');
      navigate('/designs');
    } catch (err) {
      if (err.type === 'validation') {
        setError(Object.values(err.errors).flat().join(' | '));
      } else {
        setError(err.message || 'Failed to save design. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="eyebrow mb-2">Design studio</p>
        <h1 className="font-serif text-4xl text-midnight-900">Draft a new kandura.</h1>
        <p className="text-midnight-400 mt-2 text-sm max-w-xl">
          Sizes and options below are a client-side catalog — the backend has no size/design-option endpoint yet
          (API doc §11/§20), so confirm real ids with the backend before launch.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-serif text-xl text-midnight-900 border-b border-midnight-100 pb-3">1. Basic information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Design name (English) *</label>
              <input type="text" required placeholder="e.g. Royal Emirati White Kandura" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Design name (Arabic)</label>
              <input type="text" dir="rtl" placeholder="قندورة بيضاء كلاسيكية" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="field-input" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="field-label">Description</label>
              <input type="text" placeholder="Brief details regarding fit, occasion, or lining…" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Price (AED) *</label>
              <input type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="field-input font-semibold" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-serif text-xl text-midnight-900 border-b border-midnight-100 pb-3">2. Sizing options *</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {FALLBACK_SIZES.map((size) => {
              const isSelected = selectedSizes.includes(size.id);
              return (
                <button
                  type="button"
                  key={size.id}
                  onClick={() => handleSizeToggle(size.id)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected ? 'border-gold-400 bg-gold-50 text-gold-700 font-semibold shadow-sm' : 'border-midnight-200 hover:border-midnight-300 text-midnight-500'
                  }`}
                >
                  <span className="text-lg font-bold">{size.code}</span>
                  <span className="text-[11px] text-midnight-400">{size.name.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-serif text-xl text-midnight-900 border-b border-midnight-100 pb-3">3. Garment customizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FALLBACK_OPTIONS.map((option) => (
              <div key={option.id}>
                <label className="field-label">{option.name.en}</label>
                <input
                  type="text"
                  placeholder={`e.g. ${option.type === 'color' ? 'Ivory White' : 'Japanese cotton'}`}
                  value={optionValues[option.id] || ''}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  className="field-input"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-serif text-xl text-midnight-900 border-b border-midnight-100 pb-3">4. Photos *</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-midnight-100 group">
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-midnight-900/70 hover:bg-red-600 text-white p-1 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-midnight-200 hover:border-gold-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-midnight-50/50 hover:bg-gold-50/50">
              <Upload className="w-6 h-6 text-midnight-400 mb-1" />
              <span className="text-xs font-medium text-midnight-600">Upload image</span>
              <span className="text-[10px] text-midnight-400 mt-0.5">JPG, PNG, WEBP (max 5MB)</span>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/designs')} className="btn-outline">Cancel</button>
          <button type="submit" disabled={loading} className="btn-gold">
            {loading ? 'Creating design…' : 'Save & build design'}
          </button>
        </div>
      </form>
    </div>
  );
}
