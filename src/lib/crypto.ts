export const portfolioData = {
  lastUpdated: "2025-11-09",
  totalInvestment: 1460,
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

type MarketDataResult = {
  data: Record<string, MarketSnapshot>;
  didError: boolean;
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
    roi: number;
    pnl: number;
  };
};

export type HoldingMetrics = PortfolioHolding & {
  currentPrice: number;
  athPrice?: number;
  imageUrl: string | null;
};

export type MarketPotentialAsset = {
  symbol: string;
  label: string;
  currentValue: number;
  potentialValue: number;
  additionalValue: number;
  upsidePercent: number;
  potentialRoi: number;
  potentialPnl: number;
  currentPnl: number;
  currentPrice: number;
  athPrice?: number;
  imageUrl: string | null;
};

export type MarketPotential = {
  potentialPortfolioValue: number;
  additionalValue: number;
  upsidePercent: number;
  topAssets: MarketPotentialAsset[];
};

export type CryptoTotals = {
  invested: number;
  currentValue: number;
  pnl: number;
  roi: number;
};

export type CryptoPageData = {
  portfolioData: typeof portfolioData;
  pieChartData: PieChartSlice[];
  totals: CryptoTotals;
  marketPotential: MarketPotential;
  didCoinGeckoFail: boolean;
};

const fetchMarketData = async (
  holdings: readonly PortfolioHolding[]
): Promise<MarketDataResult> => {
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
    return {
      data: {},
      didError: false,
    };
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

    const data = coins.reduce<Record<string, MarketSnapshot>>((acc, coin) => {
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

    return {
      data,
      didError: false,
    };
  } catch (error) {
    console.error("Error fetching market data from CoinGecko", error);
    return {
      data: {},
      didError: true,
    };
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
  priceData: Record<string, PriceResult>
): PieChartSlice[] =>
  holdings.map((holding) => {
    const data = priceData[holding.symbol];
    const fallbackValue = holding.amount * holding.avgPrice;
    const rawValue = data?.currentValue ?? fallbackValue;
    const sanitizedValue = Number.isFinite(rawValue) ? rawValue : fallbackValue;
    const roundedValue = Number(sanitizedValue.toFixed(2));

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
    const currentPrice = data?.currentPrice ?? holding.avgPrice;
    const athPrice = data?.athPrice;
    const imageUrl = snapshot?.imageUrl ?? null;

    return {
      ...holding,
      currentPrice,
      athPrice,
      imageUrl,
    };
  });

const buildMarketPotential = (
  holdings: readonly HoldingMetrics[],
  priceData: Record<string, PriceResult>
): MarketPotential => {
  const assets: MarketPotentialAsset[] = holdings.map((holding) => {
    const data = priceData[holding.symbol];
    const fallbackCurrentValue = holding.amount * holding.avgPrice;
    const currentValue = data?.currentValue ?? fallbackCurrentValue;
    const potentialValue = data?.potentialCurrentValue ?? currentValue;
    const additionalValue = Math.max(potentialValue - currentValue, 0);
    const upsidePercent =
      currentValue > 0 ? (additionalValue / currentValue) * 100 : 0;
    const potentialRoi = data?.potentialRoi ?? data?.roi ?? 0;
    const currentPrice = holding.currentPrice;
    const athPrice = holding.athPrice ?? data?.athPrice;
    const costBasis = holding.amount * holding.avgPrice;
    const potentialPnl =
      data?.potentialPnl ??
      potentialValue - (Number.isFinite(costBasis) ? costBasis : 0);
    const currentPnl =
      data?.pnl ?? currentValue - (Number.isFinite(costBasis) ? costBasis : 0);

    return {
      symbol: holding.symbol,
      label: holding.name,
      currentValue,
      potentialValue,
      additionalValue,
      upsidePercent,
      potentialRoi,
      potentialPnl,
      currentPnl,
      currentPrice,
      athPrice,
      imageUrl: holding.imageUrl ?? null,
    };
  });

  const potentialPortfolioValue = assets.reduce(
    (sum, asset) => sum + asset.potentialValue,
    0
  );
  const currentPortfolioValue = assets.reduce(
    (sum, asset) => sum + asset.currentValue,
    0
  );
  const additionalValue = Math.max(
    potentialPortfolioValue - currentPortfolioValue,
    0
  );
  const upsidePercent =
    currentPortfolioValue > 0
      ? (additionalValue / currentPortfolioValue) * 100
      : 0;

  const topAssets = assets
    .filter((asset) => asset.additionalValue > 0)
    .sort((a, b) => b.upsidePercent - a.upsidePercent);

  return {
    potentialPortfolioValue,
    additionalValue,
    upsidePercent,
    topAssets,
  };
};

export const loadCryptoPageData = async (): Promise<CryptoPageData> => {
  const { data: marketData, didError: didCoinGeckoFail } = await fetchMarketData(
    portfolioData.holdings
  );
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

  const pieChartData = buildPieChartData(portfolioData.holdings, priceData);
  const holdingsWithMetrics = buildHoldingsWithMetrics(
    portfolioData.holdings,
    priceData,
    marketData
  );
  const marketPotential = buildMarketPotential(holdingsWithMetrics, priceData);

  return {
    portfolioData,
    pieChartData,
    totals: {
      invested: totalInvested,
      currentValue: totalCurrentValue,
      pnl: totalPnL,
      roi: totalROI,
    },
    marketPotential,
    didCoinGeckoFail,
  };
};
