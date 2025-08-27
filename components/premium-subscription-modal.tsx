"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap } from "lucide-react"

interface PremiumSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
  onSubscriptionChange: (plan: string) => void
}

export default function PremiumSubscriptionModal({
  isOpen,
  onClose,
  currentPlan,
  onSubscriptionChange,
}: PremiumSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      monthlyPrice: 0,
      icon: <Star className="h-6 w-6" />,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/20",
      features: [
        "Basic wallet functionality",
        "Standard transaction limits",
        "Email support",
        "Basic trading features",
        "Standard conversion rates",
      ],
      limits: {
        dailyLimit: "$1,000",
        tradingFee: "0.5%",
        conversionFee: "1.0%",
      },
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19.99/month",
      monthlyPrice: 19.99,
      icon: <Crown className="h-6 w-6" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      popular: true,
      features: [
        "Advanced trading tools",
        "Higher transaction limits",
        "Priority support",
        "Advanced analytics",
        "Better conversion rates",
        "Premium indicators",
        "Portfolio insights",
      ],
      limits: {
        dailyLimit: "$25,000",
        tradingFee: "0.25%",
        conversionFee: "0.5%",
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99.99/month",
      monthlyPrice: 99.99,
      icon: <Zap className="h-6 w-6" />,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/20",
      features: [
        "Unlimited transactions",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom integrations",
        "Institutional rates",
        "Advanced API access",
        "White-label options",
        "Risk management tools",
      ],
      limits: {
        dailyLimit: "Unlimited",
        tradingFee: "0.1%",
        conversionFee: "0.25%",
      },
    },
  ]

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true)

    // Simulate RevenueCat integration
    try {
      // In a real app, this would integrate with RevenueCat
      await new Promise((resolve) => setTimeout(resolve, 2000))

      onSubscriptionChange(planId)
      onClose()
    } catch (error) {
      console.error("Subscription failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your AlgoPayX Plan</DialogTitle>
          <p className="text-center text-muted-foreground">
            Unlock premium features and higher limits with our subscription plans
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all hover:scale-105 ${
                plan.popular ? "ring-2 ring-primary" : ""
              } ${plan.borderColor} ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
              )}

              <CardHeader className="text-center">
                <div className={`mx-auto p-3 rounded-full ${plan.bgColor} w-fit`}>
                  <div className={plan.color}>{plan.icon}</div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">{plan.price}</div>
                {plan.monthlyPrice > 0 && <CardDescription>Billed monthly</CardDescription>}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm">Limits & Fees:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Limit:</span>
                      <span className="font-medium">{plan.limits.dailyLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trading Fee:</span>
                      <span className="font-medium">{plan.limits.tradingFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversion Fee:</span>
                      <span className="font-medium">{plan.limits.conversionFee}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  variant={currentPlan === plan.id ? "secondary" : "default"}
                  disabled={isProcessing || currentPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isProcessing && selectedPlan === plan.id
                    ? "Processing..."
                    : currentPlan === plan.id
                      ? "Current Plan"
                      : plan.monthlyPrice === 0
                        ? "Get Started"
                        : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-secondary/20 rounded-lg">
          <h3 className="font-semibold mb-2">Powered by RevenueCat</h3>
          <p className="text-sm text-muted-foreground">
            Secure subscription management with automatic billing, receipt validation, and cross-platform support.
            Cancel anytime from your account settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
