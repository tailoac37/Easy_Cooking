export interface User {
  userId: number
  userName: string
  fullName: string
  email: string
  passwordHash: string
  avatarUrl: string
  bio: string
  role: string
  emailVerified: 0 | 1
  isActive: 0 | 1
  createdAt: string
  updatedAt: string
  token: string
}
