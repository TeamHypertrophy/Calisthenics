export function toFirstLetterUpperCase(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatLabel(inputValue: string | undefined | null): string {
    if (!inputValue) return "";
    return inputValue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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