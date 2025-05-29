import Carousel from "../components/Carousel"
import NewsSection from "../components/NewsSection"
import Sidebar from "../components/Sidebar"
import Calendar from "../components/Calendar"
import { useState } from "react"

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  return (
    <main className="main-content">
      <div className="content-wrapper">
        <div className="left-content">
          <Carousel />
          <div className="slogan-banner">
            <h2>Tin Tức</h2>
          </div>
          <NewsSection />
        </div>
        <div className="right-sidebar">
          <Sidebar />
          <div className="calendar-section">
            <h3>Tháng 5, 2025</h3>
            <Calendar currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
          </div>
        </div>
      </div>
    </main>
  )
}
