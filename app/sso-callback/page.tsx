'use client'

import { useEffect } from 'react'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn()
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp()
  const router = useRouter()

  useEffect(() => {
    if (isSignInLoaded && isSignUpLoaded) {
      handleCallback()
    }
  }, [isSignInLoaded, isSignUpLoaded])

  async function handleCallback() {
    if (!signIn || !signUp) {
      console.error('SignIn or SignUp is not available')
      router.push('/login')
      return
    }

    try {
      const signInAttempt = await signIn.authenticateWithRedirect({
        strategy: 'oauth_callback',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })

      if (signInAttempt.status === 'complete') {
        await setSignInActive({ session: signInAttempt.createdSessionId })
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error during sign in:', error)
    }

    try {
      const signUpAttempt = await signUp.authenticateWithRedirect({
        strategy: 'oauth_callback',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })

      if (signUpAttempt.status === 'complete') {
        await setSignUpActive({ session: signUpAttempt.createdSessionId })
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error during sign up:', error)
    }

    console.error('Something went wrong during the OAuth flow. Try again.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Processing your authentication...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we complete your sign-in or sign-up process.
          </p>
        </div>
      </div>
    </div>
  )
}

