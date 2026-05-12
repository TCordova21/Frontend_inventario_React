export const getImageUrl = (url?: string | null) => {
  if (!url) return '/placeholder.png'

  // Google Drive
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([^/]+)/)

    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
    }
  }

  return url
}