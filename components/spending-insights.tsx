import type { SpendingInsight } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SpendingInsightsProps {
  insights: SpendingInsight[]
}

export function SpendingInsights({ insights }: SpendingInsightsProps) {
  if (insights.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No insights available. Add transactions and set budgets to see spending insights.
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {insight.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {insight.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {insight.type === "danger" && <AlertCircle className="h-5 w-5 text-red-500" />}
              {insight.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
              <CardTitle className="text-base">
                {insight.category && (
                  <Badge variant="outline" className="mr-2">
                    {insight.category}
                  </Badge>
                )}
                {getInsightTitle(insight.type)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm text-foreground">{insight.message}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getInsightTitle(type: SpendingInsight["type"]): string {
  switch (type) {
    case "success":
      return "Good job!"
    case "warning":
      return "Attention needed"
    case "danger":
      return "Budget alert"
    case "info":
      return "Spending insight"
    default:
      return "Insight"
  }
}
