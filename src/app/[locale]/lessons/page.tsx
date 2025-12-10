import lessonsData from '@/data/lessons.json';
import { useTranslations } from 'next-intl';

export default function LessonsPage() {
  const t = useTranslations('LessonsPage');
  const tData = useTranslations('LessonsData');
  const { units } = lessonsData;

  return (
    <div>
      <h1 className="text-4xl font-bold text-terracotta mb-8">{t('title')}</h1>
      <div className="space-y-8">
        {units.map((unit, unitIndex) => (
          <div key={unitIndex}>
            <h2 className="text-2xl font-bold text-sandy-brown mb-4">{tData(unit.title as any)}</h2>
            <div className="flex space-x-4">
              {unit.lessons.map((lesson) => (
                <div key={lesson.id} className="w-32 h-32 bg-turquoise rounded-full flex items-center justify-center text-center p-2 cursor-pointer hover:bg-gold transition-colors">
                  <span className="text-white font-bold">{tData(lesson.title as any)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
