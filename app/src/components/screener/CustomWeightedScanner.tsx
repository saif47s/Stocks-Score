import { useState, useEffect, useCallback } from 'react';
import { Sliders, Search, RefreshCw, Trophy, Shield, Zap, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api, type Stock } from '@/services/api';

interface CustomWeightedScannerProps {
    onStockClick: (symbol: string) => void;
}

export function CustomWeightedScanner({ onStockClick }: CustomWeightedScannerProps) {
    const [weights, setWeights] = useState({
        value: 25,
        health: 25,
        growth: 25,
        momentum: 25
    });

    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomScan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.scanStocks({
                value: weights.value / 100,
                health: weights.health / 100,
                growth: weights.growth / 100,
                momentum: weights.momentum / 100
            });
            if (res.success) {
                setStocks(res.data.slice(0, 20)); // Show top 20
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Scan failed');
        } finally {
            setLoading(false);
        }
    }, [weights]);

    useEffect(() => {
        const timer = setTimeout(fetchCustomScan, 500); // Debounce
        return () => clearTimeout(timer);
    }, [fetchCustomScan]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getSignalColor = (signal?: string) => {
        switch (signal) {
            case 'STRONG BUY': return 'bg-emerald-600';
            case 'ACCUMULATE': return 'bg-blue-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Sliders className="w-6 h-6 text-primary" />
                                Custom Weighted Scanner
                            </CardTitle>
                            <CardDescription>
                                Define your own investment priorities by adjusting the weights below.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="border-primary/50 text-primary">
                            Institutional Engine Active
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Value Weight */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-semibold">Value (Sasta/Mehnga)</span>
                                </div>
                                <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">{weights.value}%</span>
                            </div>
                            <Slider
                                value={[weights.value]}
                                onValueChange={([v]) => setWeights({ ...weights, value: v })}
                                max={100}
                                step={5}
                            />
                            <p className="text-[10px] text-muted-foreground">Focuses on P/E, P/B and Asset Value.</p>
                        </div>

                        {/* Health Weight */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-semibold">Health (Financials)</span>
                                </div>
                                <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">{weights.health}%</span>
                            </div>
                            <Slider
                                value={[weights.health]}
                                onValueChange={([v]) => setWeights({ ...weights, health: v })}
                                max={100}
                                step={5}
                            />
                            <p className="text-[10px] text-muted-foreground">Altman Z-Score and Debt ratios priority.</p>
                        </div>

                        {/* Growth Weight */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-semibold">Growth (ROE/EPS)</span>
                                </div>
                                <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">{weights.growth}%</span>
                            </div>
                            <Slider
                                value={[weights.growth]}
                                onValueChange={([v]) => setWeights({ ...weights, growth: v })}
                                max={100}
                                step={5}
                            />
                            <p className="text-[10px] text-muted-foreground">Piotroski F-Score and Profit Growth.</p>
                        </div>

                        {/* Momentum Weight */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-semibold">Momentum (Speed)</span>
                                </div>
                                <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">{weights.momentum}%</span>
                            </div>
                            <Slider
                                value={[weights.momentum]}
                                onValueChange={([v]) => setWeights({ ...weights, momentum: v })}
                                max={100}
                                step={5}
                            />
                            <p className="text-[10px] text-muted-foreground">Price movement and Volume trends.</p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-muted/30 rounded-lg flex items-center justify-between border">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <span className="text-sm">Total Weightage: <span className={weights.value + weights.health + weights.growth + weights.momentum === 100 ? 'text-green-600 font-bold' : 'text-orange-600'}>{weights.value + weights.health + weights.growth + weights.momentum}%</span></span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setWeights({ value: 25, health: 25, growth: 25, momentum: 25 })}>
                            Reset to Neutral
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Top Matching Picks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Master Signal</TableHead>
                                <TableHead className="text-center">Custom Score</TableHead>
                                <TableHead className="text-center">Z-Risk</TableHead>
                                <TableHead className="text-center">Quality (F)</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                stocks.map((stock) => (
                                    <TableRow
                                        key={stock.symbol}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => onStockClick(stock.symbol)}
                                    >
                                        <TableCell className="font-bold">{stock.symbol}</TableCell>
                                        <TableCell>
                                            {stock.masterSignal && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge className={`${getSignalColor(stock.masterSignal.signal)} text-white font-bold border-none`}>
                                                                {stock.masterSignal.signal}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">{stock.masterSignal.description}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`${getScoreColor(stock.totalScore)} text-white`}>
                                                {stock.totalScore}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`text-xs font-bold ${stock.zScore?.zone === 'Safe' ? 'text-green-600' : 'text-red-500'}`}>
                                                {stock.zScore?.score}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-xs font-bold">{stock.fScore?.score}/9</span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">PKR {stock.closePrice.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Details</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
