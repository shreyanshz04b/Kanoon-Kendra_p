import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDrop = (e) => {
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
        <p className="text-gray-600 mt-2 font-medium">Drag and drop legal documents to prepare them for analysis workflows.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div
          className={`border-2 border-dashed rounded-3xl p-14 text-center transition-all ${isDragging ? 'border-blue-900 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 bg-gray-50/40'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900 mb-5 border border-blue-100">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{uploadedFile}</h3>
              <p className="mt-2 text-sm font-semibold text-emerald-700 inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} /> File selected
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900 mb-5 border border-blue-100">
                <UploadCloud size={30} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Drop files here</h3>
              <p className="text-gray-600 mt-2">Supports PDF, DOCX, and TXT</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
