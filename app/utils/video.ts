export function getYoutubeID(url: string): string | null {
  let videoID = null

  try {
    const urlObj = new URL(url)
    // https://www.youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
      videoID = urlObj.searchParams.get("v")
    }
    // https://youtu.be/VIDEO_ID
    else if (urlObj.hostname === "youtu.be") {
      videoID = urlObj.pathname.substring(1)
    }
  } catch (error) {
    console.error("Invalid URL:", error)
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    if (match && match[1]) {
      videoID = match[1]
    }
  }
  return videoID
}
