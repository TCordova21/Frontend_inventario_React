export const getImageUrl = (url?: string | null) => {
  if (!url) return '/placeholder.png'

  console.log('URL ORIGINAL:', url)

  // GOOGLE DRIVE
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([^/]+)/)

    console.log('MATCH:', match)

    if (match?.[1]) {
      const finalUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`

      console.log('FINAL URL:', finalUrl)

      return finalUrl
    }
  }

  return url
}