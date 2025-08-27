"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { walletService, type WalletInfo } from "@/lib/wallet-service"

interface WalletConnectProps {
  onConnect: (walletInfo: WalletInfo) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      const walletInfo = await walletService.connectWallet(walletType)
      onConnect(walletInfo)
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
      console.error("Wallet connection error:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  const wallets = [
    {
      name: "MetaMask",
      description: "Connect using MetaMask wallet",
      icon: "🦊",
      popular: true,
      available: typeof window !== "undefined" && window.ethereum,
    },
    {
      name: "WalletConnect",
      description: "Connect using WalletConnect protocol",
      icon: "🔗",
      popular: true,
      available: true,
    },
    {
      name: "Coinbase Wallet",
      description: "Connect using Coinbase Wallet",
      icon: "🔵",
      popular: false,
      available: false, // Not implemented yet
    },
    {
      name: "Trust Wallet",
      description: "Connect using Trust Wallet",
      icon: "🛡️",
      popular: false,
      available: false, // Not implemented yet
    },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle className="text-2xl font-mono text-primary">Connect Wallet</CardTitle>
          <CardDescription>Choose your preferred wallet to connect to AlgoPayX</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full h-16 justify-start gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group bg-transparent"
              onClick={() => handleConnect(wallet.name)}
              disabled={isConnecting || !wallet.available}
            >
              <div className="text-2xl">{wallet.icon}</div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{wallet.name}</span>
                  {wallet.popular && (
                    <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                      Popular
                    </Badge>
                  )}
                  {!wallet.available && (
                    <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-400">
                      Soon
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{wallet.description}</div>
              </div>
              {isConnecting && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </Button>
          ))}

          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              By connecting, you agree to AlgoPayX Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
