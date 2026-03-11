import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, AlertTriangle, PieChart, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api, type Stock } from '@/services/api';

interface PortfolioHolding {
  symbol: string;
  name: string;
  sector: string;
  sharesOwned: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalScore: number;
  currentValue: number;
  investedValue: number;
  returnPct: number;
  returnAmount: number;
}

interface Portfolio {
  holdings: PortfolioHolding[];
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  avgScore: number;
  riskyStocks: number;
}

interface PortfolioAnalyzerProps {
  onStockClick: (symbol: string) => void;
}

export function PortfolioAnalyzer({ onStockClick }: PortfolioAnalyzerProps) {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    holdings: [],
    totalValue: 0,
    totalInvested: 0,
    totalReturn: 0,
    avgScore: 0,
    riskyStocks: 0
  });
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [newStock, setNewStock] = useState({ symbol: '', shares: '', avgPrice: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load available stocks
  useEffect(() => {
    api.getStocks().then(res => {
      if (res.success) {
        setAvailableStocks(res.data);
        setLoading(false);
      }
    });
  }, []);

  // Load portfolio from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartstock-portfolio');
    if (saved) {
      const holdings = JSON.parse(saved);
      updatePortfolio(holdings);
    }
  }, [availableStocks]);

  const addHolding = () => {
    if (!newStock.symbol || !newStock.shares || !newStock.avgPrice) return;

    const stock = availableStocks.find(s => s.symbol === newStock.symbol);
    if (!stock) return;

    const shares = parseInt(newStock.shares);
    const avgPrice = parseFloat(newStock.avgPrice);
    const currentValue = shares * stock.closePrice;
    const investedValue = shares * avgPrice;

    const holding: PortfolioHolding = {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      sharesOwned: shares,
      avgBuyPrice: avgPrice,
      currentPrice: stock.closePrice,
      totalScore: stock.totalScore,
      currentValue,
      investedValue,
      returnPct: ((currentValue - investedValue) / investedValue) * 100,
      returnAmount: currentValue - investedValue,
    };

    const updatedHoldings = [...portfolio.holdings, holding];
    updatePortfolio(updatedHoldings);

    // Save to localStorage
    localStorage.setItem('smartstock-portfolio', JSON.stringify(updatedHoldings));

    setNewStock({ symbol: '', shares: '', avgPrice: '' });
    setDialogOpen(false);
  };

  const removeHolding = (symbol: string) => {
    const updatedHoldings = portfolio.holdings.filter(h => h.symbol !== symbol);
    updatePortfolio(updatedHoldings);
    localStorage.setItem('smartstock-portfolio', JSON.stringify(updatedHoldings));
  };

  const updatePortfolio = (holdings: PortfolioHolding[]) => {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
    const avgScore = holdings.length > 0
      ? holdings.reduce((sum, h) => sum + h.totalScore, 0) / holdings.length
      : 0;
    const riskyStocks = holdings.filter(h => h.totalScore < 50).length;

    setPortfolio({
      holdings,
      totalValue,
      totalInvested,
      totalReturn: totalValue - totalInvested,
      avgScore: parseFloat(avgScore.toFixed(1)),
      riskyStocks,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Calculate sector allocation
  const sectorAllocation = portfolio.holdings.reduce((acc, holding) => {
    acc[holding.sector] = (acc[holding.sector] || 0) + holding.currentValue;
    return acc;
  }, {} as Record<string, number>);

  const portfolioStocks = availableStocks.filter(s =>
    !portfolio.holdings.some(h => h.symbol === s.symbol)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Value</span>
            </div>
            <div className="text-2xl font-bold">PKR {portfolio.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Return</span>
            </div>
            <div className={`text-2xl font-bold ${portfolio.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {portfolio.totalReturn >= 0 ? '+' : ''}PKR {portfolio.totalReturn.toLocaleString()}
            </div>
            <div className={`text-sm ${portfolio.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ({portfolio.totalInvested > 0 ? ((portfolio.totalReturn / portfolio.totalInvested) * 100).toFixed(2) : '0.00'}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Smart Score</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreTextColor(portfolio.avgScore)}`}>
              {portfolio.avgScore.toFixed(1)}
            </div>
            <Progress 
              value={portfolio.avgScore} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Holdings</span>
            </div>
            <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
            {portfolio.riskyStocks > 0 && (
              <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                <AlertTriangle className="w-3 h-3" />
                {portfolio.riskyStocks} risky stocks
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Alert */}
      {portfolio.riskyStocks > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-500/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-500">Portfolio Risk Alert</h3>
              <p className="text-sm text-muted-foreground">
                Your portfolio contains {portfolio.riskyStocks} stock(s) with a Smart Score below 50.
                Consider reviewing these positions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Your Holdings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your investments and their Smart Scores
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock to Portfolio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Stock</Label>
                  <Select 
                    value={newStock.symbol} 
                    onValueChange={(value) => setNewStock({ ...newStock, symbol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolioStocks.map(stock => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Shares</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={newStock.shares}
                    onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Average Buy Price (PKR)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={newStock.avgPrice}
                    onChange={(e) => setNewStock({ ...newStock, avgPrice: e.target.value })}
                  />
                </div>
                <Button onClick={addHolding} className="w-full">
                  Add to Portfolio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {portfolio.holdings.length === 0 ? (
            <div className="text-center py-12">
              <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No holdings yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add stocks to your portfolio to track their performance
              </p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Stock
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Stock</th>
                    <th className="text-right py-3">Shares</th>
                    <th className="text-right py-3">Avg Price</th>
                    <th className="text-right py-3">Current</th>
                    <th className="text-center py-3">Score</th>
                    <th className="text-right py-3">Value</th>
                    <th className="text-right py-3">Return</th>
                    <th className="text-center py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => (
                    <tr 
                      key={holding.symbol} 
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => onStockClick(holding.symbol)}
                    >
                      <td className="py-3">
                        <div>
                          <div className="font-semibold">{holding.symbol}</div>
                          <div className="text-xs text-muted-foreground">{holding.name}</div>
                        </div>
                      </td>
                      <td className="text-right">{holding.sharesOwned}</td>
                      <td className="text-right">{holding.avgBuyPrice.toFixed(2)}</td>
                      <td className="text-right">{holding.currentPrice.toFixed(2)}</td>
                      <td className="text-center">
                        <Badge className={`${getScoreColor(holding.totalScore)} text-white`}>
                          {holding.totalScore}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="font-medium">{holding.currentValue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          of {holding.investedValue.toLocaleString()}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className={`font-medium ${holding.returnPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {holding.returnPct >= 0 ? '+' : ''}{holding.returnPct.toFixed(2)}%
                        </div>
                        <div className={`text-xs ${holding.returnPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {holding.returnAmount >= 0 ? '+' : ''}{holding.returnAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHolding(holding.symbol);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      {portfolio.holdings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sectorAllocation)
                .sort(([, a], [, b]) => b - a)
                .map(([sector, value]) => {
                  const percentage = (value / portfolio.totalValue) * 100;
                  return (
                    <div key={sector}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{sector}</span>
                        <span className="text-muted-foreground">
                          {percentage.toFixed(1)}% (PKR {value.toLocaleString()})
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
