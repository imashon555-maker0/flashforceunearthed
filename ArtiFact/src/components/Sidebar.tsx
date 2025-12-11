'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = () => {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  // The locale is the first part of the pathname, e.g. /en/...
  const locale = pathname.split('/')[1]; 

  return (
    <div className="flex h-screen w-64 flex-col justify-between bg-sandy-brown text-white">
      <div>
        <div className="p-4 text-2xl font-bold">{t('title')}</div>
        <nav className="mt-10">
          <Link href={`/${locale}/`} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-terracotta">
            {t('home')}
          </Link>
          <Link href={`/${locale}/lessons`} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-terracotta">
            {t('lessons')}
          </Link>
          <Link href={`/${locale}/search`} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-terracotta">
            {t('search')}
          </Link>
        </nav>
      </div>
      <LanguageSwitcher />
    </div>
  );
};

export default Sidebar;
