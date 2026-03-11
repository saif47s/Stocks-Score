import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Search, PieChart, Menu, X, RefreshCw, AlertCircle, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MarketTrendIndicator } from '@/components/dashboard/MarketTrendIndicator';
import { TopStocksTable } from '@/components/dashboard/TopStocksTable';
import { SectorHeatmap } from '@/components/dashboard/SectorHeatmap';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { StockScreener } from '@/components/screener/StockScreener';
import { CustomWeightedScanner } from '@/components/screener/CustomWeightedScanner';
import { CompanyDetail } from '@/components/company/CompanyDetail';
import { PortfolioAnalyzer } from '@/components/portfolio/PortfolioAnalyzer';
import { api, type Stock, type MarketOverview, type SectorPerformance } from '@/services/api';
import './App.css';

type View = 'dashboard' | 'screener' | 'company' | 'portfolio' | 'custom-scanner';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [topStocks, setTopStocks] = useState<Stock[]>([]);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [sectors, setSectors] = useState<SectorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stocksRes, topRes, overviewRes, sectorsRes] = await Promise.all([
        api.getStocks(),
        api.getTopStocks(10),
        api.getMarketOverview(),
        api.getSectorPerformance()
      ]);

      if (stocksRes.success) setStocks(stocksRes.data);
      if (topRes.success) setTopStocks(topRes.data);
      if (overviewRes.success) setMarketOverview(overviewRes.data);
      if (sectorsRes.success) setSectors(sectorsRes.data);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    setCurrentView('company');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedStock('');
  };

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'screener' as View, label: 'Stock Screener', icon: Search },
    { id: 'custom-scanner' as View, label: 'Custom Scanner', icon: Sliders },
    { id: 'portfolio' as View, label: 'Portfolio', icon: PieChart },
  ];

  const renderContent = () => {
    if (loading && stocks.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            {marketOverview && (
              <StatsOverview
                overview={marketOverview}
                totalStocks={stocks.length}
              />
            )}

            {/* Market Trend & Top Stocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {marketOverview && (
                  <MarketTrendIndicator overview={marketOverview} />
                )}
              </div>
              <div className="lg:col-span-2">
                <TopStocksTable
                  stocks={topStocks}
                  onStockClick={handleStockClick}
                  loading={loading}
                />
              </div>
            </div>

            {/* Sector Heatmap */}
            <SectorHeatmap sectors={sectors} loading={loading} />
          </div>
        );

      case 'screener':
        return (
          <StockScreener onStockClick={handleStockClick} />
        );

      case 'custom-scanner':
        return (
          <CustomWeightedScanner onStockClick={handleStockClick} />
        );

      case 'company':
        return (
          <CompanyDetail
            symbol={selectedStock}
            onBack={handleBack}
          />
        );

      case 'portfolio':
        return (
          <PortfolioAnalyzer onStockClick={handleStockClick} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SmartStock</h1>
              <p className="text-[10px] text-muted-foreground -mt-1">Pro</p>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView(item.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-2 mb-1"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={fetchData}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Page Title */}
        {currentView !== 'company' && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {currentView === 'dashboard' && 'Master Dashboard'}
              {currentView === 'screener' && 'Smart Stock Screener'}
              {currentView === 'custom-scanner' && 'Institutional Custom Scanner'}
              {currentView === 'portfolio' && 'Portfolio Analyzer'}
            </h2>
            <p className="text-muted-foreground">
              {currentView === 'dashboard' && 'Track top-performing stocks and market trends'}
              {currentView === 'screener' && 'Filter and find stocks matching your criteria'}
              {currentView === 'custom-scanner' && 'Personalize the weighting algorithm to find hidden gems'}
              {currentView === 'portfolio' && 'Analyze your portfolio health and performance'}
            </p>
          </div>
        )}

        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <LayoutDashboard className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">SmartStock Pro</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Real-time fundamental analysis for Pakistan Stock Market (PSX)
            </p>
            <p className="text-xs text-muted-foreground">
              Data source: Pakistan Stock Exchange (PSX)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
