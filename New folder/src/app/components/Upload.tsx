import { UploadCloud, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Document</h2>
        <p className="text-gray-500 mt-2 font-medium">Securely upload your legal documents for AI analysis.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm"
      >
        <div 
          className={`border-3 border-dashed rounded-[32px] p-16 text-center transition-all ${
            isDragging ? "border-blue-900 bg-blue-50/50" : "border-gray-200 hover:border-blue-300 bg-gray-50/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-900 mb-6 border border-blue-100 shadow-sm">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{uploadedFile}</h3>
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle2 size={16} /> Ready for analysis
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-900 mb-6 border border-blue-100 shadow-sm transition-transform hover:scale-110 cursor-pointer">
                <UploadCloud size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Drag and drop your document here</h3>
              <p className="text-gray-500 mb-8 font-medium">or click to browse from your computer</p>
              
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 tracking-wider uppercase">PDF</span>
                <span className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 tracking-wider uppercase">DOCX</span>
                <span className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 tracking-wider uppercase">TXT</span>
              </div>
            </div>
          )}
        </div>

        {uploadedFile && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-col items-center"
          >
            <button className="px-10 py-4 bg-blue-900 text-white rounded-2xl font-semibold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 hover:-translate-y-1 w-full sm:w-auto">
              Analyze with AI
            </button>
            <div className="mt-6 flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 text-amber-800 text-sm max-w-xl">
              <ShieldAlert size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <p className="font-medium leading-relaxed">Your documents are encrypted end-to-end and stored securely. They are never used to train public AI models. Compliant with Indian Information Technology Act, 2000.</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
