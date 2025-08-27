import axios from "axios"

export interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap?: number
  high24h?: number
  low24h?: number
}

class MarketDataService {
  private readonly COINGECKO_API = "https://api.coingecko.com/api/v3"
  private readonly ALPHA_VANTAGE_API = "https://www.alphavantage.co/query"
  private readonly ALPHA_VANTAGE_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY

  async getCryptoData(): Promise<MarketData[]> {
    try {
      const response = await axios.get(`${this.COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h",
        },
      })

      return response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        volume: `$${(coin.total_volume / 1000000).toFixed(1)}M`,
        marketCap: coin.market_cap,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
      }))
    } catch (error) {
      console.error("Failed to fetch crypto data:", error)
      throw new Error("Failed to fetch cryptocurrency data")
    }
  }

  async getStockData(symbols: string[]): Promise<MarketData[]> {
    if (!this.ALPHA_VANTAGE_KEY) {
      throw new Error("Alpha Vantage API key not configured")
    }

    try {
      const promises = symbols.map(async (symbol) => {
        const response = await axios.get(this.ALPHA_VANTAGE_API, {
          params: {
            function: "GLOBAL_QUOTE",
            symbol,
            apikey: this.ALPHA_VANTAGE_KEY,
          },
        })

        const quote = response.data["Global Quote"]
        return {
          symbol: quote["01. symbol"],
          name: symbol, // Would need another API call for company name
          price: Number.parseFloat(quote["05. price"]),
          change: Number.parseFloat(quote["09. change"]),
          changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
          volume: quote["06. volume"],
        }
      })

      return await Promise.all(promises)
    } catch (error) {
      console.error("Failed to fetch stock data:", error)
      throw new Error("Failed to fetch stock market data")
    }
  }

  async getForexRates(): Promise<{ [key: string]: number }> {
    try {
      const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD")
      return response.data.rates
    } catch (error) {
      console.error("Failed to fetch forex rates:", error)
      throw new Error("Failed to fetch exchange rates")
    }
  }

  // Real-time WebSocket connection for live data
  connectWebSocket(symbols: string[], onUpdate: (data: MarketData) => void): WebSocket | null {
    if (typeof window === "undefined") return null

    try {
      // Example using Binance WebSocket for crypto data
      const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr")

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (Array.isArray(data)) {
          data.forEach((ticker: any) => {
            if (symbols.includes(ticker.s)) {
              onUpdate({
                symbol: ticker.s,
                name: ticker.s,
                price: Number.parseFloat(ticker.c),
                change: Number.parseFloat(ticker.P),
                changePercent: Number.parseFloat(ticker.P),
                volume: ticker.v,
              })
            }
          })
        }
      }

      return ws
    } catch (error) {
      console.error("WebSocket connection failed:", error)
      return null
    }
  }
}

export const marketDataService = new MarketDataService()
