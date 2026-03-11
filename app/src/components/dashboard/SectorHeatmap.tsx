import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { SectorPerformance } from '@/services/api';

interface SectorHeatmapProps {
  sectors: SectorPerformance[];
  loading?: boolean;
}

// Sector colors mapping
const sectorColors: Record<string, string> = {
  'Oil & Gas Exploration': '#ef4444',
  'Oil & Gas Marketing': '#f97316',
  'Power Generation': '#06b6d4',
  'Power Generation & Distribution': '#06b6d4',
  'Power Distribution': '#06b6d4',
  'Cement': '#f59e0b',
  'Fertilizer': '#22c55e',
  'Commercial Banking': '#3b82f6',
  'Banking': '#3b82f6',
  'Technology': '#8b5cf6',
  'Telecommunication': '#6366f1',
  'Automobile Assembler': '#14b8a6',
  'Auto Parts': '#10b981',
  'Textile Spinning': '#ec4899',
  'Textile Composite': '#d946ef',
  'Textile Weaving': '#f43f5e',
  'Pharmaceutical': '#84cc16',
  'Chemical': '#a3e635',
  'Food & Personal Care': '#fbbf24',
  'Tobacco': '#78716c',
  'Paper & Board': '#a8a29e',
  'Glass & Ceramics': '#9ca3af',
  'Sugar': '#fca5a5',
  'Engineering': '#fdba74',
  'Cables & Electrical': '#fcd34d',
  'Insurance': '#86efac',
  'Modaraba': '#67e8f9',
  'REIT': '#c4b5fd',
  'Property': '#d8b4fe',
  'Refinery': '#fda4af',
  'Synthetic & Rayon': '#fed7aa',
  'Woollen': '#e9d5ff',
  'Exchange': '#bfdbfe',
  'Port & Terminal': '#c7d2fe',
  'Shipping': '#ddd6fe',
  'Airlines': '#fce7f3',
  'Investment Bank': '#fecdd3',
  'Leasing': '#fde68a',
  'Other': '#6b7280',
};

export function SectorHeatmap({ sectors, loading }: SectorHeatmapProps) {
  const getSectorColor = (sector: string) => {
    return sectorColors[sector] || '#6b7280';
  };

  if (loading && sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate relative sizes based on stock count
  const maxCount = Math.max(...sectors.map(s => s.stockCount), 1);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Sector Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average Smart Score by sector
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sectors.map((sector) => {
            const relativeSize = 0.6 + (sector.stockCount / maxCount) * 0.4;
            const sectorColor = getSectorColor(sector.sector);
            return (
              <div
                key={sector.sector}
                className={`
                  rounded-lg p-3 cursor-pointer transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  flex flex-col justify-between
                `}
                style={{ 
                  minHeight: `${80 * relativeSize}px`,
                  backgroundColor: sectorColor,
                  opacity: 0.85 + (sector.avgScore / 1000)
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm leading-tight text-white">
                    {sector.sector}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs text-white bg-white/20"
                  >
                    {sector.stockCount}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-white">
                    {sector.avgScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-white/80">
                    Avg Score
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">Score Legend</div>
          <div className="flex flex-wrap gap-1">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-[10px]">80+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-400" />
              <span className="text-[10px]">70-79</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-400" />
              <span className="text-[10px]">60-69</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-400" />
              <span className="text-[10px]">50-59</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-400" />
              <span className="text-[10px]">40-49</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span className="text-[10px]">&lt;40</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
