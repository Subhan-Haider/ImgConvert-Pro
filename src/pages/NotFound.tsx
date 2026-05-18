import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 animate-fade-in text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} className="text-red-500" />
      </div>
      
      <h1 className="font-display font-bold text-6xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
        404
      </h1>
      
      <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
      
      <p className="text-slate-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/">
        <Button size="lg" className="gap-2">
          <Home size={18} /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
