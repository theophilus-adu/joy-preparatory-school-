import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './api'

export const useSchool = () =>
  useQuery({
    queryKey: ['school'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/school')
      return data
    },
  })

export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post('/api/auth/login', credentials)
      localStorage.setItem('access_token', data.access_token)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/users/me')
      return data
    },
    enabled: !!localStorage.getItem('access_token'),
  })

export const useLogout = () => {
  const queryClient = useQueryClient()
  return {
    logout: () => {
      localStorage.removeItem('access_token')
      queryClient.clear()
    },
  }
}
