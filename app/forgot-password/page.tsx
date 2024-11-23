'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { isLoaded, signIn } = useSignIn()

  if (!isLoaded) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setSuccess(true)
    } catch (err: any) {
      console.error('Error during password reset:', err)
      setError(err.errors[0]?.message || 'An error occurred during password reset.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
        </div>
        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send reset instructions
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              We've sent password reset instructions to your email. Please check your inbox.
            </p>
          </div>
        )}
        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

