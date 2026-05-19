import { useState } from 'react';
import { 
  ArrowLeft, Clock, Share2, BookOpen, Heart, Calendar, 
  ChevronRight, ShieldCheck
} from 'lucide-react';
import { Card } from '../components/Card';

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  summary: string;
  coverImage: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'local-first-pdf',
    title: 'The Ultimate Guide to Local-First PDF Editing: Privacy in the Browser',
    category: 'Privacy',
    date: 'May 18, 2026',
    readTime: '5 min read',
    author: 'Subhan Haider',
    authorRole: 'Founder & Lead Architect',
    summary: 'Discover how browser-based sandbox environments process, annotate, and compile sensitive PDF documents without ever uploading them to external cloud servers.',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    content: [
      'In today’s digital workspace, Document Security is no longer optional—it is a critical requirement. When you upload a private PDF containing financial logs, client identities, or medical charts to a standard online converter, your file is sent to an external, third-party server. From there, it is processed in the cloud, cached on physical disks, and exposed to security risks.',
      'ImgConvert Pro solves this by introducing a Local-First Sandbox model. Instead of transferring bytes over standard network protocols to foreign microservices, all computation takes place on your own computer’s processing cores.',
      'How does this work? The magic is made possible by browser-native WebAssembly (WASM) and HTML5 Canvas engines. When you load a PDF in ImgConvert Pro, the document’s binary structures are loaded directly into temporary volatile RAM memory inside a secure sandboxed tab.',
      'All annotation drawing strokes, page splits, grayscale pixel conversions, and watermark renders are calculated in real time using local hardware. Because your files never traverse the web or touch a cloud disk, there is absolutely zero attack surface. If you unplug your network cable, the application continues to run flawlessly. Upon closing the tab, your data completely vanishes from your device RAM.',
      'This paradigm shift guarantees compliance with global strict data privacy regulations, including GDPR, HIPAA, and ISO 27001, making browser-native sandboxing the undisputed future of personal and corporate document management.'
    ]
  },
  {
    id: 'webp-vs-avif',
    title: 'Optimizing Web Performance: A Deep-Dive into WebP vs AVIF Formats',
    category: 'Performance',
    date: 'May 15, 2026',
    readTime: '8 min read',
    author: 'Alex Thorne',
    authorRole: 'Senior Media Engineer',
    summary: 'Compare quality retention, alpha channels transparency, and visual artifacts between standard PNG/JPEG and next-gen compression formats.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    content: [
      'Visual performance is the single most critical factor in retaining online audience attention. Heavy images (megabytes of JPEGs and PNGs) slow page load speeds, raise bandwidth costs, and lower SEO rankings. Enter next-generation encoders: WebP and AVIF.',
      'WebP was developed to deliver superior lossless and lossy compression compared to JPEGs and PNGs. It retains full support for transparent alpha channels and yields files that are 26% to 34% smaller than PNG counterparts at identical quality ratios.',
      'AVIF takes image compression a giant leap forward. Built upon the open-source AV1 video codec standard, AVIF achieves up to 50% size reductions compared to JPEGs and up to 30% compared to WebP. It supports high-dynamic-range (HDR) colors and reduces color bleeding artifacts at ultra-low bitrates.',
      'When converting your assets, we recommend using AVIF for standard photographic displays where raw size optimization is paramount. WebP remains the ideal choices for graphic layouts that combine transparency channels with high-contrast sharp text, maintaining crisp vector outlines.',
      'With ImgConvert Pro, you can batch-convert hundreds of media items to next-gen formats in seconds. By setting precise quality sliders, padding, and resizing presets, you get perfectly optimized web-ready results instantly.'
    ]
  },
  {
    id: 'offline-ocr-tesseract',
    title: 'Unlocking Scanned Text Offline with WebAssembly OCR Technology',
    category: 'WASM',
    date: 'May 10, 2026',
    readTime: '6 min read',
    author: 'Elena Rostova',
    authorRole: 'Core Systems Developer',
    summary: 'Explore how running Tesseract OCR engines directly inside local browser processes extracts editable text from raw mobile camera captures securely.',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    content: [
      'Physical paper scans and mobile screenshots are static graphics—they cannot be searched, copied, or indexed. Traditionally, turning scanned documents into editable digital text required heavy desktop tools or expensive, server-side Cloud APIs.',
      'ImgConvert Pro introduces fully offline Optical Character Recognition (OCR) powered by a browser-virtualized Tesseract engine. Rather than queueing files to remote servers, we run WebAssembly builds of the OCR pipeline locally.',
      'When you submit a scanned PDF or photograph, our system spawns dedicated browser Web Workers. These background workers load compiled C++ OCR libraries directly. The engine parses the rasterized pixels, deskews tilted text angles, filters contrast layers, and performs neural character classification.',
      'Because Tesseract languages dictionary models (such as English, Spanish, French, and German) are cached securely inside the browser storage index, text extraction executes in milliseconds without sending any data packets across the internet.',
      'The parsed characters are returned as clean text layouts that can be instantly copied to your clipboard or export as .txt manuscripts. It is fast, robust, fully private, and operates 100% offline.'
    ]
  }
];

export default function Blog() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const selectedArticle = ARTICLES.find(a => a.id === selectedArticleId);

  const categories = ['All', 'Privacy', 'Performance', 'WASM'];

  const filteredArticles = ARTICLES.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 overflow-hidden font-sans relative">
      {/* Background visual graphics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!selectedArticle ? (
          /* ================= LIST VIEW ================= */
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6 animate-pulse">
                <BookOpen size={14} />
                <span>Knowledge Base & Editorial Logs</span>
              </div>
              <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-slate-900 dark:text-white mb-6">
                The ImgConvert <span className="gradient-text">Pro Blog</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-650 dark:text-slate-400 leading-relaxed">
                Stay updated with the latest in browser engineering, document privacy models, WebAssembly optimizations, and high-performance digital asset compression.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="w-full md:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {filteredArticles.map(a => (
                  <Card 
                    key={a.id} 
                    glow 
                    className="cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between overflow-hidden group"
                    onClick={() => setSelectedArticleId(a.id)}
                  >
                    <div>
                      {/* Cover */}
                      <div className="relative aspect-[16/10] -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-950">
                        <img 
                          src={a.coverImage} 
                          alt={a.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-600 text-white shadow-md">
                            {a.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-450 text-xs mb-3 font-medium">
                        <div className="flex items-center gap-1"><Calendar size={12} /> {a.date}</div>
                        <div className="flex items-center gap-1"><Clock size={12} /> {a.readTime}</div>
                      </div>

                      <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-3 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors leading-tight">
                        {a.title}
                      </h3>
                      <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed mb-6">
                        {a.summary}
                      </p>
                    </div>

                    <div className="border-t border-black/5 dark:border-white/5 pt-4 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-450 text-xs font-bold font-display">
                          {a.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">{a.author}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">{a.authorRole}</div>
                        </div>
                      </div>

                      <button 
                        onClick={(e) => handleLike(a.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-all text-xs font-semibold"
                      >
                        <Heart size={12} className={likes[a.id] ? "fill-red-500 text-red-500 animate-pulse" : ""} />
                        <span>{likes[a.id] || 0}</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center mb-4 text-slate-500">
                  <BookOpen size={24} />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">No articles found</h4>
                <p className="text-sm text-slate-500 dark:text-slate-450">Try broadening your search term or select another category filter.</p>
              </div>
            )}

            {/* Newsletter section */}
            <div className="relative rounded-3xl bg-gradient-to-r from-primary-600/10 to-violet-600/10 border border-primary-500/20 p-8 sm:p-12 text-center max-w-4xl mx-auto overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Join the Editorial Feed
                </h3>
                <p className="text-sm sm:text-base text-slate-650 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
                  Get structural insights into WebAssembly compile steps, next-gen image extensions optimizations, and local-first browser architectures delivered weekly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                  <button
                    onClick={() => alert('Successfully joined editorial updates!')}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-primary-500/15 hover:shadow-primary-500/25"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= ARTICLE VIEW ================= */
          <div className="max-w-4xl mx-auto animate-slide-up">
            {/* Back Button */}
            <button 
              onClick={() => setSelectedArticleId(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white mb-8 group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </button>

            {/* Main Article Container */}
            <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg p-6 sm:p-12 mb-12">
              <header className="mb-10">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 mb-6 inline-block">
                  {selectedArticle.category}
                </span>

                <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white mb-6 leading-tight">
                  {selectedArticle.title}
                </h1>

                {/* Metadata & Author info */}
                <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-450 text-sm font-bold font-display">
                      {selectedArticle.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white leading-none">{selectedArticle.author}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-none">{selectedArticle.authorRole}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5"><Calendar size={13} /> {selectedArticle.date}</div>
                    <div className="flex items-center gap-1.5"><Clock size={13} /> {selectedArticle.readTime}</div>
                  </div>
                </div>
              </header>

              {/* Cover Image */}
              <div className="relative aspect-[16/9] -mx-6 sm:-mx-12 -mt-4 mb-10 overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img 
                  src={selectedArticle.coverImage} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Body Content */}
              <div className="space-y-6 text-slate-650 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-10">
                {selectedArticle.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Share & Engage Footer */}
              <div className="border-t border-black/5 dark:border-white/5 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleLike(selectedArticle.id, e)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 border border-slate-200/50 dark:border-white/5 font-semibold transition-all text-sm"
                  >
                    <Heart size={16} className={likes[selectedArticle.id] ? "fill-red-500 text-red-500" : ""} />
                    <span>Appreciate ({likes[selectedArticle.id] || 0})</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Article link copied to clipboard!');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 border border-slate-200/50 dark:border-white/5 transition-all"
                    title="Copy Article Link"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Read privately. 100% secure offline tracking.</span>
                </div>
              </div>
            </article>

            {/* Quick Recommended Read */}
            <div className="border-t border-black/5 dark:border-white/10 pt-10">
              <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-6">More from the Editorial Team</h4>
              <div className="grid sm:grid-cols-2 gap-6">
                {ARTICLES.filter(a => a.id !== selectedArticle.id).slice(0, 2).map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => {
                      setSelectedArticleId(r.id);
                      window.scrollTo(0, 0);
                    }}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl cursor-pointer hover:border-primary-500/40 dark:hover:border-primary-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-2 block">{r.category}</span>
                      <h5 className="font-display font-bold text-base text-slate-900 dark:text-white mb-2 line-clamp-2">{r.title}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-2 leading-relaxed mb-4">{r.summary}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>{r.date}</span>
                      <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-bold hover:underline">
                        Read <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
