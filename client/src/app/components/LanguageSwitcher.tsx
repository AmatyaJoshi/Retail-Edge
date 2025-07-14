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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[40px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 hover:dark:bg-gray-700"
          aria-label="Select language"
        >
          <span className="text-sm font-semibold uppercase tracking-wide">{current?.code ?? '??'}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="w-48 max-h-48 overflow-y-auto custom-scrollbar">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                locale === lang.code 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-medium ${locale === lang.code ? 'text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'}`}>
                  {lang.code.toUpperCase()}
                </span>
                <span className={`text-xs ${locale === lang.code ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {lang.label}
                </span>
              </div>
              {locale === lang.code && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher; 