"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import type { Transaction } from "@/lib/types"
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Cell, Pie, PieChart, Tooltip, Legend, ResponsiveContainer } from "recharts"
import useSWR from "swr"
import { getRequest } from "@/helpers/ui/handlers"
import { ApiRouteConstants } from "@/helpers/string_const"
import { Loader2 } from "lucide-react"

interface ApiResponse<T> {
  success: boolean
  message: string
  body: T[]
}

const fetcher = async (url: string) => {
  console.log("Fetching from URL:", url)
  try {
    const response = await getRequest(url)
    console.log("API Response:", response)
    return response
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}

// Define a type for the pie chart props
interface PieChartProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  payload?: any;
  percent?: number;
  value?: number;
  name?: string;
  arc?: string;
}

// Define the custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = payload[0].value;
  const formattedValue = formatCurrency(Number(value));

  return (
    <div
      className="custom-tooltip"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        color: '#1e293b',
        zIndex: 10,
      }}
    >
      <p className="tooltip-label" style={{ 
        color: '#64748b',
        fontWeight: 'bold',
        marginBottom: '4px',
        margin: 0
      }}>
        Category: {label}
      </p>
      <p className="tooltip-value" style={{ 
        color: '#1e293b',
        margin: 0
      }}>
        {formattedValue}
      </p>
    </div>
  );
};

export function CategoryChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 })
  
  console.log("CategoryChart rendering")
  
  const { data, error, isLoading } = useSWR<ApiResponse<Transaction>>(
    ApiRouteConstants.GET_TRANSACTION,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      dedupingInterval: 2000,
    }
  )
  
  // Responsive adjustment
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const { width } = chartRef.current.getBoundingClientRect()
        setChartDimensions({
          width,
          height: Math.min(width * 0.8, 400) // Adjust height based on width, with a maximum
        })
      }
    }

    // Initial update
    updateDimensions()
    
    // Update on resize
    window.addEventListener('resize', updateDimensions)
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const chartData = useMemo(() => {
    if (!data?.body) {
      console.log("No data body found")
      return []
    }
    
    const transactions = data.body
    console.log("Raw transactions:", transactions)
    console.log("Transaction count:", transactions.length)
    
    if (transactions.length === 0) {
      console.log("No transactions to process")
      return []
    }

    // Log a sample transaction to check structure
    if (transactions.length > 0) {
      console.log("Sample transaction:", transactions[0])
    }

    // Group transactions by category
    const categoryData: Record<string, number> = {}

    // Initialize all categories with 0
    CATEGORIES.forEach((category) => {
      categoryData[category] = 0
    })

    console.log("Initial categoryData:", {...categoryData})

    // Sum up amounts by category
    let categorizedCount = 0
    transactions.forEach((transaction) => {
      if (!transaction.category) {
        console.log("Transaction without category:", transaction)
        return
      }
      const category = transaction.category
      const amount = Number(transaction.amount)
      console.log(`Adding transaction: Category=${category}, Amount=${amount}`)
      categoryData[category] = (categoryData[category] || 0) + amount
      categorizedCount++
    })

    console.log("Categorized transactions count:", categorizedCount)
    console.log("Final categoryData:", {...categoryData})

    // Convert to array format for the chart
    const result = Object.entries(categoryData)
      .filter(([_, amount]) => amount > 0) // Only include categories with transactions
      .map(([name, value]) => ({ name, value }))

    console.log("Processed chart data:", result)
    console.log("Chart data entries:", result.length)
    
    return result
  }, [data])

  if (isLoading) {
    console.log("Showing loading state")
    return (
      <Card className="p-6 text-center h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading chart data...</p>
      </Card>
    )
  }

  if (error) {
    console.error("Error loading chart data:", error)
    return (
      <Card className="p-6 text-center text-red-500 h-[300px] flex items-center justify-center">
        Error loading chart data: {error.message}
      </Card>
    )
  }

  if (!data) {
    console.log("No data received from API")
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        No data received from API
      </Card>
    )
  }

  if (!data.body) {
    console.log("Data received but body is missing")
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        API response missing data body
      </Card>
    )
  }

  if (data.body.length === 0) {
    console.log("Data body is empty array")
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        No transaction data to display
      </Card>
    )
  }

  if (chartData.length === 0) {
    console.log("Chart data is empty after processing")
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        No categorized transactions to display
      </Card>
    )
  }

  console.log("Rendering chart with data:", chartData)
  
  // Define professional colors for a more refined look
  const PROFESSIONAL_COLORS = Object.values(CATEGORY_COLORS);

  // Responsive settings
  const getResponsiveSettings = () => {
    const isMobile = window.innerWidth < 640
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024
    
    return {
      labelEnabled: false, // Disable labels on pie to avoid clutter
      outerRadius: isMobile ? '60%' : isTablet ? '70%' : '70%', // Slightly smaller chart to give space for legend
      innerRadius: isMobile ? '30%' : isTablet ? '40%' : '45%',
      legendPosition: isMobile ? 'bottom' : 'right',
      fontSize: isMobile ? 10 : 12,
      chartHeight: isMobile ? 350 : 400
    }
  }

  const responsiveSettings = typeof window !== 'undefined' ? getResponsiveSettings() : {
    labelEnabled: false,
    outerRadius: '70%',
    innerRadius: '45%',
    legendPosition: 'right',
    fontSize: 12,
    chartHeight: 400
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
      
      <div ref={chartRef} className={`w-full h-[${responsiveSettings.chartHeight}px]`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={responsiveSettings.labelEnabled}
              outerRadius={responsiveSettings.outerRadius}
              innerRadius={responsiveSettings.innerRadius}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={responsiveSettings.labelEnabled ? 
                ({ name, percent }) => `${(percent * 100).toFixed(0)}%` : 
                false
              }
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]} 
                  stroke="#ffffff"
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
              wrapperStyle={{ zIndex: 100, pointerEvents: 'auto' }}
            />
            <Legend
              layout={responsiveSettings.legendPosition === 'bottom' ? 'horizontal' : 'vertical'}
              verticalAlign={responsiveSettings.legendPosition === 'bottom' ? 'bottom' : 'middle'}
              align={responsiveSettings.legendPosition === 'bottom' ? 'center' : 'right'}
              iconSize={10}
              wrapperStyle={{
                paddingLeft: responsiveSettings.legendPosition === 'right' ? '20px' : '0px',
                fontSize: responsiveSettings.fontSize,
                lineHeight: '1.5em'
              }}
              formatter={(value) => <span style={{ color: '#e2e8f0' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Debug Section - Hidden now that chart is working */}
      {false && (
        <div className="mt-4 p-2 bg-gray-800 text-white rounded-md">
          <p className="font-medium">Debug Info:</p>
          <ul className="text-xs mt-1">
            {chartData.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span style={{ color: PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length], fontWeight: 'bold' }}>
                  {item.name}:
                </span>
                <span>{formatCurrency(item.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
