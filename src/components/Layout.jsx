import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-ivory text-midnight-800 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-midnight-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 text-xs text-midnight-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Kandura Store — made to your measure.</span>
          <span>&copy; {new Date().getFullYear()} Kandura Store</span>
        </div>
      </footer>
    </div>
  );
}
