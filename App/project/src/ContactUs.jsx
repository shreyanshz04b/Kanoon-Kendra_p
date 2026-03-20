import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { getApiBaseUrl } from './api';

export default function ContactUs() {
  const apiUrl = getApiBaseUrl();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setStatusMessage('');

    try {
      const response = await fetch(`${apiUrl}/submit-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit form.');
      }

      setStatus('success');
      setStatusMessage(data.message || 'Message sent successfully.');
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus('error');
      setStatusMessage(error.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F6F7FB] px-6 py-14 md:py-20">
      <div className="max-w-4xl mx-auto">
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contact</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Let’s Talk</h1>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Share your query and our team will respond with the right next step.
          </p>
        </section>

        <section className="mt-10 space-y-4 border-y border-slate-200 py-8">
          <p className="inline-flex items-center gap-2 text-slate-700"><Mail size={16} /> support@lawpal.gov.in</p>
          <p className="inline-flex items-center gap-2 text-slate-700"><Phone size={16} /> 1800-LAW-PAL</p>
          <p className="inline-flex items-center gap-2 text-slate-700"><MapPin size={16} /> VCET, Vasai (W) - 401202, Maharashtra, India</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Send a Message</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              required
              className="w-full h-32 rounded-xl border border-slate-200 px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 disabled:opacity-70"
            >
              <Send size={16} />
              {status === 'loading' ? 'Sending...' : 'Send'}
            </button>
          </form>

          {status === 'success' && <p className="mt-4 text-sm text-emerald-700">{statusMessage}</p>}
          {status === 'error' && <p className="mt-4 text-sm text-red-700">{statusMessage}</p>}
        </section>
      </div>
    </div>
  );
}
