"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PinSetupProps {
  onPinSet: (pin: string) => void
  walletAddress: string
}

export default function PinSetup({ onPinSet, walletAddress }: PinSetupProps) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePinChange = (value: string, isConfirm = false) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    if (isConfirm) {
      setConfirmPin(numericValue)
    } else {
      setPin(numericValue)
    }
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.length !== 6) {
      setError("PIN must be exactly 6 digits")
      return
    }

    if (pin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    setIsLoading(true)

    // Simulate PIN setup
    setTimeout(() => {
      onPinSet(pin)
      setIsLoading(false)
    }, 1500)
  }

  const formatAddress = (address: string) => {
    if (!address || typeof address !== "string") {
      return "No address connected"
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
            <span className="text-2xl">🔢</span>
          </div>
          <CardTitle className="text-2xl font-mono text-primary">Setup Transaction PIN</CardTitle>
          <CardDescription>Create a 6-digit PIN to secure your transactions</CardDescription>
          <div className="bg-secondary/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Connected Wallet:</p>
            <p className="font-mono text-sm text-primary">{formatAddress(walletAddress)}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pin">Transaction PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter 6-digit PIN"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                placeholder="Confirm 6-digit PIN"
                value={confirmPin}
                onChange={(e) => handlePinChange(e.target.value, true)}
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            {error && <div className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading || pin.length !== 6 || confirmPin.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Setting up PIN...
                </div>
              ) : (
                "Setup PIN & Continue"
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Your PIN is encrypted and stored securely. You'll need this PIN for all transactions.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
