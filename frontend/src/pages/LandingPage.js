import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Building2,
  LineChart,
  Target,
  Users,
  Sparkles,
  ShieldCheck,
  Clock3,
} from 'lucide-react';

const featureCards = [
  {
    icon: Target,
    title: 'Personalized Roadmaps',
    description:
      'Daily, role-focused preparation plans that help students build consistent progress instead of random effort.',
  },
  {
    icon: LineChart,
    title: 'Readiness Intelligence',
    description:
      'Track placement readiness with score trends, weak-skill visibility, and practical guidance to improve outcomes.',
  },
  {
    icon: Building2,
    title: 'Company Opportunity Hub',
    description:
      'Discover open drives, eligibility criteria, deadlines, and role details in one centralized experience.',
  },
  {
    icon: Users,
    title: 'TPO Insights Dashboard',
    description:
      'Support campus placement teams with branch-level insights, gap analytics, and actionable student intelligence.',
  },
];

const stepCards = [
  {
    title: '1. Create Your Profile',
    text: 'Sign up, set your branch and goals, and start with a readiness baseline tailored for your journey.',
  },
  {
    title: '2. Follow Smart Guidance',
    text: 'Use structured preparation roadmaps, assessments, and progress tracking to stay focused every week.',
  },
  {
    title: '3. Convert Preparation to Offers',
    text: 'Apply to matching company opportunities with confidence and measurable interview readiness.',
  },
];

const testimonials = [
  {
    quote:
      'I stopped guessing what to study next. The roadmap gave me structure, and my interview confidence improved within weeks.',
    name: 'Mechanical Student',
    role: 'Final Year, Placeholder Quote',
  },
  {
    quote:
      'The dashboard gave our placement team better visibility into weak-skill clusters, so we could run focused interventions.',
    name: 'TPO Coordinator',
    role: 'Campus Placement Cell, Placeholder Quote',
  },
  {
    quote:
      'Seeing readiness trends and deadlines together made preparation feel practical and achievable, not overwhelming.',
    name: 'Computer Engineering Student',
    role: 'Pre-Placement Phase, Placeholder Quote',
  },
];

const faqItems = [
  {
    question: 'Who is this platform for?',
    answer:
      'The platform is designed for students preparing for placements and TPO teams coordinating campus recruitment outcomes.',
  },
  {
    question: 'What does the readiness score represent?',
    answer:
      'It summarizes preparation strength across key dimensions and helps identify where targeted effort is needed most.',
  },
  {
    question: 'Can students from non-CS branches use this?',
    answer:
      'Yes. The platform supports multi-branch preparation journeys with role-specific roadmaps and opportunity visibility.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Click Get Started, create your account, and begin with your profile and guided preparation roadmap.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 backdrop-blur-md bg-slate-50/85">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>
                PlacementHub
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Career Readiness Platform</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.14),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(15,23,42,0.1),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Built for student placement success
              </span>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-slate-900"
                style={{ fontFamily: 'Outfit' }}
              >
                A smarter pathway from preparation to placement.
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
                PlacementHub helps students and campus placement teams align preparation, readiness intelligence, and
                opportunity discovery in one clear journey.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="mt-14 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur p-5 shadow-sm">
                <p className="text-sm text-slate-500">Roadmap Driven</p>
                <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'Outfit' }}>
                  Structured
                </p>
                <p className="text-sm text-slate-600 mt-1">Daily guidance for focused preparation</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur p-5 shadow-sm">
                <p className="text-sm text-slate-500">Readiness Visibility</p>
                <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'Outfit' }}>
                  Measurable
                </p>
                <p className="text-sm text-slate-600 mt-1">Track progress with practical insights</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur p-5 shadow-sm">
                <p className="text-sm text-slate-500">Opportunity Focused</p>
                <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'Outfit' }}>
                  Outcome-led
                </p>
                <p className="text-sm text-slate-600 mt-1">Align preparation with hiring timelines</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-600 font-semibold">Product Highlights</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>
                Everything needed to prepare with clarity
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Each feature is designed to reduce confusion, improve consistency, and increase placement readiness.
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-5">
              {featureCards.map((feature) => (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold" style={{ fontFamily: 'Outfit' }}>
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-slate-100/70">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-600 font-semibold">How It Works</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>
                A simple three-step journey
              </h2>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {stepCards.map((step) => (
                <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-600 font-semibold">Social Proof</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>
                Early feedback from campus stakeholders
              </h2>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {testimonials.map((item) => (
                <article key={item.quote} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-slate-700 leading-relaxed">“{item.quote}”</p>
                  <p className="mt-5 font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 bg-slate-100/70">
          <div className="max-w-4xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-600 font-semibold">FAQ</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>
                Questions students usually ask first
              </h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>
                    {item.question}
                  </h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Start Today</p>
                  <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>
                    Build placement confidence with a clear path.
                  </h2>
                  <p className="mt-4 text-slate-300">
                    Join students and placement teams using structured preparation and readiness visibility.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>

            <footer className="mt-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white">PlacementHub</p>
                <p className="mt-2">Institutional placement readiness and opportunity intelligence for campuses.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Product</p>
                <ul className="mt-2 space-y-1">
                  <li>Roadmaps</li>
                  <li>Assessments</li>
                  <li>Readiness Tracking</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Audience</p>
                <ul className="mt-2 space-y-1">
                  <li>Students</li>
                  <li>TPO Teams</li>
                  <li>Campus Admins</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Contact</p>
                <ul className="mt-2 space-y-1">
                  <li>hello@placementhub.edu</li>
                  <li>+91 00000 00000</li>
                  <li>Nashik, India</li>
                </ul>
              </div>
            </footer>
          </div>
        </section>
      </main>

      <div className="fixed bottom-5 right-5 hidden sm:flex flex-col gap-2 text-xs text-slate-600">
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Secure student-first workflows
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-sm">
          <Clock3 className="w-4 h-4 text-indigo-600" />
          Fast setup, guided progress
        </div>
      </div>
    </div>
  );
}
