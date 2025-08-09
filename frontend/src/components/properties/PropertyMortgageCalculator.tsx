'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  Info,
  PieChart,
  FileText,
  Download
} from 'lucide-react'

interface MortgageCalculation {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  principalAmount: number
  monthlyBreakdown: {
    principal: number
    interest: number
    insurance: number
    taxes: number
    total: number
  }
}

interface PropertyMortgageCalculatorProps {
  propertyPrice?: number
  onCalculationChange?: (calculation: MortgageCalculation) => void
}

export function PropertyMortgageCalculator({
  propertyPrice = 0,
  onCalculationChange
}: PropertyMortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState(propertyPrice || 15000000)
  const [downPayment, setDownPayment] = useState(3000000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [loanTerm, setLoanTerm] = useState(25)
  const [interestRate, setInterestRate] = useState(12.5)
  const [propertyTax, setPropertyTax] = useState(0.5)
  const [homeInsurance, setHomeInsurance] = useState(0.3)
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (propertyPrice > 0) {
      setHomePrice(propertyPrice)
      const newDownPayment = propertyPrice * (downPaymentPercent / 100)
      setDownPayment(newDownPayment)
    }
  }, [propertyPrice, downPaymentPercent])

  useEffect(() => {
    calculateMortgage()
  }, [homePrice, downPayment, loanTerm, interestRate, propertyTax, homeInsurance])

  const calculateMortgage = () => {
    const principal = homePrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12

    // Monthly mortgage payment (principal + interest)
    const monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                     (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    // Monthly property tax and insurance
    const monthlyTax = (homePrice * propertyTax / 100) / 12
    const monthlyInsurance = (homePrice * homeInsurance / 100) / 12

    const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance
    const totalPayment = (monthlyPI * numberOfPayments) + (monthlyTax + monthlyInsurance) * numberOfPayments
    const totalInterest = (monthlyPI * numberOfPayments) - principal

    const newCalculation: MortgageCalculation = {
      monthlyPayment: totalMonthlyPayment,
      totalPayment,
      totalInterest,
      principalAmount: principal,
      monthlyBreakdown: {
        principal: principal / numberOfPayments,
        interest: totalInterest / numberOfPayments,
        insurance: monthlyInsurance,
        taxes: monthlyTax,
        total: totalMonthlyPayment
      }
    }

    setCalculation(newCalculation)
    onCalculationChange?.(newCalculation)
  }

  const handleDownPaymentChange = (value: number) => {
    setDownPayment(value)
    setDownPaymentPercent((value / homePrice) * 100)
  }

  const handleDownPaymentPercentChange = (percent: number) => {
    setDownPaymentPercent(percent)
    setDownPayment((homePrice * percent) / 100)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getAffordabilityLevel = () => {
    if (!calculation) return { level: 'unknown', color: 'gray', message: '' }
    
    const monthlyIncome = calculation.monthlyPayment / 0.28 // 28% rule
    
    if (calculation.monthlyPayment <= monthlyIncome * 0.28) {
      return {
        level: 'excellent',
        color: 'green',
        message: 'Well within recommended budget'
      }
    } else if (calculation.monthlyPayment <= monthlyIncome * 0.36) {
      return {
        level: 'good',
        color: 'yellow',
        message: 'Within acceptable range'
      }
    } else {
      return {
        level: 'stretch',
        color: 'red',
        message: 'May strain your budget'
      }
    }
  }

  const exportCalculation = () => {
    if (!calculation) return

    const data = {
      homePrice: formatCurrency(homePrice),
      downPayment: formatCurrency(downPayment),
      loanAmount: formatCurrency(calculation.principalAmount),
      interestRate: `${interestRate}%`,
      loanTerm: `${loanTerm} years`,
      monthlyPayment: formatCurrency(calculation.monthlyPayment),
      totalPayment: formatCurrency(calculation.totalPayment),
      totalInterest: formatCurrency(calculation.totalInterest)
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mortgage-calculation.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Mortgage Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="homePrice">Home Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="homePrice"
                  type="number"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="pl-10"
                  placeholder="15,000,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                    className="pl-10"
                  />
                </div>
                <div className="relative w-20">
                  <Input
                    type="number"
                    value={Math.round(downPaymentPercent)}
                    onChange={(e) => handleDownPaymentPercentChange(Number(e.target.value))}
                    className="pr-6"
                    min="0"
                    max="100"
                  />
                  <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="px-2">
                <Slider
                  value={[downPaymentPercent]}
                  onValueChange={(value) => handleDownPaymentPercentChange(value[0])}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term (Years)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="loanTerm"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="pl-10"
                  min="5"
                  max="30"
                />
              </div>
              <div className="px-2">
                <Slider
                  value={[loanTerm]}
                  onValueChange={(value) => setLoanTerm(value[0])}
                  max={30}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
              <div className="px-2">
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  max={20}
                  min={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mb-4"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyTax">Property Tax (% annually)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="propertyTax"
                      type="number"
                      step="0.1"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(Number(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeInsurance">Home Insurance (% annually)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="homeInsurance"
                      type="number"
                      step="0.1"
                      value={homeInsurance}
                      onChange={(e) => setHomeInsurance(Number(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {calculation && (
        <>
          {/* Monthly Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Monthly Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(calculation.monthlyPayment)}
                </div>
                <div className="text-gray-600">Total Monthly Payment</div>
                <Badge className={`mt-2 ${
                  getAffordabilityLevel().color === 'green' ? 'bg-green-100 text-green-700' :
                  getAffordabilityLevel().color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {getAffordabilityLevel().message}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(calculation.monthlyBreakdown.principal + calculation.monthlyBreakdown.interest)}
                  </div>
                  <div className="text-sm text-gray-600">Principal & Interest</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(calculation.monthlyBreakdown.taxes)}
                  </div>
                  <div className="text-sm text-gray-600">Property Tax</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {formatCurrency(calculation.monthlyBreakdown.insurance)}
                  </div>
                  <div className="text-sm text-gray-600">Insurance</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-600">
                    {formatCurrency(0)}
                  </div>
                  <div className="text-sm text-gray-600">PMI/Other</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Loan Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(calculation.principalAmount)}
                  </div>
                  <div className="text-gray-600">Loan Amount</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(calculation.totalInterest)}
                  </div>
                  <div className="text-gray-600">Total Interest</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(calculation.totalPayment)}
                  </div>
                  <div className="text-gray-600">Total Payment</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Affordability Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Monthly payment should not exceed 28% of gross monthly income</li>
                      <li>• Total debt payments should not exceed 36% of gross monthly income</li>
                      <li>• Consider additional costs: maintenance, utilities, HOA fees</li>
                      <li>• Recommended emergency fund: 3-6 months of expenses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={exportCalculation} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Calculation
                </Button>
                
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Get Pre-approved
                </Button>
                
                <Button>
                  <Calculator className="h-4 w-4 mr-2" />
                  Contact Lender
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}