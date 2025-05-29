"use client"

import { useEffect, useState } from "react"
import { ThumbsUp } from "lucide-react"

export default function NewsSection() {
  const [newsItems, setNewsItems] = useState([])
  const [likes, setLikes] = useState({})

  useEffect(() => {
    fetchRSS()
  }, [])

  const fetchRSS = async () => {
    try {
      const response = await fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=https://vnexpress.net/rss/thoi-su.rss"
      )
      const data = await response.json()

      const rssNews = data.items.slice(0, 10).map((item, index) => ({
        id: `rss-${index}`,
        title: item.title,
        date: new Date(item.pubDate).toLocaleDateString("vi-VN"),
        content: item.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 150) + "...",
        likes: Math.floor(Math.random() * 20),
        link: item.link,
      }))

      setNewsItems(rssNews)
    } catch (error) {
      console.error("Error loading RSS:", error)
    }
  }

  const handleLike = (id) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }))
  }

  return (
    <div className="news-section space-y-6 px-4 py-6">
      {newsItems.map((item) => (
        <div key={item.id} className="news-item border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
          <p className="text-sm text-gray-500 mb-1">{item.date}</p>
          <p className="text-sm text-gray-700 mb-2">{item.content}</p>

          <div className="flex items-center gap-4 text-sm">
            <button
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              onClick={() => handleLike(item.id)}
            >
              <ThumbsUp size={16} />
              <span>{(likes[item.id] || 0) + item.likes}</span>
            </button>

            <a
              href={item.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline"
            >
              Xem thêm
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
