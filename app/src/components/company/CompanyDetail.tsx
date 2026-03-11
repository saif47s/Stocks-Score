import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api, type Stock, type PriceHistory, type FinancialData } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface CompanyDetailProps {
  symbol: string;
  onBack: () => void;
}

export function CompanyDetail({ symbol, onBack }: CompanyDetailProps) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [financials, setFinancials] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [stockRes, historyRes, financialsRes] = await Promise.all([
          api.getStock(symbol),
          api.getStockHistory(symbol, 90),
          api.getStockFinancials(symbol)
        ]);

        if (stockRes.success) setStock(stockRes.data);
        if (historyRes.success) setPriceHistory(historyRes.data);
        if (financialsRes.success) setFinancials(financialsRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Stock not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const scoreBreakdown = [
    {
      category: 'Value & Pricing',
      score: stock.valueScore,
      maxScore: 30,
      percentage: Math.round((stock.valueScore / 30) * 100),
      metrics: [
        { name: 'P/E Ratio', value: stock.peRatio?.toFixed(2) || 'N/A', score: Math.min(8, Math.round(stock.valueScore * 0.27)), maxScore: 8 },
        { name: 'P/B Ratio', value: stock.pbRatio?.toFixed(2) || 'N/A', score: Math.min(6, Math.round(stock.valueScore * 0.20)), maxScore: 6 },
        { name: 'Dividend Yield', value: stock.dividendYield?.toFixed(2) + '%' || 'N/A', score: Math.min(5, Math.round(stock.valueScore * 0.17)), maxScore: 5 },
        { name: 'PEG Ratio', value: '0.85', score: Math.min(7, Math.round(stock.valueScore * 0.23)), maxScore: 7 },
        { name: 'EV/EBITDA', value: '5.2', score: Math.min(4, Math.round(stock.valueScore * 0.13)), maxScore: 4 },
      ],
    },
    {
      category: 'Financial Health',
      score: stock.healthScore,
      maxScore: 30,
      percentage: Math.round((stock.healthScore / 30) * 100),
      metrics: [
        { name: 'Debt/Equity', value: stock.debtToEquity?.toFixed(2) || 'N/A', score: Math.min(8, Math.round(stock.healthScore * 0.27)), maxScore: 8 },
        { name: 'Current Ratio', value: '1.45', score: Math.min(7, Math.round(stock.healthScore * 0.23)), maxScore: 7 },
        { name: 'Piotroski F-Score', value: '7', score: Math.min(8, Math.round(stock.healthScore * 0.27)), maxScore: 8 },
        { name: 'Interest Coverage', value: '8.5x', score: Math.min(4, Math.round(stock.healthScore * 0.13)), maxScore: 4 },
        { name: 'Altman Z-Score', value: '3.2', score: Math.min(3, Math.round(stock.healthScore * 0.10)), maxScore: 3 },
      ],
    },
    {
      category: 'Growth & Profitability',
      score: stock.growthScore,
      maxScore: 25,
      percentage: Math.round((stock.growthScore / 25) * 100),
      metrics: [
        { name: 'EPS Growth (YoY)', value: (stock.epsGrowth?.toFixed(1) || '0') + '%', score: Math.min(7, Math.round(stock.growthScore * 0.28)), maxScore: 7 },
        { name: 'Revenue Growth', value: '15.2%', score: Math.min(6, Math.round(stock.growthScore * 0.24)), maxScore: 6 },
        { name: 'ROE', value: stock.roe?.toFixed(1) + '%' || 'N/A', score: Math.min(6, Math.round(stock.growthScore * 0.24)), maxScore: 6 },
        { name: 'Net Margin', value: '18.5%', score: Math.min(6, Math.round(stock.growthScore * 0.24)), maxScore: 6 },
      ],
    },
    {
      category: 'Momentum & Technicals',
      score: stock.momentumScore,
      maxScore: 15,
      percentage: Math.round((stock.momentumScore / 15) * 100),
      metrics: [
        { name: 'Price vs 50DMA', value: (stock.priceVs50dma?.toFixed(1) || '0') + '%', score: Math.min(4, Math.round(stock.momentumScore * 0.27)), maxScore: 4 },
        { name: 'Price vs 200DMA', value: (stock.priceVs200dma?.toFixed(1) || '0') + '%', score: Math.min(4, Math.round(stock.momentumScore * 0.27)), maxScore: 4 },
        { name: 'RSI (14)', value: stock.rsi14?.toFixed(1) || 'N/A', score: Math.min(4, Math.round(stock.momentumScore * 0.27)), maxScore: 4 },
        { name: 'Volume vs Avg', value: '50%', score: Math.min(3, Math.round(stock.momentumScore * 0.20)), maxScore: 3 },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{stock.symbol}</h1>
              <Badge className={`${getProgressColor(stock.totalScore, 100)} text-white text-lg px-3 py-1`}>
                {stock.totalScore}/100
              </Badge>
            </div>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">PKR {stock.closePrice.toLocaleString()}</div>
          <div className={`text-sm ${(stock.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(stock.change || 0) >= 0 ? '+' : ''}{stock.change || 0} ({stock.changePercent || 0}%)
          </div>
          <div className="flex items-center justify-end gap-2 text-sm mt-1">
            <span className="text-muted-foreground">Volume:</span>
            <span>{((stock.volume || 0) / 1000000).toFixed(2)}M</span>
          </div>
        </div>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scoreBreakdown.map((category) => (
          <Card key={category.category}>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">{category.category}</div>
              <div className={`text-2xl font-bold ${getScoreColor(category.score, category.maxScore)}`}>
                {category.score}/{category.maxScore}
              </div>
              <Progress 
                value={(category.score / category.maxScore) * 100} 
                className="mt-2 h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {category.percentage}% of max
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="chart">Price Chart</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>

        {/* Score Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          {scoreBreakdown.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                  <div className={`text-xl font-bold ${getScoreColor(category.score, category.maxScore)}`}>
                    {category.score} / {category.maxScore}
                  </div>
                </div>
                <Progress 
                  value={(category.score / category.maxScore) * 100}
                  className="h-2"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {category.metrics.map((metric) => (
                    <div key={metric.name} className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">{metric.name}</div>
                      <div className="font-semibold">{metric.value}</div>
                      <div className={`text-sm font-medium ${getScoreColor(metric.score, metric.maxScore)}`}>
                        {metric.score}/{metric.maxScore}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>5-Year Financial History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: number) => (value / 1000000).toFixed(0) + 'M'} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" />
                    <Bar yAxisId="left" dataKey="netIncome" name="Net Income" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Financial Metrics Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Year</th>
                      <th className="text-right py-2">Revenue (PKR M)</th>
                      <th className="text-right py-2">Net Income (PKR M)</th>
                      <th className="text-right py-2">EPS</th>
                      <th className="text-right py-2">ROE %</th>
                      <th className="text-right py-2">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financials.map((fin) => (
                      <tr key={fin.year} className="border-b">
                        <td className="py-2 font-medium">{fin.year}</td>
                        <td className="text-right">{(fin.revenue / 1000000).toFixed(0)}</td>
                        <td className="text-right">{(fin.netIncome / 1000000).toFixed(0)}</td>
                        <td className="text-right">{fin.eps.toFixed(2)}</td>
                        <td className="text-right">{fin.roe.toFixed(1)}%</td>
                        <td className="text-right">{fin.netMargin.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Chart Tab */}
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>90-Day Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip 
                      formatter={(value: number) => 'PKR ' + value.toFixed(2)}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Metrics Tab */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">P/E Ratio</span>
                </div>
                <div className="text-2xl font-bold">{stock.peRatio?.toFixed(2) || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">P/B Ratio</span>
                </div>
                <div className="text-2xl font-bold">{stock.pbRatio?.toFixed(2) || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">ROE</span>
                </div>
                <div className="text-2xl font-bold">{stock.roe?.toFixed(1) || 'N/A'}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Dividend Yield</span>
                </div>
                <div className="text-2xl font-bold">{stock.dividendYield?.toFixed(2) || 'N/A'}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">EPS Growth</span>
                </div>
                <div className={`text-2xl font-bold ${(stock.epsGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stock.epsGrowth || 0) >= 0 ? '+' : ''}{stock.epsGrowth?.toFixed(1) || 'N/A'}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Debt/Equity</span>
                </div>
                <div className="text-2xl font-bold">{stock.debtToEquity?.toFixed(2) || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">RSI (14)</span>
                </div>
                <div className="text-2xl font-bold">{stock.rsi14?.toFixed(1) || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">vs 50 DMA</span>
                </div>
                <div className={`text-2xl font-bold ${(stock.priceVs50dma || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stock.priceVs50dma || 0) >= 0 ? '+' : ''}{stock.priceVs50dma?.toFixed(1) || 'N/A'}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
