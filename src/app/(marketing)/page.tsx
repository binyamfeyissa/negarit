"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/lib/i18n";
import {
  BrainCircuit,
  TrendingUp,
  MessageSquareText,
  FileText,
  Zap,
  Bell,
  ArrowRight,
  Star,
  Building2,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Scale,
  UtensilsCrossed,
  Cpu,
  BarChart3,
} from "lucide-react";

const featureIcons = [BrainCircuit, TrendingUp, MessageSquareText, FileText, Zap, Bell];
const featureColors = [
  "bg-indigo-50 text-indigo-600",
  "bg-violet-50 text-violet-600",
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
];

const categoryIcons = [Cpu, BarChart3, Stethoscope, GraduationCap, Briefcase, Building2, Scale, UtensilsCrossed];
const categoryColors = [
  "from-indigo-500 to-indigo-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-violet-500 to-violet-600",
  "from-sky-500 to-sky-600",
  "from-slate-500 to-slate-600",
  "from-orange-500 to-orange-600",
];

const testimonials = [
  {
    name: "Selam Tadesse",
    role: "Software Engineer · Addis Ababa",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face",
    text: "Negarit matched me with my current job in under a week. The AI recommendations were spot-on and the skill gap analysis told me exactly what I needed to learn.",
  },
  {
    name: "Dawit Bekele",
    role: "Finance Analyst · Dire Dawa",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    text: "I was skeptical at first, but the match score really does work. Every job it recommended was relevant to my background. Found a great position in 10 days.",
  },
  {
    name: "Meron Haile",
    role: "HR Manager · Hawassa",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
    text: "As a recruiter, the quality of applicants through Negarit is exceptional. The AI pre-screening saves us hours of manual work every week.",
  },
];

const heroImage = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=700&fit=crop";
const ctaBgImage = "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1400&h=500&fit=crop";

export default function HomePage() {
  const { tr } = useLocale();

  const featKeys = ["feat1Title", "feat2Title", "feat3Title", "feat4Title", "feat5Title", "feat6Title"] as const;
  const featDescKeys = ["feat1Desc", "feat2Desc", "feat3Desc", "feat4Desc", "feat5Desc", "feat6Desc"] as const;
  const catKeys = ["catTech", "catFinance", "catHealth", "catEducation", "catEngineering", "catMarketing", "catLegal", "catHospitality"] as const;
  const stepKeys = [
    { title: "step1Title" as const, desc: "step1Desc" as const, num: 1 },
    { title: "step2Title" as const, desc: "step2Desc" as const, num: 2 },
    { title: "step3Title" as const, desc: "step3Desc" as const, num: 3 },
  ];

  return (
    <div className="bg-white">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Professional team"
            fill
            className="object-cover opacity-10"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 to-slate-900/70" />
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full opacity-10 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 rounded-full opacity-10 translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-6">
              <BrainCircuit size={14} className="text-indigo-300" />
              <span className="text-xs font-semibold text-indigo-200 tracking-wide">{tr("heroTag")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {tr("heroTitle")}
            </h1>
            <p className="text-lg text-indigo-200/90 mb-10 leading-relaxed max-w-2xl">
              {tr("heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-base shadow-lg shadow-indigo-900/30 transition-all hover:scale-105"
              >
                {tr("heroCta")} <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold text-base hover:bg-white/10 transition-all"
              >
                {tr("heroCtaSecondary")}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {(
                [
                  { val: "2,400+", key: "heroStat1" },
                  { val: "18,000+", key: "heroStat2" },
                  { val: "340+", key: "heroStat3" },
                  { val: "9,200+", key: "heroStat4" },
                ] as const
              ).map(({ val, key }) => (
                <div key={key} className="text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">{val}</p>
                  <p className="text-xs text-indigo-300 mt-1 font-medium">{tr(key)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{tr("featuresTag")}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">{tr("featuresTitle")}</h2>
            <p className="mt-4 text-slate-500 leading-relaxed">{tr("featuresSubtitle")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featKeys.map((key, i) => {
              const Icon = featureIcons[i];
              return (
                <div
                  key={key}
                  className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${featureColors[i]} mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{tr(key)}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{tr(featDescKeys[i])}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{tr("howTag")}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">{tr("howTitle")}</h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 hidden lg:block w-2/3 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-300 to-emerald-200" />

            <div className="grid lg:grid-cols-3 gap-10">
              {stepKeys.map(({ title, desc, num }) => (
                <div key={title} className="relative text-center space-y-5">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 relative z-10">
                    <span className="text-3xl font-extrabold text-white">{num}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{tr(title)}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{tr(desc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{tr("catTag")}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">{tr("catTitle")}</h2>
            <p className="mt-4 text-slate-500">{tr("catSubtitle")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {catKeys.map((key, i) => {
              const Icon = categoryIcons[i];
              return (
                <Link
                  key={key}
                  href="/login"
                  className={`relative overflow-hidden bg-gradient-to-br ${categoryColors[i]} rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-sm group`}
                >
                  <Icon size={28} className="mb-3 opacity-90" />
                  <p className="font-bold text-sm leading-snug">{tr(key)}</p>
                  <ArrowRight size={14} className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/login" className="text-indigo-600 font-semibold text-sm hover:underline">
              {tr("seeAll")}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{tr("testTag")}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">{tr("testTitle")}</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-3xl p-7 border border-slate-100 space-y-5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 py-24">
        <div className="absolute inset-0">
          <Image
            src={ctaBgImage}
            alt=""
            fill
            className="object-cover opacity-10"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-violet-700/90" />
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full opacity-5 -translate-y-1/3 translate-x-1/4" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">{tr("ctaTitle")}</h2>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">{tr("ctaSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base hover:bg-indigo-50 transition-all shadow-xl"
            >
              {tr("ctaBtn")} <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all"
            >
              {tr("ctaBtnEmployer")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
