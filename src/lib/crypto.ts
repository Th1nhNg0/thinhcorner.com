export const portfolioData = {
  totalInvestment: 1460,
  assets: 4,
  dailyBuyAmount: 5,
  holdings: [
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.01023962,
      avgPrice: 102685,
      allocation: 70,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 0.07948071,
      avgPrice: 2686,
      allocation: 13,
    },
    {
      symbol: "BNB",
      name: "BNB",
      amount: 0.23229521,
      avgPrice: 727,
      allocation: 12,
    },
    {
      symbol: "SOL",
      name: "Solana",
      amount: 0.13551047,
      avgPrice: 161,
      allocation: 5,
    },
  ],
} as const;

export type PortfolioHolding = (typeof portfolioData.holdings)[number];

const coingeckoIdMap = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
} as const;

const coingeckoIdToSymbolMap = Object.fromEntries(
  Object.entries(coingeckoIdMap).map(([symbol, id]) => [id, symbol])
) as Record<string, keyof typeof coingeckoIdMap>;

type MarketSnapshot = {
  currentPrice: number;
  athPrice?: number;
  imageUrl?: string | null;
};

export type PriceResult = {
  symbol: string;
  currentPrice: number;
  athPrice?: number;
  potentialCurrentValue?: number;
  potentialPnl?: number;
  potentialRoi?: number;
  currentValue: number;
  pnl: number;
  roi: number;
  loading: boolean;
  error: string | null;
};

export type PieChartSlice = {
  name: string;
  value: number;
  itemStyle: {
    color: string;
  };
  meta: {
    label: string;
    amount: number;
    allocationTarget: number;
    avgPrice: number;
    dailyDca: number;
    roi: number;
    pnl: number;
  };
};

export type HoldingMetrics = PortfolioHolding & {
  currentPrice: number;
  currentValue: number;
  pnl: number;
  roi: number;
  athPrice?: number;
  discountFromAth?: number;
  imageUrl: string | null;
};

export type GoalStats = {
  longTermGoal: number;
  totalCurrentValue: number;
  goalProgressPercent: number;
  remainingToGoal: number;
  monthlyContribution: number;
  yearlyContribution: number;
  projectedYearEndValue: number;
  daysInvested: number;
};

export type CryptoTotals = {
  invested: number;
  currentValue: number;
  pnl: number;
  roi: number;
};

export type CryptoPageData = {
  portfolioData: typeof portfolioData;
  priceData: Record<string, PriceResult>;
  pieChartData: PieChartSlice[];
  holdingsWithMetrics: HoldingMetrics[];
  opportunityList: HoldingMetrics[];
  totals: CryptoTotals;
  goalStats: GoalStats;
};

const fetchMarketData = async (
  holdings: readonly PortfolioHolding[]
): Promise<Record<string, MarketSnapshot>> => {
  const ids = Array.from(
    new Set(
      holdings
        .map(
          (holding) =>
            coingeckoIdMap[holding.symbol as keyof typeof coingeckoIdMap]
        )
        .filter(Boolean)
    )
  );

  if (!ids.length) {
    return {};
  }

  const searchParams = new URLSearchParams({
    vs_currency: "usd",
    ids: ids.join(","),
    price_change_percentage: "24h",
    precision: "full",
  });

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?${searchParams.toString()}`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const coins = (await response.json()) as Array<{
      id: string;
      symbol: string;
      image: string | null;
      current_price: number | null;
      ath: number | null;
    }>;

    return coins.reduce<Record<string, MarketSnapshot>>((acc, coin) => {
      const symbol =
        coingeckoIdToSymbolMap[coin.id] ??
        coin.symbol?.toUpperCase() ??
        coin.id.toUpperCase();

      acc[symbol] = {
        currentPrice: Number(coin.current_price ?? 0),
        athPrice:
          typeof coin.ath === "number" && Number.isFinite(coin.ath)
            ? Number(coin.ath)
            : undefined,
        imageUrl:
          typeof coin.image === "string" && coin.image.length > 0
            ? coin.image
            : undefined,
      };

      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching market data from CoinGecko", error);
    return {};
  }
};

const buildPriceData = (
  holdings: readonly PortfolioHolding[],
  marketData: Record<string, MarketSnapshot>
): PriceResult[] =>
  holdings.map((holding) => {
    const snapshot = marketData[holding.symbol];
    const currentPrice = snapshot?.currentPrice ?? 0;
    const athPrice = snapshot?.athPrice;
    const currentValue = holding.amount * currentPrice;
    const pnl = currentValue - holding.amount * holding.avgPrice;
    const roi = (pnl / (holding.amount * holding.avgPrice)) * 100;

    let potentialCurrentValue: number | undefined;
    let potentialPnl: number | undefined;
    let potentialRoi: number | undefined;

    if (athPrice && athPrice > 0) {
      potentialCurrentValue = holding.amount * athPrice;
      potentialPnl = potentialCurrentValue - holding.amount * holding.avgPrice;
      potentialRoi = (potentialPnl / (holding.amount * holding.avgPrice)) * 100;
    }

    return {
      symbol: holding.symbol,
      currentPrice,
      athPrice,
      potentialCurrentValue,
      potentialPnl,
      potentialRoi,
      currentValue,
      pnl,
      roi,
      loading: false,
      error: null,
    };
  });

const pieChartColorMap = {
  BTC: "#F97316",
  ETH: "#60A5FA",
  BNB: "#EAB308",
  SOL: "#A855F7",
} as const;

const buildPieChartData = (
  holdings: readonly PortfolioHolding[],
  priceData: Record<string, PriceResult>,
  dailyBuyAmount: number
): PieChartSlice[] =>
  holdings.map((holding) => {
    const data = priceData[holding.symbol];
    const fallbackValue = holding.amount * holding.avgPrice;
    const rawValue = data?.currentValue ?? fallbackValue;
    const sanitizedValue = Number.isFinite(rawValue) ? rawValue : fallbackValue;
    const roundedValue = Number(sanitizedValue.toFixed(2));
    const dailyDca = (dailyBuyAmount * holding.allocation) / 100 || 0;

    const invested = holding.amount * holding.avgPrice;
    const pnl = roundedValue - invested;
    const roi = invested > 0 ? (pnl / invested) * 100 : 0;

    return {
      name: holding.symbol,
      value: roundedValue,
      itemStyle: {
        color:
          pieChartColorMap[holding.symbol as keyof typeof pieChartColorMap] ??
          "#F97316",
      },
      meta: {
        label: holding.name,
        amount: holding.amount,
        allocationTarget: holding.allocation,
        avgPrice: holding.avgPrice,
        dailyDca,
        roi,
        pnl,
      },
    };
  });

const buildHoldingsWithMetrics = (
  holdings: readonly PortfolioHolding[],
  priceData: Record<string, PriceResult>,
  marketData: Record<string, MarketSnapshot>
): HoldingMetrics[] =>
  holdings.map((holding) => {
    const data = priceData[holding.symbol];
    const snapshot = marketData[holding.symbol];
    const costBasis = holding.amount * holding.avgPrice;
    const currentPrice = data?.currentPrice ?? holding.avgPrice;
    const currentValue = data?.currentValue ?? costBasis;
    const pnl = data?.pnl ?? currentValue - costBasis;
    const roi = data?.roi ?? (costBasis > 0 ? (pnl / costBasis) * 100 : 0);
    const athPrice = data?.athPrice;
    const discountFromAth =
      athPrice && athPrice > 0
        ? ((athPrice - currentPrice) / athPrice) * 100
        : undefined;
    const imageUrl = snapshot?.imageUrl ?? null;

    return {
      ...holding,
      currentPrice,
      currentValue,
      pnl,
      roi,
      athPrice,
      discountFromAth,
      imageUrl,
    };
  });

const buildOpportunityList = (holdings: HoldingMetrics[]) => {
  const candidates = holdings.filter(
    (asset) => typeof asset.discountFromAth === "number"
  );
  const source = candidates.length ? candidates : holdings;

  return source
    .slice()
    .sort((a, b) => (b.discountFromAth ?? 0) - (a.discountFromAth ?? 0))
    .slice(0, 4);
};

const buildGoalStats = (
  dailyBuyAmount: number,
  totalCurrentValue: number
): GoalStats => {
  const strategyStartDate = new Date("2025-01-01");
  const now = new Date();
  const daysInvested = Math.max(
    0,
    Math.floor(
      (now.getTime() - strategyStartDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const monthlyContribution = dailyBuyAmount * 30;
  const yearlyContribution = dailyBuyAmount * 365;
  const projectedYearEndValue = totalCurrentValue + yearlyContribution;
  const longTermGoal = 25000;
  const goalProgress = Math.min(totalCurrentValue / longTermGoal, 1);
  const remainingToGoal = Math.max(longTermGoal - totalCurrentValue, 0);
  const goalProgressPercent = goalProgress * 100;

  return {
    longTermGoal,
    totalCurrentValue,
    goalProgressPercent,
    remainingToGoal,
    monthlyContribution,
    yearlyContribution,
    projectedYearEndValue,
    daysInvested,
  };
};

export const loadCryptoPageData = async (): Promise<CryptoPageData> => {
  const marketData = await fetchMarketData(portfolioData.holdings);
  const priceResults = buildPriceData(portfolioData.holdings, marketData);
  const priceData = Object.fromEntries(
    priceResults.map((result) => [result.symbol, result])
  );

  const totalInvested = portfolioData.totalInvestment;
  const totalCurrentValue = portfolioData.holdings.reduce((sum, holding) => {
    const data = priceData[holding.symbol];
    return sum + (data?.currentValue ?? holding.amount * holding.avgPrice);
  }, 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const pieChartData = buildPieChartData(
    portfolioData.holdings,
    priceData,
    portfolioData.dailyBuyAmount
  );
  const holdingsWithMetrics = buildHoldingsWithMetrics(
    portfolioData.holdings,
    priceData,
    marketData
  );
  const opportunityList = buildOpportunityList(holdingsWithMetrics);
  const goalStats = buildGoalStats(
    portfolioData.dailyBuyAmount,
    totalCurrentValue
  );

  return {
    portfolioData,
    priceData,
    pieChartData,
    holdingsWithMetrics,
    opportunityList,
    totals: {
      invested: totalInvested,
      currentValue: totalCurrentValue,
      pnl: totalPnL,
      roi: totalROI,
    },
    goalStats,
  };
};
