import React from 'react';
import { Scale } from 'lucide-react';

const Logo = ({ size = 'medium', variant = 'full' }) => {
  const sizes = {
    small: { icon: 'w-6 h-6', text: 'text-lg', container: 'space-x-2' },
    medium: { icon: 'w-8 h-8', text: 'text-2xl', container: 'space-x-3' },
    large: { icon: 'w-12 h-12', text: 'text-4xl', container: 'space-x-4' }
  };

  const currentSize = sizes[size];

  if (variant === 'icon') {
    return (
      <div className="relative">
        <div className={`p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg`}>
          <Scale className={`${currentSize.icon} text-white`} strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${currentSize.container}`}>
      {/* Icon */}
      <div className={`p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg`}>
        <Scale className={`${currentSize.icon} text-white`} strokeWidth={2.5} />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-sans ${currentSize.text} font-bold tracking-tight`}>
          <span className="bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
            LAW
          </span>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MIND
          </span>
        </div>
        <div className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase -mt-1">
          Legal Intelligence
        </div>
      </div>
    </div>
  );
};

export default Logo;
