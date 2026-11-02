/**
 * FarmLink Ethiopia — Main Application Entry Point
 * Phase 1 (MVP) Full Implementation
 */

import React, { useState, useEffect } from 'react';
import { User, Product, ProduceListing, PriceReport, Order, Language, EthiopianDate, NavTab } from './types';
import { TopBar } from './components/TopBar';
import { HomePage } from './components/HomePage';
import { InputMarketplace } from './components/InputMarketplace';
import { ProduceMarketplace } from './components/ProduceMarketplace';
import { MarketPriceBoard } from './components/MarketPriceBoard';
import { OrdersList } from './components/OrdersList';
import { ThreeAgriViewer } from './components/ThreeAgriViewer';
import { OrderEscrowModal } from './components/OrderEscrowModal';
import { AiPlantDoctor } from './components/AiPlantDoctor';
import { AgriChatbot } from './components/AgriChatbot';
import { Footer } from './components/Footer';
import { TRANSLATIONS } from './i18n/translations';
import { speakMessage } from './utils/audioGuidance';
import { ShoppingBag, Sprout, TrendingUp, Package, Box, Layers, WifiOff, Stethoscope, Bot, Home } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<(Product & { distanceKm?: number })[]>([]);
  const [produceListings, setProduceListings] = useState<(ProduceListing & { distanceKm?: number })[]>([]);
  const [priceReports, setPriceReports] = useState<PriceReport[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ethiopianDate, setEthiopianDate] = useState<EthiopianDate | null>(null);

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('farmlink_lang') as Language;
    return (saved && ['en', 'am', 'om', 'ti'].includes(saved)) ? saved : 'en';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [orderModalItem, setOrderModalItem] = useState<{ type: 'PRODUCT'; data: Product } | { type: 'PRODUCE'; data: ProduceListing } | null>(null);
  const [active3dModel, setActive3dModel] = useState<'teff' | 'coffee' | 'tractor'>('teff');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [notification, setNotification] = useState<string | null>(null);

  // Network offline detector
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch all initial data
  const loadData = async () => {
    try {
      const [userRes, allUsersRes, prodRes, produceRes, pricesRes, ordersRes, calRes] = await Promise.all([
        fetch('/api/users/current').then((r) => r.json()),
        fetch('/api/users/all').then((r) => r.json()),
        fetch('/api/inputs').then((r) => r.json()),
        fetch('/api/produce').then((r) => r.json()),
        fetch('/api/prices').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/calendar/today').then((r) => r.json()),
      ]);

      setCurrentUser(userRes);
      setAllUsers(allUsersRes);
      setProducts(prodRes);
      setProduceListings(produceRes);
      setPriceReports(pricesRes);
      setOrders(ordersRes);
      setEthiopianDate(calRes);

      // Cache locally for offline resilience
      localStorage.setItem('farmlink_cache_products', JSON.stringify(prodRes));
      localStorage.setItem('farmlink_cache_prices', JSON.stringify(pricesRes));
    } catch (err) {
      console.warn('Network request failed, reading from offline cache:', err);
      const cachedProds = localStorage.getItem('farmlink_cache_products');
      const cachedPrices = localStorage.getItem('farmlink_cache_prices');
      if (cachedProds) setProducts(JSON.parse(cachedProds));
      if (cachedPrices) setPriceReports(JSON.parse(cachedPrices));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/users/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then((r) => r.json());

      if (res.user) {
        setCurrentUser(res.user);
        // Refresh products and listings relative to new user location
        loadData();
        showNotification(`Switched persona to: ${res.user.fullName} (${res.user.role})`);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const handleLanguageChange = async (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('farmlink_lang', lang);
    if (audioEnabled) {
      const welcome =
        lang === 'am'
          ? 'ቋንቋ ወደ አማርኛ ተቀይሯል።'
          : lang === 'om'
          ? 'Afaan Oromootti jijjiirameera.'
          : lang === 'ti'
          ? 'ቋንቋ ናብ ትግርኛ ተቐይሩ።'
          : 'Language switched to English.';
      speakMessage(welcome, lang);
    }
    try {
      await fetch('/api/users/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
    } catch (e) {
      // offline silent pass
    }
  };

  const handleAddNewProduct = async (productData: any) => {
    try {
      const res = await fetch('/api/inputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      }).then((r) => r.json());

      if (res && res.id) {
        setProducts([res, ...products]);
        showNotification('Input inventory published successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewListing = async (listingData: any) => {
    try {
      const res = await fetch('/api/produce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      }).then((r) => r.json());

      if (res && res.id) {
        setProduceListings([res, ...produceListings]);
        showNotification('Produce harvest listed for buyers.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitOrder = async (orderPayload: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    }).then((r) => r.json());

    if (res && res.id) {
      setOrders([res, ...orders]);
      setActiveTab('orders');
      showNotification(`Order ${res.orderNumber} initiated. Escrow funds placed on hold.`);
      if (audioEnabled) {
        speakMessage(
          language === 'am'
            ? 'ትዕዛዝዎ ተመዝግቧል። የይለፍ ሚስጥር ቁጥርዎን በትዕዛዞች ገጽ ይመልከቱ።'
            : language === 'om'
            ? 'Ajajni keessan galmaa’eera. Koodii icciitii keessan ilaalaa.'
            : 'Order confirmed with safe escrow.',
          language
        );
      }
    }
  };

  const handleReleaseEscrow = async (orderId: string, otp: string) => {
    const res = await fetch(`/api/orders/${orderId}/release-escrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    }).then((r) => r.json());

    if (res.success && res.order) {
      setOrders(orders.map((o) => (o.id === orderId ? res.order : o)));
      showNotification(res.message);
      if (audioEnabled) {
        speakMessage(
          language === 'am' ? 'ክፍያው በተሳካ ሁኔታ ተለቋል።' : language === 'om' ? 'Kaffaltiin mirkanaa’eera.' : 'Escrow released successfully.',
          language
        );
      }
    }
    return res;
  };

  const open3DModel = (modelKey: 'teff' | 'coffee' | 'tractor') => {
    setActive3dModel(modelKey);
    setActiveTab('3d');
  };

  if (!currentUser) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center text-[#0F172A]"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #EEF5FF 100%)' }}
      >
        <div className="text-center space-y-3 bg-white p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          <div className="w-10 h-10 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide text-[#0F172A]">Connecting to FarmLink Ethiopia...</p>
        </div>
      </div>
    );
  }

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div 
      className="min-h-screen text-[#334155] flex flex-col font-sans pb-20 lg:pb-8 transition-colors duration-300"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #EEF5FF 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Top Bar with Top Bar Contract */}
      <TopBar
        user={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSwitchUser}
        language={language}
        onLanguageChange={handleLanguageChange}
        ethiopianDate={ethiopianDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        orderCount={orders.filter((o) => o.status === 'ESCROW_HELD').length}
      />

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Offline Mode Active (Low 3G Signal) · You can browse cached catalogs and prices.</span>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#0F172A] text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-800 max-w-sm transition-all">
          {notification}
        </div>
      )}

      {/* Main Content Viewport with Flexible Responsive Width */}
      <main className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 flex-1">
        {activeTab === 'home' && (
          <HomePage
            currentUser={currentUser}
            language={language}
            ethiopianDate={ethiopianDate}
            priceReports={priceReports}
            products={products}
            produceListings={produceListings}
            onNavigateTab={setActiveTab}
            audioEnabled={audioEnabled}
            onOrderProduct={(prod) => setOrderModalItem({ type: 'PRODUCT', data: prod })}
            onOrderProduce={(listing) => setOrderModalItem({ type: 'PRODUCE', data: listing })}
          />
        )}

        {activeTab === 'inputs' && (
          <InputMarketplace
            products={products}
            currentUser={currentUser}
            language={language}
            onOrderProduct={(prod) => setOrderModalItem({ type: 'PRODUCT', data: prod })}
            onOpen3D={open3DModel}
            onAddNewProduct={handleAddNewProduct}
          />
        )}

        {activeTab === 'produce' && (
          <ProduceMarketplace
            listings={produceListings}
            currentUser={currentUser}
            language={language}
            onOrderProduce={(listing) => setOrderModalItem({ type: 'PRODUCE', data: listing })}
            onOpen3D={open3DModel}
            onAddNewListing={handleAddNewListing}
          />
        )}

        {activeTab === 'prices' && (
          <MarketPriceBoard
            priceReports={priceReports}
            language={language}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersList
            orders={orders}
            currentUser={currentUser}
            language={language}
            onReleaseEscrow={handleReleaseEscrow}
          />
        )}

        {activeTab === '3d' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  {t.tab3DViewer} — Procedural Ethiopian Agri Inspector
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Inspect grain spikelets, coffee nodes, and tractor mechanisms in interactive 3D.
                </p>
              </div>
            </div>
            <ThreeAgriViewer
              initialModel={active3dModel}
              language={language}
            />
          </div>
        )}

        {activeTab === 'aiDoctor' && (
          <AiPlantDoctor
            currentUser={currentUser}
            language={language}
            products={products}
            onOrderMedicine={(medicineProduct) => {
              setOrderModalItem({ type: 'PRODUCT', data: medicineProduct });
            }}
          />
        )}

        {activeTab === 'chat' && (
          <AgriChatbot
            currentUser={currentUser}
            language={language}
          />
        )}
      </main>

      {/* Professional Footer */}
      <Footer language={language} onNavigateTab={setActiveTab} />

      {/* Order & Safe Escrow Modal */}
      {orderModalItem && (
        <OrderEscrowModal
          item={orderModalItem}
          currentUser={currentUser}
          language={language}
          onClose={() => setOrderModalItem(null)}
          onSubmitOrder={handleSubmitOrder}
        />
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Touch Guidelines) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E2E8F0] text-[#64748B] grid grid-cols-8 items-center h-16 pb-safe backdrop-blur-md shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer ${
            activeTab === 'home' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <Home className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate">{t.tabHome || 'Home'}</span>
        </button>

        <button
          onClick={() => setActiveTab('inputs')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer ${
            activeTab === 'inputs' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <Box className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate">{t.tabInputs.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => setActiveTab('produce')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer ${
            activeTab === 'produce' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <Sprout className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate">{t.tabProduce.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer ${
            activeTab === 'chat' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <Bot className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate">Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('aiDoctor')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer ${
            activeTab === 'aiDoctor' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <Stethoscope className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate">Doctor</span>
        </button>

        <button
          onClick={() => setActiveTab('prices')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer ${
            activeTab === 'prices' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <TrendingUp className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate">{t.tabPrices}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer relative ${
            activeTab === 'orders' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight truncate">{t.tabOrders}</span>
          {orders.filter((o) => o.status === 'ESCROW_HELD').length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2563EB]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('3d')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer ${
            activeTab === '3d' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
          }`}
        >
          <Layers className="w-4 h-4 mb-1" />
          <span className="text-[9px] tracking-tight">3D</span>
        </button>
      </nav>

      {/* Quick Demo Persona Floating Pill (Accessible from any page without cluttering the top header) */}
      {allUsers.length > 0 && currentUser && (
        <aside 
          aria-label="Demo Persona Switcher"
          className="fixed bottom-20 lg:bottom-4 right-4 z-40 hidden sm:flex items-center gap-2.5 bg-[#0F172A]/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-xl text-xs text-slate-200"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#3B82F6] animate-pulse" />
          <span className="text-blue-400 font-bold">{currentUser.role}:</span>
          <span className="text-white font-semibold truncate max-w-[100px]">{currentUser.fullName.split(' ')[0]}</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSwitchUser(u.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  u.id === currentUser.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={`Switch to ${u.fullName} (${u.role})`}
              >
                {u.role === 'FARMER' ? 'Farmer' : u.role === 'BUYER' ? 'Buyer' : u.role === 'SUPPLIER' ? 'Supplier' : 'Admin'}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
