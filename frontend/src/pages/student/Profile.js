import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, GraduationCap, Award, MapPin, Phone, Calendar, Briefcase, BookOpen, Star, Code, Wrench } from 'lucide-react';

// Hardcoded profile for Abhay – Mechanical Engineer, Nashik
const ABHAY_PROFILE = {
  name: "Abhay Patil",
  email: "abhay.patil@sandip.edu.in",
  phone: "+91 98765 43210",
  branch: "Mechanical Engineering",
  college: "Sandip Institute of Engineering & Management, Nashik",
  university: "Savitribai Phule Pune University",
  location: "Nashik, Maharashtra",
  year: "Final Year (2022 – 2026)",
  cgpa: "7.82 / 10",
  dob: "15 March 2004",
  rollNo: "SIEM22ME042",
  headline: "Aspiring Mechanical Engineer | CAD Enthusiast | Manufacturing & Design",
  about:
    "A passionate final-year Mechanical Engineering student with hands-on experience in SolidWorks, AutoCAD, and CATIA. Interested in automotive design, manufacturing processes, and sustainable engineering. Active participant in SAE India events and college robotics club.",
  skills: ["SolidWorks", "AutoCAD", "CATIA V5", "ANSYS", "GD&T", "3D Printing", "CNC Programming", "MATLAB", "MS Excel", "Python Basics"],
  certifications: [
    "NPTEL – Manufacturing Processes (Elite + Silver)",
    "Coursera – Introduction to Mechanical Engineering Design",
    "SAE India – BAJA Student Member",
    "Udemy – SolidWorks Masterclass",
  ],
  projects: [
    { title: "Design & Analysis of Go-Kart Chassis", description: "Led a 6-member team to design, simulate (ANSYS), and fabricate a Go-Kart chassis for inter-college competition. Achieved 22% weight reduction.", tech: "SolidWorks, ANSYS, Mild Steel Fabrication" },
    { title: "Solar-Assisted Water Purifier", description: "Designed a low-cost solar water purification unit for rural Maharashtra as part of Smart India Hackathon. Shortlisted to grand finale.", tech: "AutoCAD, Thermal Analysis, Prototype Testing" },
    { title: "CNC Lathe Automation using Arduino", description: "Implemented semi-automatic CNC lathe control using Arduino and stepper motors. Reduced machining time by 18%.", tech: "Arduino, Stepper Motors, G-Code" },
  ],
  internships: [
    { company: "Mahindra & Mahindra Ltd., Nashik Plant", role: "Engineering Intern – Quality Department", duration: "June 2025 – August 2025", description: "Worked on SPC charts, root-cause analysis, and quality improvement of SUV chassis welding line." },
    { company: "Gabriel India Ltd., Chakan", role: "Summer Trainee – Manufacturing", duration: "May 2024 – June 2024", description: "Studied shock absorber assembly line and suggested lean manufacturing improvements." },
  ],
  achievements: [
    "🏆 1st Place – Model Exhibition, Sandip Foundation Tech Fest 2025",
    "🥈 Runner-up – SAE BAJA Virtual 2024",
    "📜 Published paper on 'Topology Optimization of Brake Pedal' in IJERT",
    "🎖️ College Topper – Machine Design (Sem VI)",
  ],
  hobbies: ["Cricket", "Trekking (Sahyadri)", "CAD Modelling", "Reading – Technical Journals"],
  languages: ["Marathi (Native)", "Hindi (Fluent)", "English (Professional)"],
  readinessScore: 78,
  placementStatus: "Actively Looking",
};

export default function Profile() {
  const { user } = useAuth();
  const p = ABHAY_PROFILE;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto" data-testid="profile-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Profile</h1>
        <p className="text-slate-500 mt-2">Your personal & academic information</p>
      </div>

      {/* ── Hero card ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 pb-6 border-b border-slate-200">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold flex-shrink-0">
            {p.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900" style={{fontFamily: 'Outfit'}}>{p.name}</h2>
            <p className="text-indigo-600 font-medium mt-0.5">{p.headline}</p>
            <p className="text-slate-500 text-sm mt-1">{p.college}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="inline-flex items-center gap-1- text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                <Star className="w-3 h-3 mr-1" /> Readiness: {p.readinessScore}%
              </span>
              <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                {p.placementStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Basic Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8">
          {[
            { icon: Mail, label: "Email", value: p.email },
            { icon: Phone, label: "Phone", value: p.phone },
            { icon: MapPin, label: "Location", value: p.location },
            { icon: GraduationCap, label: "Branch", value: p.branch },
            { icon: BookOpen, label: "University", value: p.university },
            { icon: Calendar, label: "Year", value: p.year },
            { icon: Award, label: "CGPA", value: p.cgpa },
            { icon: User, label: "Roll No.", value: p.rollNo },
            { icon: Calendar, label: "Date of Birth", value: p.dob },
          ].map(({ icon: Icon, label, value }) => (
            <div className="flex items-center gap-3" key={label}>
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── About ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3" style={{fontFamily: 'Outfit'}}>About</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{p.about}</p>
      </div>

      {/* ── Skills ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
          <Code className="w-5 h-5 text-indigo-600" /> Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {p.skills.map((s) => (
            <span key={s} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">{s}</span>
          ))}
        </div>
      </div>

      {/* ── Internships ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
          <Briefcase className="w-5 h-5 text-indigo-600" /> Internships
        </h3>
        <div className="space-y-5">
          {p.internships.map((i, idx) => (
            <div key={idx} className="border-l-2 border-indigo-200 pl-4">
              <h4 className="text-sm font-semibold text-slate-900">{i.company}</h4>
              <p className="text-xs text-indigo-600 font-medium">{i.role} &middot; {i.duration}</p>
              <p className="text-sm text-slate-600 mt-1">{i.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Projects ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
          <Wrench className="w-5 h-5 text-indigo-600" /> Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {p.projects.map((proj, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
              <h4 className="text-sm font-semibold text-slate-900 mb-1">{proj.title}</h4>
              <p className="text-xs text-slate-600 mb-2">{proj.description}</p>
              <p className="text-[10px] uppercase tracking-wider text-indigo-600 font-semibold">{proj.tech}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Certifications ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
          <Award className="w-5 h-5 text-indigo-600" /> Certifications
        </h3>
        <ul className="space-y-2">
          {p.certifications.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-indigo-500 mt-0.5">•</span> {c}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Achievements ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3" style={{fontFamily: 'Outfit'}}>Achievements</h3>
        <ul className="space-y-2">
          {p.achievements.map((a, i) => (
            <li key={i} className="text-sm text-slate-700">{a}</li>
          ))}
        </ul>
      </div>

      {/* ── Languages & Hobbies ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-3" style={{fontFamily: 'Outfit'}}>Languages</h3>
          <div className="flex flex-wrap gap-2">
            {p.languages.map((l) => (
              <span key={l} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{l}</span>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-3" style={{fontFamily: 'Outfit'}}>Hobbies</h3>
          <div className="flex flex-wrap gap-2">
            {p.hobbies.map((h) => (
              <span key={h} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{h}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
