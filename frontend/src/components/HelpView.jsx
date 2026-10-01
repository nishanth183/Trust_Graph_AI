import React, { useState } from 'react';
import { 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  ShieldCheck, 
  Send, 
  Search, 
  Lightbulb,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export default function HelpView({ onStartCheck }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const steps = [
    {
      number: 1,
      title: "Send it",
      desc: "Upload or paste the message, screenshot, or PDF notice you received.",
      color: "var(--color-primary)"
    },
    {
      number: 2,
      title: "We check it",
      desc: "We examine the available official Gazette records and recruitment rules.",
      color: "var(--color-primary)"
    },
    {
      number: 3,
      title: "Understand it",
      desc: "We explain what we found in plain English, with a Trust Score and next steps.",
      color: "var(--color-success)"
    }
  ];

  const faqs = [
    {
      question: "What should I upload?",
      answer: "You can upload any WhatsApp or SMS message you received, a screenshot of a job posting on social media, a PDF notice claiming to be an appointment letter or exam circular, or the URL of a recruitment website. We automatically extract and verify names, contact numbers, websites, and application instructions."
    },
    {
      question: "Can I check a WhatsApp message?",
      answer: "Yes! Simply copy the entire text of the message from WhatsApp and paste it into the 'Message' box. You don't need to format or clean up the text. Our system analyzes the language, claimed department, contact numbers, and payment requests automatically."
    },
    {
      question: "What does the Trust Score mean?",
      answer: "The Trust Score is rated from 0 to 100 based on rigorous evidence verification:\n\n• 80 to 100 (Verified / Matches): The circular matches official government Gazette publications, verified domains (.gov.in / .nic.in), and standard treasury payment gateways.\n• 50 to 79 (Needs Caution): Some details do not match standard procedures (e.g. third-party forms or unverified helpline numbers).\n• 0 to 49 (High Risk / Scam): Strong warning signs detected, such as personal UPI IDs (@okaxis, @paytm), unofficial domains (.xyz, .online), or direct appointment guarantees without exams."
    },
    {
      question: "What should I do if a message is suspicious?",
      answer: "1. NEVER send money, registration fees, or security deposits to personal UPI addresses or unverified QR codes.\n2. Do NOT send your personal identity documents (Aadhaar, PAN card, marksheets) to private WhatsApp numbers.\n3. Verify the notification directly on the official central or state government portal ending in .gov.in or .nic.in.\n4. Call National Cyber Crime Helpline 1930 immediately or file a complaint at cybercrime.gov.in."
    },
    {
      question: "Is TrustGraph AI free to use?",
      answer: "Yes. TrustGraph AI is built as a public-interest civic safety platform to protect job seekers, students, and citizens across India from predatory employment scams and fraudulent recruitment letters."
    },
    {
      question: "How do I report fraud to Indian Authorities?",
      answer: "If you have already transferred money or received a counterfeit appointment letter:\n• Dial 1930 (National Cyber Crime Reporting Portal helpline, toll-free 24/7).\n• Lodge an online FIR at cybercrime.gov.in within the 'Golden Hour' to enable police to freeze suspicious bank accounts."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* Top Banner (Matching Screen 9 "Need help? Not sure what to do?") */}
      <div className="tg-card" style={{
        padding: '40px 36px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'center',
        background: 'var(--bg-card)'
      }}>
        
        {/* Left Side: 3 Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Need help?<br />
              <span style={{ color: 'var(--color-primary)' }}>Not sure what to do?</span>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Checking a government job notification takes less than 30 seconds.
            </p>
          </div>

          {/* Stepper items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps.map((st) => (
              <div key={st.number} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: st.number === 3 ? 'var(--color-success)' : 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {st.number}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {st.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {st.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '8px' }}>
            <button
              onClick={onStartCheck}
              className="tg-btn-primary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              <span>Start a Check</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Side: Visual Citizen Assurance Card */}
        <div style={{
          backgroundColor: 'var(--bg-card-subtle)',
          borderRadius: '20px',
          padding: '32px 24px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px'
        }}>
          
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={36} />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Citizen Protection First
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '320px', lineHeight: 1.5 }}>
              Thousands of students and job applicants are targeted daily with fake appointment letters. We help you verify the truth before you pay or share private papers.
            </p>
          </div>

          {/* Quick Helpline Box */}
          <div style={{
            width: '100%',
            padding: '14px 18px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PhoneCall size={18} color="var(--color-primary)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  National Cyber Helpline
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Toll-free 24x7 Assistance
                </div>
              </div>
            </div>
            <a
              href="tel:1930"
              className="tg-pill tg-pill-verified"
              style={{ textDecoration: 'none', fontWeight: 800, fontSize: '13px' }}
            >
              Call 1930
            </a>
          </div>

        </div>

      </div>

      {/* Common Questions / FAQ Accordions (Matching Screen 9 Right Column) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Common Questions
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Everything you need to know about checking recruitment notifications.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="tg-card"
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderColor: isOpen ? 'var(--color-primary)' : 'var(--border-card)'
                }}
                onClick={() => toggleFaq(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {faq.question}
                  </span>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isOpen && (
                  <div style={{
                    marginTop: '14px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Cyber Crime Portal Guidance */}
      <div style={{
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: 'var(--color-caution-bg)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <AlertTriangle size={24} color="#D97706" />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Suspect a counterfeit government notification?
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              File an official incident report on the National Cyber Crime Reporting Portal.
            </div>
          </div>
        </div>

        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noreferrer"
          className="tg-btn-primary"
          style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px' }}
        >
          <span>Visit cybercrime.gov.in</span>
          <ExternalLink size={14} />
        </a>
      </div>

    </div>
  );
}
