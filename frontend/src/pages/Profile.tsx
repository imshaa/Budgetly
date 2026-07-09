import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, User, Mail, Phone, Calendar, DollarSign,
  CheckCircle2, MapPin, Users, Home, Loader2, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { useCurrency, currencies } from '../contexts/CurrencyContext';
import { profileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const COUNTRIES = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

export function Profile() {
  const navigate = useNavigate();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { refreshProfile } = useAuth();

  // Form state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  // Load existing profile on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('user_email') || '';
    setEmail(storedEmail);

    profileAPI.getProfile()
      .then(data => {
        if (data && !data.error) {
          setIsExistingProfile(true);
          setUsername(data.username || '');
          setPhone(data.phone_number || '');
          setDob(data.date_of_birth || '');
          setCountry(data.country || '');
          setGender(data.gender || '');
          setAddress(data.address || '');
          if (data.profile_image_url) setImagePreview(data.profile_image_url);
          const savedCurrency = currencies.find(c => c.code === data.currency);
          if (savedCurrency) setSelectedCurrency(savedCurrency);
        }
      })
      .catch(() => {/* no profile yet, that's fine */})
      .finally(() => setFetchLoading(false));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('phone_number', phone);
      formData.append('date_of_birth', dob);
      formData.append('country', country);
      formData.append('gender', gender);
      formData.append('address', address);
      formData.append('currency', selectedCurrency.code);
      if (imageFile) formData.append('profile_image', imageFile);

      const data = isExistingProfile
        ? await profileAPI.updateProfile(formData)
        : await profileAPI.createProfile(formData);

      if (data.error) {
        // Handle serializer validation errors (object) or plain strings
        if (typeof data.error === 'object') {
          const firstKey = Object.keys(data.error)[0];
          setError(`${firstKey}: ${data.error[firstKey]}`);
        } else {
          setError(data.error);
        }
        return;
      }

      await refreshProfile();
      navigate('/onboarding');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors duration-200 backdrop-blur-sm"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-semibold text-gray-900 mb-2">
            {isExistingProfile ? 'Update your profile' : 'Complete your profile'}
          </h1>
          <p className="text-gray-500">
            Tell us a bit about yourself to personalize your experience.
          </p>
        </div>

        <div className="card p-8">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 mb-6">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile image */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative group cursor-pointer">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center ${!imagePreview && 'border-dashed border-gray-300'}`}>
                  {imagePreview
                    ? <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                    : <User size={40} className="text-gray-400" />}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <p className="text-sm text-gray-500 mt-3 font-medium">Upload photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Alex Morgan" className="input-field pl-11" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" className="input-field pl-11 text-gray-500 bg-gray-100" value={email} readOnly />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" placeholder="+92 (000) 000-0000" className="input-field pl-11" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="date" className="input-field pl-11" value={dob} onChange={e => setDob(e.target.value)} required />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Country</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select className="input-field pl-11 appearance-none bg-white" value={country} onChange={e => setCountry(e.target.value)} required>
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Gender</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <div className="pl-11 flex gap-6 pt-2">
                  {[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value={opt.value} checked={gender === opt.value} onChange={e => setGender(e.target.value)} className="w-4 h-4 text-accent border-gray-300 focus:ring-accent" />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Residential Address</label>
              <div className="relative">
                <Home className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea placeholder="Enter your full residential address" rows={3} className="input-field pl-11 resize-none" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Primary Currency</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="input-field pl-11 appearance-none bg-white"
                  value={selectedCurrency.code}
                  onChange={e => {
                    const currency = currencies.find(c => c.code === e.target.value);
                    if (currency) setSelectedCurrency(currency);
                  }}
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>{currency.code} - {currency.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={loading} className="btn-primary w-full group">
                {loading
                  ? <Loader2 size={20} className="mr-2 animate-spin" />
                  : <CheckCircle2 size={20} className="mr-2" />}
                {isExistingProfile ? 'Update Profile' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


