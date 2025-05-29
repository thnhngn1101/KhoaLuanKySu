"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      image: "/src/assets/xebuyt.png",
      alt: "Ho Chi Minh City Skyline with transportation",
    },
    {
      id: 2,
      image: "/src/assets/face.png",
      alt: "Public transportation in Ho Chi Minh City",
    },
    {
      id: 3,
      image: "/src/assets/bus.png",
      alt: "Bus transportation in Ho Chi Minh City",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((current) => (current === slides.length - 1 ? 0 : current + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((current) => (current === 0 ? slides.length - 1 : current - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="carousel">
      <div className="carousel-container">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`carousel-slide ${index === currentSlide ? "active" : ""}`}>
            <img src={slide.image || "/placeholder.svg"} alt={slide.alt} />
          </div>
        ))}

        <button className="carousel-control prev" onClick={prevSlide}>
          <ChevronLeft size={24} />
        </button>

        <button className="carousel-control next" onClick={nextSlide}>
          <ChevronRight size={24} />
        </button>

        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
