import { useState, useEffect, useCallback } from 'react';
import { Filter, Search, X, ArrowUpDown, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api, type Stock, type ScreenerFilters } from '@/services/api';

interface StockScreenerProps {
  onStockClick: (symbol: string) => void;
}

export function StockScreener({ onStockClick }: StockScreenerProps) {
  const [filters, setFilters] = useState<ScreenerFilters>({
    minScore: 0,
    maxScore: 100,
    minPe: 0,
    maxPe: 50,
    minDividendYield: 0,
    maxDividendYield: 15,
    sector: undefined,
    minRoe: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Stock; direction: 'asc' | 'desc' }>({
    key: 'totalScore',
    direction: 'desc'
  });

  // Fetch sectors on mount
  useEffect(() => {
    api.getSectors()
      .then(res => {
        if (res.success) setSectors(res.data);
      })
      .catch(console.error);
  }, []);

  // Fetch stocks when filters change
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams: ScreenerFilters = {
        ...filters,
        searchQuery: searchQuery || undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };

      // Remove default values
      if (filterParams.minScore === 0) delete filterParams.minScore;
      if (filterParams.maxScore === 100) delete filterParams.maxScore;
      if (filterParams.minPe === 0) delete filterParams.minPe;
      if (filterParams.maxPe === 50) delete filterParams.maxPe;
      if (filterParams.minDividendYield === 0) delete filterParams.minDividendYield;
      if (filterParams.maxDividendYield === 15) delete filterParams.maxDividendYield;
      if (filterParams.minRoe === 0) delete filterParams.minRoe;

      const res = await api.getStocks(filterParams);
      if (res.success) {
        setStocks(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sortConfig]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleSort = (key: keyof Stock) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      minScore: 0,
      maxScore: 100,
      minPe: 0,
      maxPe: 50,
      minDividendYield: 0,
      maxDividendYield: 15,
      sector: undefined,
      minRoe: 0,
    });
    setSearchQuery('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery') return false;
    if (key === 'sector') return value !== undefined;
    if (key === 'minScore') return Number(value) > 0;
    if (key === 'maxScore') return Number(value) < 100;
    if (key === 'minPe') return Number(value) > 0;
    if (key === 'maxPe') return Number(value) < 50;
    if (key === 'minDividendYield') return Number(value) > 0;
    if (key === 'maxDividendYield') return Number(value) < 15;
    if (key === 'minRoe') return Number(value) > 0;
    return false;
  }).length + (searchQuery ? 1 : 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Smart Stock Screener
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Filter stocks by your criteria
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchStocks}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Smart Score Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Smart Score Range</label>
              <div className="flex items-center gap-4">
                <span className="text-sm w-8">{filters.minScore}</span>
                <Slider
                  value={[filters.minScore || 0, filters.maxScore || 100]}
                  onValueChange={([min, max]) => setFilters({ ...filters, minScore: min, maxScore: max })}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm w-8">{filters.maxScore}</span>
              </div>
            </div>

            {/* P/E Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">P/E Ratio Range</label>
              <div className="flex items-center gap-4">
                <span className="text-sm w-8">{filters.minPe}</span>
                <Slider
                  value={[filters.minPe || 0, filters.maxPe || 50]}
                  onValueChange={([min, max]) => setFilters({ ...filters, minPe: min, maxPe: max })}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8">{filters.maxPe}</span>
              </div>
            </div>

            {/* Dividend Yield */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Dividend Yield Range (%)</label>
              <div className="flex items-center gap-4">
                <span className="text-sm w-8">{filters.minDividendYield}</span>
                <Slider
                  value={[filters.minDividendYield || 0, filters.maxDividendYield || 15]}
                  onValueChange={([min, max]) => setFilters({ ...filters, minDividendYield: min, maxDividendYield: max })}
                  max={15}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm w-8">{filters.maxDividendYield}</span>
              </div>
            </div>

            {/* Sector */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Sector</label>
              <Select
                value={filters.sector || 'all'}
                onValueChange={(value) => setFilters({ ...filters, sector: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min ROE */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Minimum ROE (%)</label>
              <Slider
                value={[filters.minRoe || 0]}
                onValueChange={([value]) => setFilters({ ...filters, minRoe: value })}
                max={40}
                step={1}
              />
              <div className="text-sm text-muted-foreground">{filters.minRoe}%</div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      )}

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{stocks.length}</span> stocks
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('symbol')}>
                  <div className="flex items-center gap-1">
                    Symbol
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort('closePrice')}>
                  <div className="flex items-center justify-end gap-1">
                    Price
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center" onClick={() => handleSort('totalScore')}>
                  <div className="flex items-center justify-center gap-1">
                    Score
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort('peRatio')}>
                  <div className="flex items-center justify-end gap-1">
                    P/E
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort('dividendYield')}>
                  <div className="flex items-center justify-end gap-1">
                    Div Yield
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => handleSort('roe')}>
                  <div className="flex items-center justify-end gap-1">
                    ROE
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && stocks.length === 0 ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                stocks.map((stock) => (
                  <TableRow
                    key={stock.symbol}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onStockClick(stock.symbol)}
                  >
                    <TableCell className="font-semibold">{stock.symbol}</TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {stock.sector}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.closePrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getScoreColor(stock.totalScore)} text-white`}>
                        {stock.totalScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.peRatio != null && stock.peRatio > 0 ? stock.peRatio.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.dividendYield != null && stock.dividendYield > 0 ? stock.dividendYield.toFixed(2) + '%' : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.roe != null && stock.roe > 0 ? stock.roe.toFixed(1) + '%' : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && stocks.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No stocks match your filters</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filter criteria
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
