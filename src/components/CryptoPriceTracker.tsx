import { useEffect, useState } from "react";

// Import crypto icons
import BitcoinIcon from "@/assets/crypto-icon/bitcoin-btc-logo.svg";
import BnbIcon from "@/assets/crypto-icon/bnb-bnb-logo.svg";
import EthereumIcon from "@/assets/crypto-icon/ethereum-eth-logo.svg";
import SolanaIcon from "@/assets/crypto-icon/solana-sol-logo.svg";

interface CryptoHolding {
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
  allocation: number;
}

interface PortfolioData {
  totalInvestment: number;
  assets: number;
  dailyBuyAmount: number;
  holdings: CryptoHolding[];
}

interface PriceData {
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
}

interface Props {
  portfolioData: PortfolioData;
}

export default function CryptoPriceTracker({ portfolioData }: Props) {
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Add icon mapping for each crypto
  const getIconForSymbol = (symbol: string) => {
    const iconMap = {
      BTC: BitcoinIcon,
      ETH: EthereumIcon,
      BNB: BnbIcon,
      SOL: SolanaIcon,
    };
    return iconMap[symbol as keyof typeof iconMap] || BitcoinIcon;
  };

  // Add color mapping for each crypto
  const getColorForSymbol = (symbol: string) => {
    const colorMap = {
      BTC: "orange",
      ETH: "blue",
      BNB: "yellow",
      SOL: "purple",
    };
    return colorMap[symbol as keyof typeof colorMap] || "orange";
  };

  // Note: ATH will be fetched from cryptoprices.cc by appending /ATH/ to the symbol URL

  const fetchPrice = async (symbol: string): Promise<number> => {
    try {
      const response = await fetch(`https://cryptoprices.cc/${symbol}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const priceText = await response.text();
      return parseFloat(priceText.trim());
    } catch (error) {
      console.error(`Error fetching ${symbol} price:`, error);
      throw error;
    }
  };

  const updatePrices = async () => {
    const newPriceData: Record<string, PriceData> = {};

    for (const holding of portfolioData.holdings) {
      newPriceData[holding.symbol] = {
        ...priceData[holding.symbol],
        loading: true,
        error: null,
      };
    }
    setPriceData(newPriceData);

    for (const holding of portfolioData.holdings) {
      try {
        const currentPrice = await fetchPrice(holding.symbol);
        // Fetch ATH from cryptoprices.cc by appending /ATH/ to the symbol URL
        let athPrice: number | undefined = undefined;
        try {
          const resAth = await fetch(
            `https://cryptoprices.cc/${holding.symbol}/ATH/`
          );
          if (resAth.ok) {
            const athText = await resAth.text();
            athPrice = parseFloat(athText.trim());
          }
        } catch (e) {
          console.warn(`Failed to fetch ATH for ${holding.symbol}`, e);
        }
        const currentValue = holding.amount * currentPrice;
        const pnl = currentValue - holding.amount * holding.avgPrice;
        const roi = (pnl / (holding.amount * holding.avgPrice)) * 100;

        let potentialCurrentValue: number | undefined = undefined;
        let potentialPnl: number | undefined = undefined;
        let potentialRoi: number | undefined = undefined;
        if (athPrice && athPrice > 0) {
          potentialCurrentValue = holding.amount * athPrice;
          potentialPnl =
            potentialCurrentValue - holding.amount * holding.avgPrice;
          potentialRoi =
            (potentialPnl / (holding.amount * holding.avgPrice)) * 100;
        }

        newPriceData[holding.symbol] = {
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
      } catch (error) {
        newPriceData[holding.symbol] = {
          currentPrice: 0,
          athPrice: undefined,
          potentialCurrentValue: undefined,
          potentialPnl: undefined,
          potentialRoi: undefined,
          currentValue: 0,
          pnl: 0,
          roi: 0,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    setPriceData(newPriceData);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    // Fetch prices once on mount. No automatic refresh.
    updatePrices();
  }, []);

  const totalInvested = portfolioData.holdings.reduce(
    (sum: number, holding: CryptoHolding) =>
      sum + holding.amount * holding.avgPrice,
    0
  );
  const totalCurrentValue = portfolioData.holdings.reduce(
    (sum: number, holding: CryptoHolding) => {
      const data = priceData[holding.symbol];
      return sum + (data?.currentValue || holding.amount * holding.avgPrice);
    },
    0
  );
  const totalPnL = totalCurrentValue - totalInvested;
  const totalROI = (totalPnL / totalInvested) * 100;

  const isUpdating = Object.values(priceData).some((d) => d?.loading);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCurrencyWhole = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      orange: {
        bg: "from-orange-900/20 to-zinc-900/80",
        border: "border-orange-500/20 hover:border-orange-500/50",
        text: "text-orange-400",
        accent: "bg-orange-500",
      },
      blue: {
        bg: "from-blue-900/20 to-zinc-900/80",
        border: "border-blue-500/20 hover:border-blue-500/50",
        text: "text-blue-400",
        accent: "bg-blue-500",
      },
      yellow: {
        bg: "from-yellow-900/20 to-zinc-900/80",
        border: "border-yellow-500/20 hover:border-yellow-500/50",
        text: "text-yellow-400",
        accent: "bg-yellow-500",
      },
      purple: {
        bg: "from-purple-900/20 to-zinc-900/80",
        border: "border-purple-500/20 hover:border-purple-500/50",
        text: "text-purple-400",
        accent: "bg-purple-500",
      },
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  return (
    <div className="space-y-6">
      {/* Combined Portfolio Performance & Overview */}
      <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-2 md:p-6">
        <div className="flex items-center mb-6">
          <h3 className="text-3xl font-bold font-heading">
            Portfolio Performance
          </h3>
        </div>

        {/* Portfolio metrics in a responsive grid */}
        <div className="grid grid-cols-2 md:grid-cols-3  gap-4">
          <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400 mb-1">Current Value</p>
            {isUpdating ? (
              <div className="mx-auto h-8 w-36 rounded bg-zinc-700/60 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalCurrentValue)}
              </p>
            )}
            <p className="text-xs text-zinc-500 mt-1">Live market value</p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400 mb-1">Total P&L</p>
            {isUpdating ? (
              <div className="mx-auto h-8 w-28 rounded bg-zinc-700/60 animate-pulse" />
            ) : (
              <p
                className={`text-2xl font-bold ${
                  totalPnL >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(totalPnL)}
              </p>
            )}
            <p className="text-xs text-zinc-500 mt-1">Profit & Loss</p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400 mb-1">Total ROI</p>
            {isUpdating ? (
              <div className="mx-auto h-8 w-20 rounded bg-zinc-700/60 animate-pulse" />
            ) : (
              <p
                className={`text-2xl font-bold ${
                  totalROI >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatPercentage(totalROI)}
              </p>
            )}
            <p className="text-xs text-zinc-500 mt-1">Return on investment</p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400 mb-1">Total Investment</p>
            <p className="text-xl font-bold text-white">
              ${portfolioData.totalInvestment}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Since January 2025</p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400 mb-1">Daily DCA</p>
            <p className="text-xl font-bold text-white">
              ${portfolioData.dailyBuyAmount}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Automated investing</p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400 mb-1">Assets</p>
            <p className="text-xl font-bold text-white">
              {portfolioData.assets}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Diversified portfolio</p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="mt-6 bg-zinc-900/30 rounded-xl shadow-sm ring-1 ring-white/5">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="pl-4 text-left p-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="text-right p-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="text-right p-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-right p-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="text-right p-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="pr-4 text-right p-2 text-sm font-semibold text-purple-400 uppercase tracking-wider">
                    ATH Price
                  </th>
                  <th className="text-right p-2 text-sm font-semibold text-purple-400 uppercase tracking-wider">
                    Potential PNL
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-zinc-700/30">
                {portfolioData.holdings.map(
                  (holding: CryptoHolding, index: number) => {
                    const data = priceData[holding.symbol];
                    const color = getColorForSymbol(holding.symbol);
                    const colors = getColorClasses(color);
                    const icon = getIconForSymbol(holding.symbol);

                    return (
                      <tr
                        key={holding.symbol}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Asset Info */}
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img
                                src={icon.src}
                                alt={holding.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${colors.text}`}>
                                {holding.name}
                              </p>
                              <p className="text-sm text-zinc-400">
                                {holding.symbol}
                              </p>
                              <p
                                className="text-xs text-zinc-500"
                                title={`Allocation: ${
                                  holding.allocation
                                }% of daily DCA budget (${(
                                  (portfolioData.dailyBuyAmount *
                                    holding.allocation) /
                                  100
                                ).toFixed(2)}/day)`}
                              >
                                {holding.allocation}% ($
                                {(
                                  (portfolioData.dailyBuyAmount *
                                    holding.allocation) /
                                  100
                                ).toFixed(2)}
                                )
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* P&L / ROI Combined */}
                        <td className="p-2 text-right">
                          {data?.loading ? (
                            <div className="animate-pulse">
                              <div className="h-5 bg-zinc-600 rounded w-12 ml-auto mb-1"></div>
                              <div className="h-4 bg-zinc-600 rounded w-10 ml-auto"></div>
                            </div>
                          ) : data?.error ? (
                            <p className="text-sm text-red-400">Error</p>
                          ) : (
                            <div>
                              <p
                                className={`font-semibold ${
                                  (data?.pnl || 0) >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {data ? formatCurrency(data.pnl) : "$0.00"}
                              </p>
                              <p
                                className={`text-sm ${
                                  (data?.roi || 0) >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {data ? formatPercentage(data.roi) : "0.00%"}
                              </p>
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="p-2 text-right">
                          <p className="font-semibold text-white">
                            {holding.amount.toFixed(5)}
                          </p>
                        </td>

                        {/* Avg Price */}
                        <td className="p-2 text-right">
                          <p className="font-semibold text-white">
                            {formatCurrencyWhole(holding.avgPrice)}
                          </p>
                        </td>

                        {/* Current Price */}
                        <td className="p-2 text-right">
                          {data?.loading ? (
                            <div className="animate-pulse">
                              <div className="h-5 bg-zinc-600 rounded w-16 ml-auto"></div>
                            </div>
                          ) : data?.error ? (
                            <p className="text-sm text-red-400">Error</p>
                          ) : (
                            <p className="font-semibold text-white">
                              {data
                                ? formatCurrencyWhole(data.currentPrice)
                                : formatCurrencyWhole(holding.avgPrice)}
                            </p>
                          )}
                        </td>

                        {/* ATH Price (now before Potential) */}
                        <td className="p-2 text-right">
                          {data?.loading ? (
                            <div className="animate-pulse">
                              <div className="h-5 bg-zinc-600 rounded w-16 ml-auto"></div>
                            </div>
                          ) : data?.error ? (
                            <p className="text-sm text-red-400">Error</p>
                          ) : data?.athPrice ? (
                            <p className="font-semibold text-purple-300">
                              {formatCurrencyWhole(data.athPrice)}
                            </p>
                          ) : (
                            <p className="text-sm text-zinc-500">N/A</p>
                          )}
                        </td>

                        {/* Potential P&L (from ATH) - currency + ROI, both in purple tones */}
                        <td className="p-2 text-right">
                          {data?.loading ? (
                            <div className="animate-pulse">
                              <div className="h-5 bg-zinc-600 rounded w-20 ml-auto"></div>
                            </div>
                          ) : data?.error ? (
                            <p className="text-sm text-red-400">Error</p>
                          ) : data?.potentialPnl !== undefined ? (
                            <div className="text-right">
                              <p className={`font-semibold text-purple-300`}>
                                {formatCurrency(data.potentialPnl || 0)}
                              </p>
                              <p className={`text-xs text-purple-200`}>
                                {data.potentialRoi !== undefined
                                  ? formatPercentage(data.potentialRoi)
                                  : "N/A"}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500">N/A</p>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 p-4 bg-zinc-900/30 rounded-xl  shadow-sm ring-1 ring-white/5">
          <p className="text-sm text-zinc-300 mb-2">
            Prices are live market prices from{" "}
            <a
              href="https://cryptoprices.cc"
              className="underline text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              cryptoprices.cc
            </a>
            . The "Potential" column shows a theoretical P&L/ROI using each
            asset's all-time high. Current prices shown are live at the time the
            page fetched them;
          </p>
        </div>
      </div>
    </div>
  );
}
