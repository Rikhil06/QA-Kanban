import { useState } from 'react';
import { X, Globe } from 'lucide-react';

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, url: string) => void;
}

export function CreateSiteModal({ isOpen, onClose, onSubmit }: CreateSiteModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState({ name: '', url: '' });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = { name: '', url: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Site name is required';
      isValid = false;
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
      isValid = false;
    } else {
      // Basic URL validation
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch {
        newErrors.url = 'Please enter a valid URL';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(name, url);
      // Reset form
      setName('');
      setUrl('');
      setErrors({ name: '', url: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setUrl('');
    setErrors({ name: '', url: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#1C1C1C] border border-white/12 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F0F0F] border border-white/8 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
            <h2 className="text-xl">Create new site</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/8 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="site-name" className="block text-sm text-gray-300 mb-2">
              Site name
            </label>
            <input
              id="site-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g., Production Dashboard"
              className={`w-full px-4 py-2.5 bg-[#0F0F0F] border ${
                errors.name ? 'border-red-500/50' : 'border-white/8'
              } rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white/16 transition-colors`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* URL Field */}
          <div>
            <label htmlFor="site-url" className="block text-sm text-gray-300 mb-2">
              URL
            </label>
            <input
              id="site-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors({ ...errors, url: '' });
              }}
              placeholder="e.g., app.example.com"
              className={`w-full px-4 py-2.5 bg-[#0F0F0F] border ${
                errors.url ? 'border-red-500/50' : 'border-white/8'
              } rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white/16 transition-colors`}
            />
            {errors.url && (
              <p className="mt-1.5 text-xs text-red-400">{errors.url}</p>
            )}
            <p className="mt-1.5 text-xs text-gray-500">
              Enter the domain or full URL of your site
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-[#0F0F0F] border border-white/8 rounded-lg hover:border-white/12 transition-colors text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Create site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
