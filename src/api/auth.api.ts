import api from '../lib/axios'

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: number
    email: string
    name: string
  }
}

export const login = async (dto: LoginDto): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', dto)
  return data
}

export const logout = () => {
  localStorage.removeItem('token')
  window.location.href = '/login'
}

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile')
  return data
}