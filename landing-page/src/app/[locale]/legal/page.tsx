import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isRtl, type Locale, locales } from "@ormeet/i18n";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.legal" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "landing.legal" });
  const dir = isRtl(locale as Locale) ? "rtl" : "ltr";

  const sections = [
    { key: "terms", title: t("terms.title"), content: t("terms.content") },
    { key: "privacy", title: t("privacy.title"), content: t("privacy.content") },
    { key: "cookies", title: t("cookies.title"), content: t("cookies.content") },
    { key: "refund", title: t("refund.title"), content: t("refund.content") },
  ];

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <header className="w-full border-b border-light-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/svgs/Logo.svg"
              alt="Ormeet"
              width={24}
              height={32}
              className="w-6 h-8"
            />
            <span className="text-xl font-bold text-black">Ormeet</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-8">
          {t("pageTitle")}
        </h1>

        <nav className="flex flex-wrap gap-3 mb-10">
          {sections.map((s) => (
            <a
              key={s.key}
              href={`#${s.key}`}
              className="px-4 py-2 text-sm font-medium rounded-full border border-light-gray text-black hover:border-primary hover:text-primary transition-colors"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.key} id={s.key}>
              <h2 className="text-xl font-bold text-black mb-4">{s.title}</h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {s.content}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
