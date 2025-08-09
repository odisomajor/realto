import React, { useState, useCallback } from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number[]
  onValueChange: (value: number[]) => void
  className?: string
}

export function Slider({ 
  min, 
  max, 
  step = 1, 
  value, 
  onValueChange, 
  className = '' 
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const percentage = (e.clientX - rect.left) / rect.width
    const newValue = Math.round((min + percentage * (max - min)) / step) * step
    const clampedValue = Math.max(min, Math.min(max, newValue))
    onValueChange([clampedValue])
  }, [min, max, step, onValueChange])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const slider = document.querySelector('[data-slider]') as HTMLElement
    if (!slider) return
    
    const rect = slider.getBoundingClientRect()
    const percentage = (e.clientX - rect.left) / rect.width
    const newValue = Math.round((min + percentage * (max - min)) / step) * step
    const clampedValue = Math.max(min, Math.min(max, newValue))
    onValueChange([clampedValue])
  }, [isDragging, min, max, step, onValueChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div
        data-slider
        className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute h-2 bg-blue-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-pointer transform -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${percentage}%`, top: '50%' }}
        />
      </div>
    </div>
  )
}