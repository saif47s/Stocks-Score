import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MarketOverview } from '@/services/api';

interface MarketTrendIndicatorProps {
  overview: MarketOverview;
}

export function MarketTrendIndicator({ overview }: MarketTrendIndicatorProps) {
  const { marketSentiment, avgSmartScore, kse100Index, kse100Change } = overview;
  
  const getSentimentConfig = () => {
    switch (marketSentiment) {
      case 'bullish':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          label: 'Bullish Market',
          description: 'Strong fundamentals across sectors',
        };
      case 'bearish':
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          label: 'Bearish Market',
          description: 'Weak fundamentals, exercise caution',
        };
      default:
        return {
          icon: Minus,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          label: 'Neutral Market',
          description: 'Mixed signals, balanced outlook',
        };
    }
  };
  
  const config = getSentimentConfig();
  const Icon = config.icon;
  
  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Market Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${config.bgColor}`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${config.color}`}>
              {config.label}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{avgSmartScore}</div>
            <div className="text-xs text-muted-foreground">Avg Smart Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{kse100Index?.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">KSE-100 Index</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${(kse100Change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(kse100Change || 0) >= 0 ? '+' : ''}{kse100Change}%
            </div>
            <div className="text-xs text-muted-foreground">Daily Change</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
