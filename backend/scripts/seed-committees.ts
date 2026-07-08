/** One-off/idempotent seed for the fixed set of Istiqlal Youth Academy committees. */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMITTEES: Array<{ name: string; nameAr: string }> = [
  { name: 'Personal Development Committee', nameAr: 'لجنة التنمية الذاتية' },
  { name: 'Geopolitical Affairs Committee', nameAr: 'لجنة الشؤون الجيوسياسية' },
  { name: 'Behavioural Science Committee', nameAr: 'لجنة العلوم السلوكية' },
  { name: 'Art and Culture Policy Committee', nameAr: 'لجنة السياسات الثقافية و الإبداعية' },
  { name: 'Environmental Committee', nameAr: 'لجنة البيئة' },
  { name: 'Social Justice and Inclusion Committee', nameAr: 'لجنة العدالة الاجتماعية والادماج' },
  { name: 'Technology and Innovation Committee', nameAr: 'لجنة التكنولوجيا والابتكار' },
  { name: 'Economic Policy Committee', nameAr: 'لجنة السياسة الاقتصادية' },
  { name: 'Public Governance Committee', nameAr: 'لجنة الحكامة' },
  { name: 'Youth Entrepreneurship Committee', nameAr: 'لجنة ريادة الأعمال الشبابية' },
  { name: 'Political Literacy Committee', nameAr: 'لجنة المعرفة السياسية' },
  { name: 'Press Relations Committee', nameAr: 'لجنة العلاقات مع الصحافة' },
  { name: 'International Cooperation Committee', nameAr: 'لجنة التعاون الدولي' },
  { name: 'Logistics Committee', nameAr: 'اللجنة اللوجستية' },
  { name: 'National Partnerships Committee', nameAr: 'لجنة الشراكات الوطنية' },
  { name: 'Sports Policy Committee', nameAr: 'لجنة السياسات الرياضية' },
  { name: 'Political Science Committee', nameAr: 'لجنة العلوم السياسية' },
  { name: 'Youth Mental Health Committee', nameAr: 'لجنة الصحة الشباب النفسية' },
  { name: 'Saharan Affairs Committee', nameAr: 'لجنة الشؤون الصحراوية' },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const committee of COMMITTEES) {
    const existing = await prisma.committee.findFirst({ where: { name: committee.name } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.committee.create({ data: committee });
    created++;
  }

  console.log(`Committees seeded: ${created} created, ${skipped} already existed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
