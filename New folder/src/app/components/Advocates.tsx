import { Search, MapPin, Star, Phone, MessageSquare, Briefcase, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

const ADVOCATES = [
  {
    id: 1,
    name: "Vikram Sharma",
    specialty: "Corporate Law, M&A",
    location: "Mumbai, Maharashtra",
    experience: "15+ Years",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzczNTk2NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["High Court", "Contract Review", "IP"]
  },
  {
    id: 2,
    name: "Priya Desai",
    specialty: "Family Law, Civil Disputes",
    location: "Delhi, NCR",
    experience: "12 Years",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1735845929510-48e0ecdb53d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBmb3JtYWx8ZW58MXx8fHwxNzczNTk2NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Supreme Court", "Divorce", "Property"]
  },
  {
    id: 3,
    name: "Rohan Patel",
    specialty: "Criminal Defense",
    location: "Ahmedabad, Gujarat",
    experience: "8 Years",
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1706185651641-70fde5591275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwZm9ybWFsfGVufDF8fHx8MTc3MzU5NjYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Bail", "Cyber Crime", "Fraud"]
  }
];

export function Advocates() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Advocate Search</h2>
        <p className="text-gray-500 mt-2 font-medium">Find and connect with verified legal professionals across India.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or keyword..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 text-lg shadow-sm"
            />
          </div>
          <button className="px-8 py-4 bg-blue-900 text-white rounded-2xl font-semibold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 hover:-translate-y-1 whitespace-nowrap">
            Search
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-900 outline-none text-sm font-semibold text-gray-700 bg-white min-w-[160px]">
              <option>Specialty</option>
              <option>Corporate Law</option>
              <option>Family Law</option>
              <option>Criminal Defense</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          
          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-900 outline-none text-sm font-semibold text-gray-700 bg-white min-w-[160px]">
              <option>Location</option>
              <option>Mumbai</option>
              <option>Delhi</option>
              <option>Bangalore</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-blue-900 outline-none text-sm font-semibold text-gray-700 bg-white min-w-[160px]">
              <option>Experience</option>
              <option>5+ Years</option>
              <option>10+ Years</option>
              <option>15+ Years</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {ADVOCATES.map((advocate, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={advocate.id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all hover:border-blue-100 group"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-sm relative">
              <img src={advocate.image} alt={advocate.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    {advocate.name}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] uppercase font-bold tracking-wider border border-amber-100">
                      <Star size={12} className="fill-amber-500" /> {advocate.rating}
                    </span>
                  </h3>
                  
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-700">
                      <Briefcase size={16} className="text-blue-900/60" /> {advocate.specialty}
                    </p>
                    <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <MapPin size={16} className="text-gray-400" /> {advocate.location} • {advocate.experience} Exp.
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {advocate.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 shrink-0">
                  <button className="flex-1 md:flex-none px-6 py-2.5 bg-blue-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all shadow-sm shadow-blue-900/10 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Contact
                  </button>
                  <button className="flex-1 md:flex-none px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Phone size={16} /> Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
