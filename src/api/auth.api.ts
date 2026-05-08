import api from '../lib/axios'
import type { AuthResponse, LoginDto } from '../types/auth.types'

export const login = async (dto: LoginDto): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', dto)
    return data
  } catch (error: any) {
    // Relanzamos el error para que el catch del componente Login lo maneje
    // pero nos aseguramos de que no sea un error "fatal" de JS
    throw error;
  }
}

export const refresh = async (): Promise<AuthResponse> => {
  const refreshToken = localStorage.getItem('refresh_token')
  const { data } = await api.post<AuthResponse>('/auth/refresh', {}, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
  return data
}

export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('usuario')
}

//Refresco automantico

export const refreshSession = async () => {

  try {

    console.log('🟡 refreshSession iniciado')

    const refreshToken =
      localStorage.getItem('refresh_token')

    console.log('🟡 refresh token obtenido:')
    console.log(refreshToken)

    console.log('🟡 enviando request refresh...')

    const res = await api.post(
      '/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      }
    )

    console.log('🟢 refresh response OK')
    console.log(res.data)

    return res.data

  } catch (error: any) {

    console.error('🔴 refreshSession ERROR')

    console.error(error)

    console.log('🔴 response:')
    console.log(error?.response)

    console.log('🔴 config:')
    console.log(error?.config)

    console.log('🔴 headers enviados:')
    console.log(error?.config?.headers)

    throw error
  }
}