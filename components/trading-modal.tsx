"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { marketDataService, type MarketData } from "@/lib/market-data-service"

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  onTransactionComplete: (transaction: any) => void
}

export default function TradingModal({ isOpen, onClose, onTransactionComplete }: TradingModalProps) {
  const [activeTab, setActiveTab] = useState("stocks")
  const [showPinVerification, setShowPinVerification] = useState(false)
  const [pin, setPin] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTrade, setCurrentTrade] = useState<any>(null)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [tradeType, setTradeType] = useState("buy")
  const [quantity, setQuantity] = useState("")
  const [orderType, setOrderType] = useState("market")
  const [limitPrice, setLimitPrice] = useState("")
  const [marketData, setMarketData] = useState<{ [key: string]: MarketData[] }>({
    stocks: [],
    indices: [],
    options: [],
    crypto: [],
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadMarketData()
    }
  }, [isOpen, activeTab])

  const loadMarketData = async () => {
    setIsLoadingData(true)
    setError(null)

    try {
      if (activeTab === "crypto") {
        const cryptoData = await marketDataService.getCryptoData()
        setMarketData((prev) => ({ ...prev, crypto: cryptoData }))
      } else if (activeTab === "stocks") {
        const stockSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA"]
        const stockData = await marketDataService.getStockData(stockSymbols)
        setMarketData((prev) => ({ ...prev, stocks: stockData }))
      }
    } catch (err: any) {
      setError(err.message || "Failed to load market data")
      console.error("Market data loading failed:", err)
    } finally {
      setIsLoadingData(false)
    }
  }

  const getCurrentMarketData = () => {
    return marketData[activeTab] || []
  }

  const calculateTradeValue = () => {
    if (!selectedAsset || !quantity) return 0
    const price = orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : selectedAsset.price
    return price * Number.parseFloat(quantity)
  }

  const handleTrade = () => {
    if (!selectedAsset || !quantity) return

    const tradeValue = calculateTradeValue()
    setCurrentTrade({
      asset: selectedAsset,
      type: tradeType,
      quantity: Number.parseFloat(quantity),
      price: orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : selectedAsset.price,
      orderType,
      totalValue: tradeValue,
      category: activeTab,
    })
    setShowPinVerification(true)
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 6) return

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const transaction = {
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: `${currentTrade.type}-${currentTrade.category}`,
        amount: currentTrade.totalValue.toFixed(2),
        recipient: `${currentTrade.asset.symbol} - ${currentTrade.type.toUpperCase()}`,
        timestamp: new Date(),
        status: "completed",
        category: "trading",
        details: {
          symbol: currentTrade.asset.symbol,
          quantity: currentTrade.quantity,
          price: currentTrade.price,
          orderType: currentTrade.orderType,
          tradeType: currentTrade.type,
        },
      }

      onTransactionComplete(transaction)
      setIsProcessing(false)
      setShowPinVerification(false)
      setPin("")
      onClose()

      setSelectedAsset(null)
      setQuantity("")
      setLimitPrice("")
      setOrderType("market")
      setTradeType("buy")
    } catch (err: any) {
      setError(err.message || "Trade execution failed")
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${price.toFixed(2)}`
  }

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0
    const color = isPositive ? "text-green-400" : "text-red-400"
    const sign = isPositive ? "+" : ""

    return (
      <span className={color}>
        {sign}
        {change.toFixed(2)} ({sign}
        {changePercent.toFixed(2)}%)
      </span>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono text-primary">Trading Platform</DialogTitle>
          <DialogDescription>Trade stocks, indices, options, and cryptocurrencies</DialogDescription>
        </DialogHeader>

        {!showPinVerification ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-secondary">
                  <TabsTrigger
                    value="stocks"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Stocks
                  </TabsTrigger>
                  <TabsTrigger
                    value="indices"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Indices
                  </TabsTrigger>
                  <TabsTrigger
                    value="options"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Options
                  </TabsTrigger>
                  <TabsTrigger
                    value="crypto"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Crypto
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xl">📈</span>
                        {activeTab === "stocks" && "Stock Market"}
                        {activeTab === "indices" && "Market Indices"}
                        {activeTab === "options" && "Options Chains"}
                        {activeTab === "crypto" && "Cryptocurrency Market"}
                      </CardTitle>
                      <CardDescription>
                        {activeTab === "stocks" && "Trade individual stocks from major exchanges"}
                        {activeTab === "indices" && "Invest in market indices and ETFs"}
                        {activeTab === "options" && "Trade options contracts with various strikes and expirations"}
                        {activeTab === "crypto" && "Buy and sell cryptocurrencies 24/7"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                          <p className="text-red-400 text-sm">{error}</p>
                          <Button variant="outline" size="sm" onClick={loadMarketData} className="mt-2 bg-transparent">
                            Retry
                          </Button>
                        </div>
                      )}

                      {isLoadingData ? (
                        <div className="flex items-center justify-center h-96">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>Loading market data...</span>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-96">
                          <div className="space-y-2">
                            {getCurrentMarketData().map((asset) => (
                              <div
                                key={asset.symbol}
                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  selectedAsset?.symbol === asset.symbol
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-secondary/20"
                                }`}
                                onClick={() => setSelectedAsset(asset)}
                              >
                                <div className="flex-1">
                                  <div className="font-semibold">{asset.symbol}</div>
                                  <div className="text-sm text-muted-foreground truncate">{asset.name}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">{formatPrice(asset.price)}</div>
                                  <div className="text-sm">{formatChange(asset.change, asset.changePercent)}</div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-sm text-muted-foreground">Vol: {asset.volume}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">💼</span>
                    Place Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAsset ? (
                    <>
                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="font-semibold">{selectedAsset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{selectedAsset.name}</div>
                        <div className="text-lg font-bold text-primary">{formatPrice(selectedAsset.price)}</div>
                        <div className="text-sm">{formatChange(selectedAsset.change, selectedAsset.changePercent)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={tradeType === "buy" ? "default" : "outline"}
                          className={tradeType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-transparent"}
                          onClick={() => setTradeType("buy")}
                        >
                          Buy
                        </Button>
                        <Button
                          variant={tradeType === "sell" ? "default" : "outline"}
                          className={tradeType === "sell" ? "bg-red-600 hover:bg-red-700" : "bg-transparent"}
                          onClick={() => setTradeType("sell")}
                        >
                          Sell
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderType">Order Type</Label>
                        <Select value={orderType} onValueChange={setOrderType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market">Market Order</SelectItem>
                            <SelectItem value="limit">Limit Order</SelectItem>
                            <SelectItem value="stop">Stop Loss</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {orderType === "limit" && (
                        <div className="space-y-2">
                          <Label htmlFor="limitPrice">Limit Price</Label>
                          <Input
                            id="limitPrice"
                            type="number"
                            placeholder="0.00"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity {activeTab === "crypto" ? "(Amount)" : "(Shares)"}</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder={activeTab === "crypto" ? "0.00000000" : "0"}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>

                      {quantity && (
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground">Estimated Total</div>
                          <div className="text-xl font-bold text-primary">{formatPrice(calculateTradeValue())}</div>
                          <div className="text-xs text-muted-foreground mt-1">+ Trading fee: $2.95</div>
                        </div>
                      )}

                      <Button
                        onClick={handleTrade}
                        className={`w-full ${
                          tradeType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                        }`}
                        disabled={!quantity}
                      >
                        {tradeType === "buy" ? "Place Buy Order" : "Place Sell Order"}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2">📊</div>
                      <p>Select an asset to start trading</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Market Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Status</span>
                      <Badge className="bg-green-500/20 text-green-400">Open</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trading Hours</span>
                      <span className="text-sm">9:30 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Balance</span>
                      <span className="font-semibold text-primary">$12,450.75</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buying Power</span>
                      <span className="font-semibold">$24,901.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
                <span className="text-2xl">🔐</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Confirm Trade</h3>
                <p className="text-muted-foreground">Enter your 6-digit PIN to execute the trade</p>
              </div>

              {currentTrade && (
                <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset:</span>
                    <span className="font-semibold">{currentTrade.asset.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action:</span>
                    <span
                      className={`font-semibold ${currentTrade.type === "buy" ? "text-green-400" : "text-red-400"}`}
                    >
                      {currentTrade.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-semibold">{currentTrade.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">{formatPrice(currentTrade.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold text-primary">{formatPrice(currentTrade.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Type:</span>
                    <span className="font-semibold capitalize">{currentTrade.orderType}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tradePin">Transaction PIN</Label>
                <Input
                  id="tradePin"
                  type="password"
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPinVerification(false)
                    setPin("")
                  }}
                  className="flex-1 bg-transparent"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePinSubmit}
                  className={`flex-1 ${
                    currentTrade?.type === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={pin.length !== 6 || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Executing...
                    </div>
                  ) : (
                    "Execute Trade"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
