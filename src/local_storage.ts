import React, { useState, useEffect } from "react"

function getStorageValue<T>(key: string, defaultValue: T) {
  const saved: string | null = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : defaultValue
}

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<T>] {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue)
  })

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
