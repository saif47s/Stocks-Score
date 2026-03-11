/**
 * Financial Engines for Agent_PSX
 * Implements Altman Z-Score, Piotroski F-Score, and Magic Formula.
 */

export class FinancialEngine {
    /**
     * Altman Z-Score Calculation (Bankruptcy Risk)
     * Formula: Z = 1.2A + 1.4B + 3.3C + 0.6D + 1.0E
     */
    static calculateAltmanZScore(data) {
        const {
            workingCapital, totalAssets, retainedEarnings,
            ebit, marketValueEquity, totalLiabilities, sales
        } = data;

        if (!totalAssets || totalAssets === 0) return 0;

        const A = workingCapital / totalAssets;
        const B = retainedEarnings / totalAssets;
        const C = ebit / totalAssets;
        const D = marketValueEquity / totalLiabilities;
        const E = sales / totalAssets;

        const zScore = (1.2 * A) + (1.4 * B) + (3.3 * C) + (0.6 * D) + (1.0 * E);

        return {
            score: Math.round(zScore * 100) / 100,
            zone: zScore > 2.99 ? 'Safe' : (zScore > 1.81 ? 'Grey' : 'Distress'),
            risk: zScore < 1.81 ? 'High' : 'Low'
        };
    }

    /**
     * Piotroski F-Score (0-9 Score for fundamental strength)
     */
    static calculatePiotroskiFScore(metrics) {
        let fScore = 0;

        // 1. Profitability
        if (metrics.netIncome > 0) fScore++;
        if (metrics.roa > 0) fScore++;
        if (metrics.operatingCashFlow > 0) fScore++;
        if (metrics.operatingCashFlow > metrics.netIncome) fScore++;

        // 2. Leverage, Liquidity, and Source of Funds
        if (metrics.longTermDebtRatio < metrics.prevLongTermDebtRatio) fScore++;
        if (metrics.currentRatio > metrics.prevCurrentRatio) fScore++;
        if (metrics.sharesOutstanding <= metrics.prevSharesOutstanding) fScore++;

        // 3. Operating Efficiency
        if (metrics.grossMargin > metrics.prevGrossMargin) fScore++;
        if (metrics.assetTurnover > metrics.prevAssetTurnover) fScore++;

        return {
            score: fScore,
            rating: fScore >= 8 ? 'Bulletproof' : (fScore >= 5 ? 'Steady' : 'Weak')
        };
    }

    /**
     * EV/EBITDA Calculation
     */
    static calculateEVtoEBITDA(marketCap, totalDebt, cash, ebitda) {
        const enterpriseValue = marketCap + totalDebt - cash;
        return ebitda > 0 ? enterpriseValue / ebitda : 999; // 999 as placeholder for "Too high/Negative"
    }

    /**
     * ROIC Calculation (Return on Invested Capital)
     */
    static calculateROIC(nopat, totalAssets, currentLiabilities) {
        const investedCapital = totalAssets - currentLiabilities;
        return investedCapital > 0 ? nopat / investedCapital : 0;
    }

    /**
     * Master "Strong Buy" Signal
     * Formula: High F-Score + Low EV/EBITDA + High ROIC
     */
    static calculateMasterSignal(fScore, evEbitda, roic) {
        // Score based on F-Score (0-9)
        const fScoreWeight = (fScore / 9) * 40; // 40% weight

        // Score based on EV/EBITDA (Lower is better, typically < 10 is good)
        const valuationWeight = evEbitda < 10 ? 30 : (evEbitda < 15 ? 15 : 0); // 30% weight

        // Score based on ROIC (Higher is better, typically > 15% is great)
        const qualityWeight = roic > 0.15 ? 30 : (roic > 0.08 ? 15 : 0); // 30% weight

        const totalSignal = fScoreWeight + valuationWeight + qualityWeight;

        return {
            signal: totalSignal >= 80 ? 'STRONG BUY' : (totalSignal >= 60 ? 'ACCUMULATE' : 'HOLD'),
            strength: Math.round(totalSignal),
            description: `Quality: ${Math.round(roic * 100)}% ROIC, Valuation: ${Math.round(evEbitda)} EV/EBITDA, F-Score: ${fScore}/9`
        };
    }
}
