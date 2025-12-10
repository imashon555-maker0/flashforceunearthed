'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    // The pathname without the locale prefix
    const newPath = pathname.startsWith(`/${locale}`) ? pathname.substring(locale.length + 1) : pathname;
    router.replace(`/${nextLocale}${newPath}`);
  };

  return (
    <div className="p-4">
      <select
        value={locale}
        onChange={handleChange}
        className="w-full rounded border border-gray-300 bg-white p-2 text-gray-800"
      >
        <option value="en">English</option>
        <option value="kk">Қазақша</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
}
