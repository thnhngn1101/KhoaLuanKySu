"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Calendar({ currentMonth }) {
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  // const prevMonth = () => {
  //   setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  // }

  // const nextMonth = () => {
  //   setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  // }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<td key={`empty-${i}`} className="empty-day"></td>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

      days.push(
        <td key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
          {day}
        </td>,
      )
    }

    return days
  }

  const renderCalendarRows = () => {
    const days = renderCalendarDays()
    const rows = []
    let cells = []

    days.forEach((day, index) => {
      if (index % 7 === 0 && index > 0) {
        rows.push(<tr key={`row-${index / 7}`}>{cells}</tr>)
        cells = []
      }
      cells.push(day)
    })

    if (cells.length > 0) {
      // Fill the remaining cells in the last row
      while (cells.length < 7) {
        cells.push(<td key={`empty-end-${cells.length}`} className="empty-day"></td>)
      }
      rows.push(<tr key={`row-${rows.length}`}>{cells}</tr>)
    }

    return rows
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        {/* <button className="calendar-nav prev" onClick={prevMonth}>
          <ChevronLeft size={16} />
        </button> */}

        <div className="current-month">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>

        {/* <button className="calendar-nav next" onClick={nextMonth}>
          <ChevronRight size={16} />
        </button> */}
      </div>

      <table className="calendar-table">
        <thead>
          <tr>
            {weekdays.map((day) => (
              <th key={day} className="weekday">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderCalendarRows()}</tbody>
      </table>
    </div>
  )
}
