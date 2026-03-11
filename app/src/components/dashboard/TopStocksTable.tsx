import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Stock } from '@/services/api';

interface TopStocksTableProps {
  stocks: Stock[];
  onStockClick: (symbol: string) => void;
  loading?: boolean;
}

export function TopStocksTable({ stocks, onStockClick, loading }: TopStocksTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading && stocks.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Top 10 Smart Score Stocks
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Highest combined fundamental scores in the market
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Live Data
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right">Price (PKR)</TableHead>
              <TableHead className="text-center">Z-Score (Risk)</TableHead>
              <TableHead className="text-center">F-Score (Quality)</TableHead>
              <TableHead className="text-center">Smart Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock, index) => (
              <TableRow
                key={stock.symbol}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onStockClick(stock.symbol)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">{stock.name}</div>
                    </div>
                    {stock.isSuspicious && (
                      <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase">Suspicious</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                    {stock.sector}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {stock.closePrice.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {stock.zScore && (
                    <div className="flex flex-col items-center">
                      <span className={`text-[11px] font-bold ${stock.zScore.zone === 'Safe' ? 'text-green-500' : stock.zScore.zone === 'Grey' ? 'text-yellow-500' : 'text-red-500'}`}>
                        {stock.zScore.score}
                      </span>
                      <span className="text-[8px] uppercase font-medium opacity-70">{stock.zScore.zone}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {stock.fScore && (
                    <div className="flex flex-col items-center">
                      <span className={`text-[11px] font-bold ${stock.fScore.rating === 'Bulletproof' ? 'text-green-500' : stock.fScore.rating === 'Steady' ? 'text-blue-500' : 'text-red-500'}`}>
                        {stock.fScore.score}/9
                      </span>
                      <span className="text-[8px] uppercase font-medium opacity-70">{stock.fScore.rating}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`${getScoreColor(stock.totalScore)} text-white text-[11px] px-2 py-0.5 font-bold`}
                  >
                    {stock.totalScore}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStockClick(stock.symbol);
                    }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
