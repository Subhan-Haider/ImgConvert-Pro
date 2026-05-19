import { useState } from 'react';
import { 
  ArrowLeft, Clock, Share2, BookOpen, Heart, Calendar, 
  ChevronRight, ShieldCheck, Plus, X, Trash2
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
  isCustom?: boolean;
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
  },
  {
    id: 'local-pdf-crypto',
    title: 'Unlocking Local-First PDF Password Security: Browser Cryptography',
    category: 'Privacy',
    date: 'May 08, 2026',
    readTime: '6 min read',
    author: 'Maya Lin',
    authorRole: 'Security Researcher',
    summary: 'Learn how the SubtleCrypto API and WebAssembly PDF encryption algorithms secure document byte streams directly inside browser client memory without third-party decryption relays.',
    coverImage: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80',
    content: [
      'Protecting confidential records is a top priority for corporate and personal workflows. When you share password-encrypted PDFs over typical online decrypters, you are sending your raw master keys directly over standard network channels. If those servers are monitored, your document password keys are permanently exposed.',
      'Our local cryptography model keeps credentials 100% inside your own workspace. We use WebAssembly ports of robust cryptographic models combined with standard browser-native HTML5 SubtleCrypto methods. When you enter a password to lock or unlock a PDF, the key derivation functions are executed in-tab.',
      'This means your master hash is calculated in real time, and the raw document bytes are encrypted directly in client-side RAM before being formatted into standardized PDF outputs. No external database or relay server ever receives the key or raw decrypted layers.',
      'Whether you are protecting personal bank statements, proprietary intellectual layouts, or sensitive clinical logs, your passwords and keys remain fully locked inside your local workspace.'
    ]
  },
  {
    id: 'svg-vector-future',
    title: 'The Future of Vector Graphics: Native SVG Conversions in Modern Apps',
    category: 'General',
    date: 'May 05, 2026',
    readTime: '5 min read',
    author: 'Marcus Vane',
    authorRole: 'Lead UI Designer',
    summary: 'Understand how client-side vector rasterization and SVG structural compiling allow high-fidelity image scaling and seamless responsive visual exports.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    content: [
      'Vector elements (like SVGs) are the cornerstone of clean modern visual designs. Unlike standard raster formats (like PNGs and JPEGs) which consist of fixed pixel grids, SVGs consist of geometric path vectors that can scale indefinitely without quality degradation.',
      'Converting these visual paths into standard raster elements for web delivery or batch archiving traditionally required heavy design environments. ImgConvert Pro automates this by executing native vector-to-raster parsing inside the browser canvas.',
      'When you upload an SVG file, the application parses the DOM XML structure, preserves visual attributes like linear gradients and viewBox sizes, and renders the mathematical curves onto a high-definition canvas element. From there, you can export to next-gen WebP or AVIF formats instantly.',
      'This offline rendering method maintains crisp lines and flawless color fidelity. It provides a robust, lightweight workflow for developers and designers who need high-performance assets.'
    ]
  },
  {
    id: 'multithreaded-batch-convert',
    title: 'Supercharging Batch File Conversions with Background Multithreading',
    category: 'Performance',
    date: 'May 01, 2026',
    readTime: '7 min read',
    author: 'Nolan Vance',
    authorRole: 'Parallel Systems Developer',
    summary: 'A deep dive into browser Web Workers, dynamic task pools, and parallel offscreen rendering strategies to convert hundreds of files concurrently without blocking interface feedback.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    content: [
      'Processing massive batches of images or heavy multi-page documents can easily freeze the main browser thread. When this happens, buttons become unresponsive, animations freeze, and the entire tab becomes completely locked.',
      'To prevent this, ImgConvert Pro implements a dynamic Web Worker architecture. By spawning multiple parallel threads, the main UI thread remains completely free for user interaction while CPU-intensive pixel conversions execute in the background.',
      'Each file in a batch is assigned to an isolated background worker. These workers maintain their own WebAssembly memories and execute raw compression, scaling, and file compilation concurrently. This allows you to process hundreds of items simultaneously without a single drop in UI frame rate.',
      'This multithreaded design utilizes every processing core on your local machine. It turns your browser into a high-powered, fully private local workstation that handles heavy-duty processing with ease.'
    ]
  }
];

export default function Blog() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likes, setLikes] = useState<Record<string, number>>({});
  
  // Custom blog articles state with localStorage persistence
  const [customArticles, setCustomArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('imgconvert_custom_blogs');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Privacy');
  const [newAuthor, setNewAuthor] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('Contributor');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCover, setNewCover] = useState('');

  const allArticles = [...ARTICLES, ...customArticles];

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom article?')) {
      const updated = customArticles.filter(a => a.id !== id);
      setCustomArticles(updated);
      localStorage.setItem('imgconvert_custom_blogs', JSON.stringify(updated));
      if (selectedArticleId === id) {
        setSelectedArticleId(null);
      }
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newSummary || !newContent) {
      alert('Please fill out all required fields.');
      return;
    }

    const defaultCovers: Record<string, string> = {
      Privacy: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      Performance: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      WASM: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
      General: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    };

    const finalCover = newCover.trim() || defaultCovers[newCategory] || defaultCovers.General;

    const newArticle: Article = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: `${Math.max(1, Math.ceil(newContent.split(/\s+/).length / 200))} min read`,
      author: newAuthor,
      authorRole: newAuthorRole,
      summary: newSummary,
      coverImage: finalCover,
      content: newContent.split('\n\n').filter(p => p.trim() !== ''),
      isCustom: true
    };

    const updated = [newArticle, ...customArticles];
    setCustomArticles(updated);
    localStorage.setItem('imgconvert_custom_blogs', JSON.stringify(updated));

    // Clear form inputs
    setNewTitle('');
    setNewAuthor('');
    setNewAuthorRole('Contributor');
    setNewSummary('');
    setNewContent('');
    setNewCover('');
    setIsModalOpen(false);
  };

  const selectedArticle = allArticles.find(a => a.id === selectedArticleId);

  const categories = ['All', 'Privacy', 'Performance', 'WASM', 'General'];

  const filteredArticles = allArticles.filter(a => {
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
              <p className="text-base sm:text-lg text-slate-650 dark:text-slate-400 leading-relaxed mb-8">
                Stay updated with the latest in browser engineering, document privacy models, WebAssembly optimizations, and high-performance digital asset compression.
              </p>

              {/* Action Button to Add Blogs */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm sm:text-base transition-all duration-300 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                Write an Article
              </button>
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
                    className="cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between overflow-hidden group relative"
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
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-600 text-white shadow-md">
                            {a.category}
                          </span>
                          {a.isCustom && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                              User Post
                            </span>
                          )}
                        </div>

                        {/* Custom Article Deletion Trigger */}
                        {a.isCustom && (
                          <button
                            onClick={(e) => handleDelete(a.id, e)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-red-600/90 text-white hover:bg-red-500 transition-colors shadow-md z-20"
                            title="Delete Article"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-450 text-xs mb-3 font-medium">
                        <div className="flex items-center gap-1"><Calendar size={12} /> {a.date}</div>
                        <div className="flex items-center gap-1"><Clock size={12} /> {a.readTime}</div>
                      </div>

                      <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-3 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors leading-tight line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                        {a.summary}
                      </p>
                    </div>

                    <div className="border-t border-black/5 dark:border-white/5 pt-4 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-450 text-xs font-bold font-display">
                          {a.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[120px]">{a.author}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none truncate max-w-[120px]">{a.authorRole}</div>
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
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 mb-16">
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
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 inline-block">
                    {selectedArticle.category}
                  </span>
                  {selectedArticle.isCustom && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 inline-block">
                      User Post
                    </span>
                  )}
                </div>

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
                {allArticles.filter(a => a.id !== selectedArticle.id).slice(0, 2).map(r => (
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

      {/* ================= WRITE ARTICLE MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Create a Blog Article</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your article will compile and persist securely inside local storage.</p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5">
              {/* Grid block */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    placeholder="e.g. Subhan Haider"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author Role</label>
                  <input
                    type="text"
                    value={newAuthorRole}
                    onChange={e => setNewAuthorRole(e.target.value)}
                    placeholder="e.g. Core Contributor"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Article Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Image Quality Metrics in Web Browsers"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  >
                    <option value="Privacy">Privacy</option>
                    <option value="Performance">Performance</option>
                    <option value="WASM">WASM</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Image URL (Optional)</label>
                  <input
                    type="url"
                    value={newCover}
                    onChange={e => setNewCover(e.target.value)}
                    placeholder="Leave blank for dynamic unsplash cover"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Summary *</label>
                <input
                  type="text"
                  required
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Provide a 1-2 sentence high-level outline of the article"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Article Body Content *</label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Write the full content of your article here. Separate paragraphs with double-newlines (Press Enter twice)."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/25"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
