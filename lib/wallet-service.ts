import WalletConnect from "@walletconnect/client"
import QRCodeModal from "@walletconnect/qrcode-modal"
import { ethers } from "ethers"
import algosdk from "algosdk"

export interface WalletInfo {
  address: string
  chainId: number
  balance: string
  provider: any
}

class WalletService {
  private connector: WalletConnect | null = null
  private provider: any = null
  private signer: any = null

  async connectWallet(walletType: string): Promise<WalletInfo> {
    switch (walletType) {
      case "MetaMask":
        return this.connectMetaMask()
      case "WalletConnect":
        return this.connectWalletConnect()
      case "Coinbase Wallet":
        return this.connectCoinbaseWallet()
      default:
        throw new Error("Unsupported wallet type")
    }
  }

  private async connectMetaMask(): Promise<WalletInfo> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)
      const network = await provider.getNetwork()

      this.provider = provider
      this.signer = signer

      return {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        provider,
      }
    } catch (error) {
      throw new Error(`MetaMask connection failed: ${error}`)
    }
  }

  private async connectWalletConnect(): Promise<WalletInfo> {
    try {
      // Create WalletConnect connector
      this.connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org",
        qrcodeModal: QRCodeModal,
      })

      // Check if connection is already established
      if (!this.connector.connected) {
        // Create new session
        await this.connector.createSession()
      }

      return new Promise((resolve, reject) => {
        // Subscribe to connection events
        this.connector!.on("connect", async (error, payload) => {
          if (error) {
            reject(error)
            return
          }

          const { accounts, chainId } = payload.params[0]
          const address = accounts[0]

          // Create provider
          const provider = new ethers.JsonRpcProvider(
            `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
          )
          const balance = await provider.getBalance(address)

          this.provider = provider

          resolve({
            address,
            chainId,
            balance: ethers.formatEther(balance),
            provider,
          })
        })

        this.connector!.on("session_request", (error, payload) => {
          if (error) {
            reject(error)
          }
        })

        this.connector!.on("disconnect", (error, payload) => {
          if (error) {
            reject(error)
          }
        })
      })
    } catch (error) {
      throw new Error(`WalletConnect connection failed: ${error}`)
    }
  }

  private async connectCoinbaseWallet(): Promise<WalletInfo> {
    // Implementation for Coinbase Wallet would go here
    throw new Error("Coinbase Wallet integration not implemented yet")
  }

  async connectAlgorand(): Promise<{ address: string; balance: number }> {
    // Algorand wallet connection logic
    try {
      // This would integrate with AlgoSigner or other Algorand wallets
      if (typeof window !== "undefined" && (window as any).AlgoSigner) {
        await (window as any).AlgoSigner.connect()
        const accounts = await (window as any).AlgoSigner.accounts({
          ledger: "MainNet",
        })

        if (accounts.length > 0) {
          const address = accounts[0].address

          // Get balance using Algorand SDK
          const algodClient = new algosdk.Algodv2("", "https://mainnet-api.algonode.cloud", "")
          const accountInfo = await algodClient.accountInformation(address).do()

          return {
            address,
            balance: accountInfo.amount / 1000000, // Convert microAlgos to Algos
          }
        }
      }
      throw new Error("AlgoSigner not available")
    } catch (error) {
      throw new Error(`Algorand connection failed: ${error}`)
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error("No wallet connected")
    }

    try {
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      })

      return tx.hash
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`)
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error("No wallet connected")
    }

    try {
      return await this.signer.signMessage(message)
    } catch (error) {
      throw new Error(`Message signing failed: ${error}`)
    }
  }

  disconnect(): void {
    if (this.connector) {
      this.connector.killSession()
      this.connector = null
    }
    this.provider = null
    this.signer = null
  }
}

export const walletService = new WalletService()
