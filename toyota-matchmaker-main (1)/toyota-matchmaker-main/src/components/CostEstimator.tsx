import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle } from "@/types/vehicle";
import { Calculator, DollarSign } from "lucide-react";

interface CostEstimatorProps {
  vehicle: Vehicle;
}

export const CostEstimator = ({ vehicle }: CostEstimatorProps) => {
  const [downPayment, setDownPayment] = useState(5000);
  const [apr, setApr] = useState(5.99);
  const [termMonths, setTermMonths] = useState(60);
  const [taxRate, setTaxRate] = useState(8.25);

  const calculateFinancePayment = () => {
    const taxAmount = vehicle.price * (taxRate / 100);
    const totalPrice = vehicle.price + taxAmount;
    const loanAmount = totalPrice - downPayment;
    const monthlyRate = apr / 100 / 12;
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    return payment;
  };

  const calculateLeasePayment = () => {
    const residualValue = vehicle.price * 0.55; // 55% residual
    const depreciation = (vehicle.price - residualValue) / termMonths;
    const moneyFactor = apr / 2400;
    const financeCharge = (vehicle.price + residualValue) * moneyFactor;
    const taxAmount = (depreciation + financeCharge) * (taxRate / 100);
    return depreciation + financeCharge + taxAmount;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Calculator className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Cost Estimator</h3>
      </div>

      <Tabs defaultValue="finance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="lease">Lease</TabsTrigger>
        </TabsList>

        <TabsContent value="cash" className="space-y-4 pt-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Base Price</span>
              <span className="text-lg font-semibold">${vehicle.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Est. Tax ({taxRate}%)</span>
              <span className="text-lg font-semibold">${(vehicle.price * (taxRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-base font-semibold">Total Out-the-Door</span>
              <span className="text-2xl font-bold text-primary">${(vehicle.price * (1 + taxRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
            />
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4 pt-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Est. Monthly Payment</span>
            </div>
            <div className="text-4xl font-bold text-primary">
              ${calculateFinancePayment().toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              for {termMonths} months at {apr}% APR
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="down-payment">Down Payment</Label>
              <Input
                id="down-payment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apr">APR (%)</Label>
              <Input
                id="apr"
                type="number"
                step="0.01"
                value={apr}
                onChange={(e) => setApr(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Term (months)</Label>
              <Input
                id="term"
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Loan Amount</span>
              <span className="font-semibold">${((vehicle.price * (1 + taxRate / 100)) - downPayment).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-semibold">${((calculateFinancePayment() * termMonths) - ((vehicle.price * (1 + taxRate / 100)) - downPayment)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lease" className="space-y-4 pt-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Est. Monthly Lease</span>
            </div>
            <div className="text-4xl font-bold text-primary">
              ${calculateLeasePayment().toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              for {termMonths} months (55% residual)
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lease-term">Term (months)</Label>
              <Input
                id="lease-term"
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lease-apr">APR (%)</Label>
              <Input
                id="lease-apr"
                type="number"
                step="0.01"
                value={apr}
                onChange={(e) => setApr(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lease-tax">Tax Rate (%)</Label>
              <Input
                id="lease-tax"
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Residual Value</span>
              <span className="font-semibold">${(vehicle.price * 0.55).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Lease Cost</span>
              <span className="font-semibold">${(calculateLeasePayment() * termMonths).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
        <p>* These are estimates only. Actual payments may vary based on credit, dealer fees, and regional taxes.</p>
      </div>
    </div>
  );
};
