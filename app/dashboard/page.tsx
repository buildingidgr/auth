'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  const router = useRouter()

  if (!isLoaded || !userId) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Welcome to your Dashboard</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You are signed in with user ID: {userId}
          </p>
        </div>
      </div>
    </div>
  )
}

