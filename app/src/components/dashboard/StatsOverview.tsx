import { Trophy, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MarketOverview } from '@/services/api';

interface StatsOverviewProps {
  overview: MarketOverview;
  totalStocks: number;
  loading?: boolean;
}

export function StatsOverview({ overview, totalStocks, loading }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'High Score Stocks',
      value: overview.highScoreStocks,
      subtitle: 'Score ≥ 80',
      icon: Trophy,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      percentage: Math.round((overview.highScoreStocks / totalStocks) * 100),
    },
    {
      title: 'Low Score Stocks',
      value: overview.lowScoreStocks,
      subtitle: 'Score < 40',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      percentage: Math.round((overview.lowScoreStocks / totalStocks) * 100),
    },
    {
      title: 'Market Avg Score',
      value: overview.avgSmartScore,
      subtitle: 'Out of 100',
      icon: BarChart3,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      percentage: overview.avgSmartScore,
    },
    {
      title: 'Total Coverage',
      value: totalStocks,
      subtitle: 'PSX Stocks',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      percentage: 100,
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                    <span className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stat.color.replace('text', 'bg')} rounded-full transition-all duration-500`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{stat.percentage}%</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
