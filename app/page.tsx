"use client"

import { useState } from "react"
import LoadingScreen from "@/components/loading-screen"
import WalletConnect from "@/components/wallet-connect"
import PinSetup from "@/components/pin-setup"
import Dashboard from "@/components/dashboard"

type AuthState = "loading" | "wallet-connect" | "pin-setup" | "dashboard"

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [walletAddress, setWalletAddress] = useState("")
  const [userPin, setUserPin] = useState("")

  const handleLoadingComplete = () => {
    setAuthState("wallet-connect")
  }

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address)
    setAuthState("pin-setup")
  }

  const handlePinSet = (pin: string) => {
    setUserPin(pin)
    setAuthState("dashboard")
  }

  const handleLogout = () => {
    setWalletAddress("")
    setUserPin("")
    setAuthState("wallet-connect")
  }

  switch (authState) {
    case "loading":
      return <LoadingScreen onComplete={handleLoadingComplete} />

    case "wallet-connect":
      return <WalletConnect onConnect={handleWalletConnect} />

    case "pin-setup":
      return <PinSetup onPinSet={handlePinSet} walletAddress={walletAddress} />

    case "dashboard":
      return <Dashboard walletAddress={walletAddress} onLogout={handleLogout} />

    default:
      return <LoadingScreen onComplete={handleLoadingComplete} />
  }
}
