"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonthPickerProps {
  value: string // Format: YYYY-MM
  onChange: (value: string) => void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [year, month] = value.split("-").map(Number)

  const handlePrevMonth = () => {
    let newMonth = month - 1
    let newYear = year

    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }

    onChange(`${newYear}-${String(newMonth).padStart(2, "0")}`)
  }

  const handleNextMonth = () => {
    let newMonth = month + 1
    let newYear = year

    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }

    onChange(`${newYear}-${String(newMonth).padStart(2, "0")}`)
  }

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" })

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1 text-center">
        <span className="font-medium">
          {monthName} {year}
        </span>
      </div>

      <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
