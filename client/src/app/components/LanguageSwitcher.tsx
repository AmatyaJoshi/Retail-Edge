"use client";
import React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇮🇳' },
  { code: 'or', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'sa', label: 'संस्कृतम्', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0];

  const handleSelect = (code: string) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = code;
    const newPath = segments.join('/');
    router.replace(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-w-[48px]"
          aria-label="Select language"
        >
          <span className="text-base font-bold uppercase">{current?.code ?? '??'}</span>
          <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
          {LANGUAGES.map(lang => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
            >
              <span className={`mr-2 text-base font-bold uppercase ${locale === lang.code ? 'text-blue-700' : ''}`}>{lang.code}</span>
              <span className={locale === lang.code ? 'text-blue-700 font-semibold' : ''}>{lang.label}</span>
              {locale === lang.code && <span className="ml-2 text-xs text-blue-500">(Selected)</span>}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher; 