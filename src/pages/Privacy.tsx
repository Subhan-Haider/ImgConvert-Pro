import { Shield } from 'lucide-react';
import { Card } from '../components/Card';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 mb-6">
          <Shield size={32} className="text-primary-500" />
        </div>
        <h1 className="font-display font-bold text-4xl mb-4">Privacy Policy</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Your privacy is our priority. Everything stays on your device.
        </p>
      </div>

      <Card className="prose prose-invert prose-primary max-w-none text-slate-700 dark:text-slate-300">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. 100% Local Processing</h2>
            <p className="leading-relaxed">
              ImgConvert Pro operates entirely within your web browser. When you select, upload, or drop an image into the application, that file is processed locally on your device's hardware. <strong>We do not upload, transmit, or store any of your files on any external servers.</strong> Your files never leave your computer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Data Collection</h2>
            <p className="leading-relaxed">
              We do not track your usage patterns, log the names of the files you convert, or collect personal metadata. Because the application runs completely client-side via JavaScript, there is no database tracking your activity. The only data processed is the image file you provide, which is cleared as soon as you close the browser tab or click "Clear All".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Cookies and Local Storage</h2>
            <p className="leading-relaxed">
              We may use standard Browser Local Storage solely for the purpose of saving your UI preferences (such as Light/Dark mode). This data is stored strictly on your device and is never sent over the internet to us or any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Analytics</h2>
            <p className="leading-relaxed">
              To ensure the app remains functional and to understand basic, anonymous visitor traffic (like the number of unique daily visitors), we may use basic, privacy-respecting analytics tools that do not use cookies or collect PII (Personally Identifiable Information). No image content or usage behavior is monitored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Changes to this Policy</h2>
            <p className="leading-relaxed">
              If we introduce new features (such as optional cloud integration), we will update this Privacy Policy. However, our core commitment to keeping our default image conversion 100% local and private will never change.
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
