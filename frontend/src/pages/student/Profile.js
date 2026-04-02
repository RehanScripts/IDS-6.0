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
  const p = {
    ...ABHAY_PROFILE,
    name: user?.name || ABHAY_PROFILE.name,
    email: user?.email || ABHAY_PROFILE.email
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto bg-sky-50 min-h-screen" data-testid="profile-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-blue-950 tracking-tight" style={{fontFamily: 'Outfit'}}>Profile</h1>
        <p className="text-blue-900/70 mt-2">Your personal, academic and placement readiness details</p>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 pb-6 border-b border-blue-100">
          <div className="w-24 h-24 bg-sky-700 rounded-full flex items-center justify-center text-white text-4xl font-semibold flex-shrink-0 shadow-md">
            {p.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-blue-950" style={{fontFamily: 'Outfit'}}>{p.name}</h2>
            <p className="text-sky-700 font-medium mt-0.5">{p.headline}</p>
            <p className="text-blue-900/60 text-sm mt-1">{p.college}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-medium border border-sky-200">
                <Star className="w-3 h-3 mr-1" /> Readiness: {p.readinessScore}%
              </span>
              <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium border border-blue-200">
                {p.placementStatus}
              </span>
            </div>
          </div>
        </div>

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
              <div className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-sky-100">
                <Icon className="w-4 h-4 text-sky-700" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-700/70">{label}</p>
                <p className="text-sm font-medium text-blue-950">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-950 mb-3" style={{fontFamily: 'Outfit'}}>About</h3>
            <p className="text-sm text-blue-900/80 leading-relaxed">{p.about}</p>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-950 mb-3 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
              <Code className="w-5 h-5 text-sky-700" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {p.skills.map((s) => (
                <span key={s} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-100">{s}</span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-950 mb-3" style={{fontFamily: 'Outfit'}}>Languages & Hobbies</h3>
            <p className="text-xs uppercase tracking-[0.14em] text-blue-700/70 font-semibold mb-2">Languages</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {p.languages.map((l) => (
                <span key={l} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800">{l}</span>
              ))}
            </div>
            <p className="text-xs uppercase tracking-[0.14em] text-blue-700/70 font-semibold mb-2">Hobbies</p>
            <div className="flex flex-wrap gap-2">
              {p.hobbies.map((h) => (
                <span key={h} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800">{h}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-950 mb-4 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
              <Briefcase className="w-5 h-5 text-sky-700" /> Internships
            </h3>
            <div className="space-y-5">
              {p.internships.map((i, idx) => (
                <div key={idx} className="border-l-2 border-sky-200 pl-4">
                  <h4 className="text-sm font-semibold text-blue-950">{i.company}</h4>
                  <p className="text-xs text-sky-700 font-medium">{i.role} &middot; {i.duration}</p>
                  <p className="text-sm text-blue-900/80 mt-1">{i.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-950 mb-4 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
              <Wrench className="w-5 h-5 text-sky-700" /> Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.projects.map((proj, idx) => (
                <div key={idx} className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-all">
                  <h4 className="text-sm font-semibold text-blue-950 mb-1">{proj.title}</h4>
                  <p className="text-xs text-blue-900/80 mb-2">{proj.description}</p>
                  <p className="text-[10px] uppercase tracking-wider text-sky-700 font-semibold">{proj.tech}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-950 mb-3 flex items-center gap-2" style={{fontFamily: 'Outfit'}}>
                <Award className="w-5 h-5 text-sky-700" /> Certifications
              </h3>
              <ul className="space-y-2">
                {p.certifications.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-900/80">
                    <span className="text-sky-600 mt-0.5">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-950 mb-3" style={{fontFamily: 'Outfit'}}>Achievements</h3>
              <ul className="space-y-2">
                {p.achievements.map((a, i) => (
                  <li key={i} className="text-sm text-blue-900/80">{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
