import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Send, Paperclip, ChevronLeft, ChevronRight, 
  MoreVertical, Download, Briefcase, FileSignature, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import clsx from "clsx";

const MOCK_MESSAGES = [
  { id: 1, text: "Can you analyze this employment contract against Indian Labor Laws?", sender: "user", time: "10:24 AM" },
  { id: 2, text: "I've reviewed the employment contract. Based on the Industrial Disputes Act, 1947 and the newer Labor Codes (specifically Code on Wages), clause 4 regarding overtime compensation is not compliant. It stipulates a flat rate rather than the mandated twice the ordinary rate of wages.", sender: "ai", time: "10:25 AM" },
  { id: 3, text: "Draft an email to the client highlighting this issue.", sender: "user", time: "10:28 AM" },
];

const DOCUMENTS = [
  { id: 1, name: "Employment_Contract_v2.pdf", date: "Today" },
  { id: 2, name: "NDA_TechCorp.docx", date: "Yesterday" },
  { id: 3, name: "Lease_Agreement_Mumbai.pdf", date: "Oct 12" },
];

export function Chat() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), text: input, sender: "user", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I am analyzing your request based on the uploaded document context and relevant Indian legal precedents. Please give me a moment.",
        sender: "ai",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Sidebar for Documents */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-gray-100 bg-gray-50/50 flex flex-col shrink-0 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 tracking-tight text-sm">Context Documents</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <PanelLeftClose size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {DOCUMENTS.map(doc => (
                <div key={doc.id} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-blue-200 transition-colors group">
                  <div className="flex items-start gap-3">
                    <FileText size={16} className="text-blue-900 mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">{doc.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFCFC]">
        {/* Topbar */}
        <div className="h-16 border-b border-gray-100 bg-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-gray-600 mr-2">
                <PanelLeftOpen size={20} />
              </button>
            )}
            <div>
              <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                Employment_Contract_v2.pdf
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 text-[10px] uppercase font-bold tracking-wider border border-blue-100">Active</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 hidden sm:flex">
            <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-1.5 transition-colors">
              <Briefcase size={14} /> Extract Clauses
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 transition-colors">
              <FileSignature size={14} /> Draft Letter
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-1.5 transition-colors">
              <Download size={14} /> PDF
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 ml-2">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={clsx(
                "flex max-w-[85%] mx-auto sm:max-w-[75%]",
                msg.sender === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
              )}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm">
                  <span className="text-white text-[10px] font-bold">AI</span>
                </div>
              )}
              <div
                className={clsx(
                  "p-4 rounded-[20px] text-[15px] leading-relaxed relative shadow-sm",
                  msg.sender === "user"
                    ? "bg-gray-100 text-gray-900 rounded-tr-sm"
                    : "bg-white text-gray-800 border border-blue-100/50 rounded-tl-sm ring-1 ring-black/5"
                )}
              >
                {msg.text}
                <span className={clsx(
                  "absolute -bottom-5 text-[10px] font-medium text-gray-400",
                  msg.sender === "user" ? "right-2" : "left-2"
                )}>
                  {msg.time}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="max-w-4xl mx-auto relative flex items-end bg-[#F9FAFB] border border-gray-200 rounded-3xl shadow-sm focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 transition-all p-2">
            <button className="p-3 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-2xl transition-colors shrink-0">
              <Paperclip size={20} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a legal question or upload a document..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 max-h-32 min-h-[44px] text-[15px] text-gray-900 placeholder-gray-400 outline-none"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-blue-900 text-white rounded-2xl disabled:opacity-50 disabled:bg-gray-300 transition-all hover:bg-blue-800 shrink-0 shadow-sm"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-gray-400 font-medium">
            LegalGPT can make mistakes. Always verify with official Indian legal sources.
          </div>
        </div>
      </div>
    </div>
  );
}
