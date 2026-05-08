import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false

let failedQueue: {
  resolve: (token: string) => void
  reject: (error: any) => void
}[] = []

const processQueue = (
  error: any,
  token: string | null = null
) => {

  failedQueue.forEach(prom => {

    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }

  })

  failedQueue = []
}

// =========================
// REQUEST INTERCEPTOR
// =========================

api.interceptors.request.use((config) => {

  if (!config.headers.Authorization) {

    const token =
      localStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }
  }

  return config
})

// =========================
// RESPONSE INTERCEPTOR
// =========================

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config

    // ignorar login
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error)
    }

    // token expirado
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {

      // si ya se está refrescando
      if (isRefreshing) {

        return new Promise((resolve, reject) => {

          failedQueue.push({
            resolve,
            reject
          })

        }).then((token) => {

          originalRequest.headers.Authorization =
            `Bearer ${token}`

          return api(originalRequest)

        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true

      isRefreshing = true

      try {

        const refreshToken =
          localStorage.getItem('refresh_token')
     

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          }
        )

        localStorage.setItem(
          'access_token',
          data.access_token
        )

        localStorage.setItem(
          'refresh_token',
          data.refresh_token
        )

        processQueue(null, data.access_token)

        originalRequest.headers.Authorization =
          `Bearer ${data.access_token}`

        return api(originalRequest)

      } catch (refreshError) {

        processQueue(refreshError, null)

        localStorage.clear()

        window.location.href = '/login'

        return Promise.reject(refreshError)

      } finally {

        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api