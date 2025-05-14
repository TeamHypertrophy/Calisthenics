export function toFirstLetterUpperCase(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatLabel(inputValue: string | undefined | null): string {
  if (!inputValue) return ""
  return inputValue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function formatAPI(rawValue: string | undefined | null): string | undefined {
  if (!rawValue) {
    return undefined
  }

  if (rawValue.includes("_")) {
    return rawValue
      .split("_")
      .map((word) => {
        if (!word) return ""
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join("")
  } else {
    if (!rawValue) return ""
    return rawValue.charAt(0).toUpperCase() + rawValue.slice(1).toLowerCase()
  }
}

export function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined || seconds < 0) {
    return "0s"
  }

  if (seconds === 0) {
    return "0s"
  }

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  let result = ""
  if (h > 0) {
    result += `${h}h `
  }
  if (m > 0 || (h > 0 && s > 0)) {
    result += `${m}m `
  }
  if (s > 0 || (m === 0 && h === 0)) {
    result += `${s}s`
  }

  return result.trim()
}
