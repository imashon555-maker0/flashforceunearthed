import {useTranslations} from 'next-intl';
 
export default function Home() {
  const t = useTranslations('HomePage');
 
  return (
    <div>
      <h1 className="text-4xl font-bold text-terracotta mb-4">{t('welcome')}</h1>
      <p className="text-lg">
        {t('description')}
      </p>
    </div>
  );
}