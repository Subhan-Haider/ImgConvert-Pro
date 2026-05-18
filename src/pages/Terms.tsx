import { FileText } from 'lucide-react';
import { Card } from '../components/Card';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 mb-6">
          <FileText size={32} className="text-primary-500" />
        </div>
        <h1 className="font-display font-bold text-4xl mb-4">Terms & Conditions</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Please read these terms carefully before using our service.
        </p>
      </div>

      <Card className="prose prose-invert prose-primary max-w-none text-slate-700 dark:text-slate-300">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using ImgConvert Pro, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Description of Service</h2>
            <p className="leading-relaxed">
              ImgConvert Pro provides a browser-based suite of image processing tools, allowing you to convert formats, compress, resize, and apply basic filters to images. The entire service runs locally via JavaScript and WASM on your device. We do not provide long-term hosting or storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Usage Restrictions</h2>
            <p className="leading-relaxed">
              While you are free to use this tool for both personal and commercial purposes (i.e., converting images for your business), you may not:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Reverse engineer, decompile, or copy the proprietary UI components of this website.</li>
                <li>Attempt to use the site to distribute malware or harmful files (though our client-side nature makes this practically impossible).</li>
                <li>Sell or redistribute access to this application without explicit permission.</li>
              </ul>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Disclaimer of Warranties</h2>
            <p className="leading-relaxed">
              The application is provided "as is". While we strive for perfection, we make no warranties, expressed or implied, that the service will be entirely error-free. We are not responsible for any loss of data, corrupted images, or system crashes that may occur as a result of using this browser-based tool. Always keep backups of your original images.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Intellectual Property</h2>
            <p className="leading-relaxed">
              You retain all rights to the images you convert using this tool. We claim no ownership over the content you process. The design, code, and branding of ImgConvert Pro itself are protected by copyright.
            </p>
          </section>

          <div className="pt-6 border-t border-black/5 dark:border-white/10 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </Card>
    </div>
  );
}
