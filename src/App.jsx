import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Designs from './pages/Designs';
import CreateDesign from './pages/CreateDesign';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function DashboardHome() {
  return (
    <div>
      <section className="rounded-2xl bg-midnight-950 text-ivory p-10 md:p-14 shadow-card-hover relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gold-400/10" />
        <p className="eyebrow mb-3">Bespoke tailoring, online</p>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] max-w-xl">
          Welcome back to the atelier.
        </h1>
        <p className="mt-4 text-midnight-300 max-w-md leading-relaxed">
          Manage your custom kandura designs, orders, wallet, and profile from one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/designs/create" className="btn-gold"><Sparkles className="w-4 h-4" /> Start a design</Link>
          <Link to="/designs?mode=browse" className="btn-outline !border-midnight-700 !text-ivory hover:!bg-midnight-900">
            <ShoppingBag className="w-4 h-4" /> Browse the gallery
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/designs/create" element={<CreateDesign />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
