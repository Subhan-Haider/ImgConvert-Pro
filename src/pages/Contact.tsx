import { Mail } from 'lucide-react';
import { Card } from '../components/Card';

export default function Contact() {
  const emails = [
    'support@subhan.tech',
    'support@lootops.me',
    'support@lootops.website'
  ];

  const socials = [
    {
      name: 'GitHub',
      handle: 'Subhan-Haider',
      url: 'https://github.com/Subhan-Haider',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-slate-800 dark:text-slate-200">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.15-3.8s-1.18-.38-3.9 1.47a13.38 13.38 0 0 0-7 0C6.27 2.22 5.1 2.6 5.1 2.6a5.5 5.5 0 0 0-.15 3.8A5.5 5.5 0 0 0 3.5 10.24c0 5.22 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"/>
          <path d="M8 19c-3 1-4-1-5-1"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      handle: '@subhan_haid',
      url: 'https://instagram.com/subhan_haid',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-pink-600 dark:text-pink-400">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      handle: '@s.subhan.haider',
      url: 'https://tiktok.com/@s.subhan.haider',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-slate-900 dark:text-white">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
          Have a question, feedback, or just want to say hi? We'd love to hear from you. Please reach out via email or social media!
        </p>
      </div>

      <div className="space-y-12">
        {/* Email Section */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white text-center">Email Support</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {emails.map((email, idx) => (
              <Card key={idx} glow className="flex flex-col items-center justify-center p-8 text-center hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/15 flex items-center justify-center mb-5 group-hover:bg-primary-500/25 transition-colors">
                  <Mail className="text-primary-600 dark:text-primary-400" size={26} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Email</h3>
                <a 
                  href={`mailto:${email}`} 
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium break-all text-sm transition-colors"
                >
                  {email}
                </a>
              </Card>
            ))}
          </div>
        </div>

        {/* Social Section */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white text-center">Connect on Socials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {socials.map((social, idx) => (
              <Card key={idx} glow className="flex flex-col items-center justify-center p-8 text-center hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                  {social.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">{social.name}</h3>
                <a 
                  href={social.url} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                >
                  {social.handle}
                </a>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
