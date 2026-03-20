import { FileSignature, Download, Mail, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import clsx from "clsx";

const TEMPLATES = [
  "Non-Disclosure Agreement (NDA)",
  "Employment Contract",
  "Legal Notice (Defamation)",
  "Lease Agreement (Commercial)",
  "Cease and Desist Letter"
];

export function Drafting() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">AI Drafting</h2>
        <p className="text-gray-500 mt-2 font-medium">Generate legal documents compliant with Indian laws.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Inputs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">Select Template</label>
            <div className="grid gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTemplate(t)}
                  className={clsx(
                    "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all font-medium",
                    selectedTemplate === t
                      ? "border-blue-900 bg-blue-50/50 text-blue-900 shadow-sm ring-1 ring-blue-900/10"
                      : "border-gray-200 hover:border-blue-200 text-gray-700 hover:bg-gray-50/50"
                  )}
                >
                  <FileSignature size={20} className={selectedTemplate === t ? "text-blue-900" : "text-gray-400"} />
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 text-lg">Context & Variables</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Party A (Disclosing Party)</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all font-medium text-gray-900 placeholder-gray-400" placeholder="e.g. TechCorp India Pvt Ltd" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Party B (Receiving Party)</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all font-medium text-gray-900 placeholder-gray-400" placeholder="e.g. Innovate Solutions LLC" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jurisdiction State</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all font-medium text-gray-900 bg-white">
                <option>Maharashtra</option>
                <option>Delhi</option>
                <option>Karnataka</option>
                <option>Tamil Nadu</option>
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-blue-900 text-white rounded-2xl font-semibold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 hover:-translate-y-1 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Drafting...
                </span>
              ) : (
                "Generate Document"
              )}
            </button>
          </div>
        </motion.div>

        {/* Right Column - Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[800px] overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              Live Preview
              {generated && <CheckCircle2 size={16} className="text-emerald-600" />}
            </h3>
            <div className="flex gap-2">
              <button disabled={!generated} className="p-2 text-gray-500 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50">
                <Copy size={18} />
              </button>
              <button disabled={!generated} className="p-2 text-gray-500 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50">
                <Download size={18} />
              </button>
              <button disabled={!generated} className="p-2 text-gray-500 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50">
                <Mail size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto bg-gray-100/50">
            <div className="bg-white shadow-sm border border-gray-200 p-10 min-h-full font-serif text-[15px] leading-relaxed text-gray-800">
              {!generated ? (
                <div className="h-full flex items-center justify-center text-gray-400 font-sans flex-col gap-4">
                  <FileSignature size={48} className="text-gray-300" />
                  <p>Fill out the details and generate your document.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h1 className="text-center font-bold text-xl uppercase mb-8 tracking-wider">Non-Disclosure Agreement</h1>
                  <p>This Non-Disclosure Agreement (the "Agreement") is entered into on this day of ____________, by and between:</p>
                  <p className="font-bold">Party A: TechCorp India Pvt Ltd</p>
                  <p className="font-bold">Party B: Innovate Solutions LLC</p>
                  <p>WHEREAS, the Disclosing Party and the Receiving Party intend to explore a potential business relationship...</p>
                  <h2 className="font-bold mt-6">1. Definition of Confidential Information</h2>
                  <p>For purposes of this Agreement, "Confidential Information" means any data or information that is proprietary to the Disclosing Party and not generally known to the public, whether in tangible or intangible form...</p>
                  <h2 className="font-bold mt-6">2. Governing Law</h2>
                  <p>This Agreement shall be governed by and construed in accordance with the laws of India, specifically subject to the jurisdiction of the courts of Maharashtra.</p>
                  {/* Mock content ends */}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
