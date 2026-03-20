import { Link } from "react-router";
import { Shield, Upload, MessageSquare, FileSignature, Users, CheckCircle2, ArrowRight, Search, FileText } from "lucide-react";
import { motion } from "motion/react";

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]">
              Your AI Legal Advisor <br className="hidden md:block" />
              <span className="text-blue-900 font-extrabold relative inline-block">
                Powered by Indian Law Expertise
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-500/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Advanced Document Analysis, Intelligent Drafting, and Accurate Legal Q&A built specifically for the Indian legal framework.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-900 text-white rounded-2xl font-semibold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                Upload Document & Chat
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-semibold text-lg hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Trust Bar */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">Trusted by legal professionals across India</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {['Secure', 'Accurate', '24/7 Availability', 'Built for Indian Laws'].map((trust) => (
              <div key={trust} className="flex items-center gap-2 text-gray-500 font-medium">
                <CheckCircle2 size={18} className="text-amber-600/80" />
                {trust}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Everything you need to practice efficiently</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">Automate routine tasks and focus on strategic legal work with our comprehensive suite of AI tools.</p>
          </div>

          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 space-y-8"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Upload size={32} className="text-blue-900" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Document Upload & Analysis</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">Securely upload contracts, judgments, and legal notices for instant AI summarization. Extract key clauses and identify potential risks in seconds.</p>
                </div>
                <ul className="space-y-4">
                  {['Support for PDF, DOCX, TXT', 'Instant summaries & key points', 'Risk identification & highlighting'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                      <CheckCircle2 size={20} className="text-amber-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 w-full"
              >
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                   <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4 flex items-center gap-4 relative z-10 hover:-translate-y-1 transition-transform">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">Analyzed</div>
                   </div>
                   <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative z-10 hover:-translate-y-1 transition-transform">
                      <div className="flex gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                        <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
                        <div className="h-3 bg-blue-50 rounded-full w-4/6 border border-blue-100"></div>
                        <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                      </div>
                   </div>
                   <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50 z-0"></div>
                </div>
              </motion.div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 space-y-8"
              >
                
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Chat with Vidhi for Legal Q&A</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">Ask complex legal questions based on Indian jurisprudence and get accurate, cited answers. Vidhi is trained on vast databases of Indian laws and precedents.</p>
                </div>
                
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 w-full"
              >
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                  <div className="space-y-6 relative z-10">
                    <div className="flex gap-4 max-w-[80%] ml-auto hover:-translate-x-1 transition-transform">
                      <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-gray-100 text-sm text-gray-600 font-medium">
                        What are the conditions for a valid contract under the Indian Contract Act?
                      </div>
                    </div>
                    <div className="flex gap-4 max-w-[90%] hover:translate-x-1 transition-transform">
                      <div className="w-8 h-8 rounded-full bg-blue-900 shrink-0 flex items-center justify-center text-white text-xs shadow-sm mt-1">Vidhi</div>
                      <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none border border-blue-100 text-sm text-blue-900 font-medium leading-relaxed shadow-sm">
                        Under Section 10 of the Indian Contract Act, 1872, all agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object.
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-30 z-0"></div>
                </div>
              </motion.div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 space-y-8"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <FileSignature size={32} className="text-blue-900" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Instant Drafting</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">Generate NDAs, contracts, and legal letters customized to Indian laws in seconds. Simply input the variables and let the AI draft perfectly formatted documents.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {['NDA', 'Employment Contract', 'Legal Notice', 'Lease Agreement'].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">{tag}</span>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 w-full"
              >
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative h-72 flex items-center justify-center overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[90%] bg-white shadow-lg shadow-gray-200/50 rounded-lg border border-gray-200 rotate-6 z-0 transition-transform hover:rotate-12 duration-500"></div>
                  <div className="relative z-10 bg-white p-8 rounded-lg shadow-xl shadow-gray-200 border border-gray-200 transform -rotate-3 w-[85%] h-full font-serif flex flex-col transition-transform hover:rotate-0 duration-500">
                    <div className="w-16 h-1 bg-gray-300 mx-auto mb-6"></div>
                    <div className="h-5 w-3/4 bg-gray-200 mx-auto mb-4"></div>
                    <div className="h-3 w-full bg-gray-100 mb-2"></div>
                    <div className="h-3 w-full bg-gray-100 mb-2"></div>
                    <div className="h-3 w-5/6 bg-gray-100 mb-6"></div>
                    <div className="flex justify-between w-full mt-auto pt-4">
                      <div className="w-1/3 h-px bg-gray-300"></div>
                      <div className="w-1/3 h-px bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 space-y-8"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Users size={32} className="text-blue-900" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Advocate Search</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">Find and connect with verified legal professionals across India based on specialty, location, and experience. Build your network or find the perfect counsel.</p>
                </div>
                <div className="relative max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" placeholder="Search by specialty or city..." className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none font-medium pointer-events-none" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex-1 w-full"
              >
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col gap-4 relative overflow-hidden">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative z-10 hover:scale-105 transition-transform origin-left">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      <img src="https://images.unsplash.com/photo-1649433658557-54cf58577c68?w=150" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded"></div>
                    </div>
                    <div className="ml-auto bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      <ArrowRight size={14} className="text-blue-900" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 ml-8 opacity-70 relative z-10 hover:opacity-100 hover:scale-105 transition-all origin-left">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      <img src="https://images.unsplash.com/photo-1735845929510-48e0ecdb53d2?w=150" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-40 z-0"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
