import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationsService } from '../services/donations';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ImageUploader } from '../components/donations/ImageUploader';
import { DonationCategory } from '../types';
import { Utensils, Clock, MapPin, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { INDIAN_STATES, STATE_CITIES_MAP, inferStateFromCity } from '../lib/utils';

export const CreateDonationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const initialCity = user?.city || 'Delhi NCR';
  const initialState = user?.state || inferStateFromCity(initialCity) || 'Delhi';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cooked_meals' as DonationCategory,
    quantity_total: 30,
    quantity_unit: 'portions',
    pickup_deadline: '',
    state: initialState,
    city: initialCity,
    location_label: '',
    pickup_instructions: '',
    ingredients: '',
    allergens: '',
    preparation_time: '',
    prepared_at: '',
    consume_within_hours: 6,
    storage_note: 'Keep insulated in thermal container until pickup',
    dietary_type: 'veg',
    image_url: '',
    cloudinary_public_id: '',
  });

  const categories: Array<{ id: DonationCategory; label: string }> = [
    { id: 'cooked_meals', label: 'Cooked Meals (Rice, Curry, Sabzi)' },
    { id: 'bakery', label: 'Bakery & Bread Loaves' },
    { id: 'produce', label: 'Fresh Fruits & Vegetables' },
    { id: 'packaged', label: 'Packaged Meal Boxes' },
    { id: 'dairy', label: 'Dairy (Milk, Paneer, Curd)' },
    { id: 'other', label: 'Other Wholesome Food' },
  ];

  // Set default deadline to 4 hours from now
  React.useEffect(() => {
    const defaultDeadline = new Date(Date.now() + 4 * 3600000);
    // Format to datetime-local input YYYY-MM-DDTHH:mm
    const tzOffset = defaultDeadline.getTimezoneOffset() * 60000;
    const localISOTime = new Date(defaultDeadline.getTime() - tzOffset).toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, pickup_deadline: localISOTime }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity_total' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleStateChange = (newState: string) => {
    const availableCities = STATE_CITIES_MAP[newState];
    const newCity = availableCities && availableCities.length > 0 ? availableCities[0] : 'Delhi NCR';
    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: newCity,
    }));
  };

  const handleImageUploaded = (imageUrl: string, publicId: string) => {
    setFormData((prev) => ({
      ...prev,
      image_url: imageUrl,
      cloudinary_public_id: publicId,
    }));
  };

  const handleTagSelected = (tag: string) => {
    setFormData((prev) => {
      if (prev.description.includes(tag)) return prev;
      const updated = prev.description ? `${prev.description} | ${tag}` : tag;
      return { ...prev, description: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || (user.role !== 'donor' && user.role !== 'admin')) {
      error('Access restricted: Only food donors and admins can publish surplus batches.');
      return;
    }

    // Client-side validation
    if (!formData.title.trim()) {
      error('Please enter a clear food title.');
      return;
    }
    if (formData.quantity_total <= 0) {
      error('Portions must be greater than zero.');
      return;
    }
    if (!formData.pickup_deadline) {
      error('Please specify a pickup deadline.');
      return;
    }
    if (new Date(formData.pickup_deadline) <= new Date()) {
      error('Pickup deadline must be in the future.');
      return;
    }
    if (!formData.location_label.trim()) {
      error('Please specify the approximate pickup area.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        donor_id: user?.id,
        quantity_available: formData.quantity_total,
        status: 'available',
        pickup_deadline: new Date(formData.pickup_deadline).toISOString(),
        preparation_time: formData.preparation_time
          ? new Date(formData.preparation_time).toISOString()
          : new Date().toISOString(),
      };

      const created = await donationsService.createDonation(payload);
      success('Surplus food donation listed successfully!');
      navigate(`/donations/${created.id}`);
    } catch (err: any) {
      error(err.message || 'Failed to list food donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">List Surplus Food</h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Provide accurate details to help local NGOs and community kitchens rescue your surplus meals safely.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200 shadow-xs space-y-6">
        {/* Cloudinary Image Uploader */}
        <ImageUploader
          onUploadComplete={handleImageUploaded}
          currentImageUrl={formData.image_url}
          onTagSelected={handleTagSelected}
        />

        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-700 mb-1">
              Food Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Fresh Vegetable Pulao with Raita"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Food Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Estimated Quantity & Units <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="5000"
                name="quantity_total"
                value={formData.quantity_total}
                onChange={handleChange}
                className="w-1/2 px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 font-bold focus:border-forest-900 focus:outline-hidden"
                required
              />
              <select
                name="quantity_unit"
                value={formData.quantity_unit}
                onChange={handleChange}
                className="w-1/2 px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
              >
                <option value="portions">portions</option>
                <option value="meal boxes">meal boxes</option>
                <option value="packs">packs</option>
                <option value="kg">kg</option>
                <option value="trays">trays</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-xs">
          <label className="block font-bold text-stone-700 mb-1">
            Description & Packaging <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the food preparation, packaging method (e.g. sealed in thermal containers), and current temperature."
            className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            required
          />
        </div>

        {/* Ingredients & Allergens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Key Ingredients (Optional)</label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              placeholder="e.g. Basmati rice, green peas, carrots, cumin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Allergens Declared</label>
            <input
              type="text"
              name="allergens"
              value={formData.allergens}
              onChange={handleChange}
              placeholder="e.g. Dairy (ghee), Gluten (wheat) or None"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Food Safety & Dietary Classification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-warm-100">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Dietary Type</label>
            <select
              name="dietary_type"
              value={formData.dietary_type}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            >
              <option value="veg">🌱 Vegetarian</option>
              <option value="non-veg">🍗 Non-Vegetarian</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Consume Within (Hours)</label>
            <input
              type="number"
              min={1}
              max={168}
              name="consume_within_hours"
              value={formData.consume_within_hours}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Storage Instruction</label>
            <input
              type="text"
              name="storage_note"
              value={formData.storage_note}
              onChange={handleChange}
              placeholder="e.g. Keep hot in thermal box or refrigerate"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Pickup Logistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-warm-100">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Pickup Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="pickup_deadline"
              value={formData.pickup_deadline}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
              required
            />
            <span className="text-[11px] text-stone-400 mt-0.5 block">After this time, the listing automatically expires.</span>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">State / Territory</label>
            <select
              name="state"
              value={formData.state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden font-medium"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">City / Region</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            >
              {(STATE_CITIES_MAP[formData.state] || ['Delhi NCR']).map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-700 mb-1">
              Approximate Pickup Area (Publicly Visible) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="location_label"
              value={formData.location_label}
              onChange={handleChange}
              placeholder="e.g. DTU Campus, Rohini Sector 17 or Bandra East near BKC"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-700 mb-1">
              Exact Pickup Instructions (Revealed ONLY after confirmed reservation)
            </label>
            <textarea
              name="pickup_instructions"
              rows={2}
              value={formData.pickup_instructions}
              onChange={handleChange}
              placeholder="e.g. Report to Gate 2 security; canteen staff will bring containers down to the vehicle ramp. Phone: 98110-12345."
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 focus:border-forest-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-warm-50 border border-warm-200 flex items-start gap-3 text-xs text-stone-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            By publishing, you confirm that this food was prepared under standard hygiene practices and stored in safe
            containers. SharePlate acts as a logistics bridge and does not certify food safety.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-warm-100 hover:bg-warm-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 shadow-sm transition flex items-center gap-2"
          >
            <Utensils className="w-4 h-4 text-emerald-400" />
            {loading ? 'Publishing Food Listing...' : 'Publish Food Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
