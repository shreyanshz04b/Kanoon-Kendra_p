import React from 'react';
import { motion } from 'motion/react';
import { Scale, Brain, Globe2, Sparkles, Layers3, Clock3 } from 'lucide-react';

const pillars = [
  {
    title: 'Legal Clarity',
    description: 'Break down legal complexity into readable, practical guidance that supports better decisions.',
    icon: Scale,
  },
  {
    title: 'Intelligent Assistance',
    description: 'Blend retrieval, drafting support, and conversational context into one connected workflow.',
    icon: Brain,
  },
  {
    title: 'Inclusive Reach',
    description: 'Design for real-world access, multilingual realities, and broad usability across legal contexts.',
    icon: Globe2,
  },
];

const values = [
  { title: 'Precision First', icon: Layers3, text: 'Every feature is designed for consistency, structure, and legal utility.' },
  { title: 'Always Evolving', icon: Sparkles, text: 'We continuously refine workflows based on legal usage patterns and feedback.' },
  { title: 'Built for Real Time', icon: Clock3, text: 'From research to drafting, the platform is optimized for practical day-to-day speed.' },
];

export default function AboutUs() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F6F7FB] px-6 py-14 md:py-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">About LexCounsel</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">A Legal Workspace, Reimagined</h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            LexCounsel brings legal consultation, document intelligence, and drafting support into one coherent interface. The goal is simple: make legal work more focused, more readable, and more efficient.
          </p>
        </section>

        <section className="border-y border-slate-200 divide-y divide-slate-200">
          {pillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="py-8"
            >
              <div className="inline-flex items-center gap-2 text-slate-900 font-semibold">
                <pillar.icon size={18} /> {pillar.title}
              </div>
              <p className="mt-3 text-slate-600 leading-relaxed">{pillar.description}</p>
            </motion.article>
          ))}
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How We Build</h2>
          <ul className="mt-6 space-y-4">
            {values.map((item) => (
              <li key={item.title}>
                <p className="inline-flex items-center gap-2 text-slate-800 font-semibold">
                  <item.icon size={16} />
                  {item.title}
                </p>
                <p className="mt-2 text-slate-600 leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
