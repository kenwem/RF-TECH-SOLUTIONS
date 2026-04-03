import { useState, useEffect } from 'react';

export function Logo({ className = '', light = false }: { className?: string, light?: boolean }) {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('rftech_general_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.logoUrl) {
        setLogoUrl(parsed.logoUrl);
      }
    }
  }, []);

  if (logoUrl) {
    return <img src={logoUrl} alt="RF Tech Solutions Logo" className={`h-12 object-contain ${className}`} />;
  }

  const textColor = light ? 'text-white' : 'text-[#003366]';
  const bgColor = light ? 'bg-white' : 'bg-[#003366]';
  
  return (
    <div className={`flex items-center font-sans ${className} ${textColor}`}>
      <div className="text-[3.5em] font-black leading-none tracking-tighter mr-3">
        RF
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-[2em] font-bold leading-none tracking-tight">
          TECH
        </div>
        <div className="text-[0.85em] font-bold leading-none tracking-widest mt-1">
          SOLUTIONS
        </div>
        <div className="flex items-center mt-1 w-full">
          <div className={`h-[3px] flex-grow ${bgColor}`}></div>
          <div className={`h-[4px] w-[4px] ml-1 ${bgColor}`}></div>
          <div className={`h-[4px] w-[4px] ml-1 ${bgColor}`}></div>
        </div>
      </div>
    </div>
  );
}
