import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import Home from './pages/Home';
import Converter from './pages/Converter';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import PdfTools from './pages/PdfTools';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';

import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="converter" element={<Converter />} />
          <Route path="pdf-tools" element={<PdfTools />} />
          <Route path="features" element={<Features />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
