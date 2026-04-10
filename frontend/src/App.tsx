import { useEffect, useState } from 'react'
import {
  type ConfirmationResult,
  type User,
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut,
  signInWithPhoneNumber,
} from 'firebase/auth'

import {
  type ConsentRequest,
  type DemoAccount,
  FinanceDashboard,
  type StatementSync,
  type Workspace,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { AuthPage } from '@/components/ui/auth-page'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase'

const DEFAULT_API_BASE = 'https://beyond-the-wallet-backend-j5l6473pwa-uc.a.run.app'
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE).replace(/\/+$/, '')

interface ConsentVerificationResponse extends ConsentRequest {
  insights_ready: boolean
  detail?: string
  workspace?: Workspace
}

interface StatementSyncStatusResponse {
  phone_number: string
  workspace: Workspace | null
  sync: StatementSync
}

interface StatementUploadResponse {
  detail: string
  workspace: Workspace
  sync: StatementSync
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init)
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`

    try {
      const payload = await response.json()
      if (payload?.detail) {
        detail = payload.detail
      }
    } catch {
      // Preserve the HTTP fallback message.
    }

    throw new Error(detail)
  }

  return response.json() as Promise<T>
}

function App() {
  const [isDark, setIsDark] = useState(false)
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([])
  const [loginPhoneNumber, setLoginPhoneNumber] = useState('')
  const [loginOtpCode, setLoginOtpCode] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [authVerifying, setAuthVerifying] = useState(false)
  const [authSigningOut, setAuthSigningOut] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [consentRequest, setConsentRequest] = useState<ConsentRequest | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [statementSync, setStatementSync] = useState<StatementSync | null>(null)
  const [statementProvider, setStatementProvider] = useState('MTN MoMo')
  const [statementFile, setStatementFile] = useState<File | null>(null)
  const [uploadingStatement, setUploadingStatement] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [statusDetail, setStatusDetail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('btw-theme')
    setIsDark(storedTheme === 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem('btw-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const loadDemoAccounts = async () => {
      try {
        const accounts = await fetchJson<DemoAccount[]>('/demo-accounts')
        setDemoAccounts(accounts)
        if (accounts[0]) {
          setPhoneNumber(accounts[0].phone_number)
          setLoginPhoneNumber(accounts[0].phone_number)
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load wallet accounts.')
      } finally {
        setLoading(false)
      }
    }

    loadDemoAccounts()
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setAuthLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user)
      if (user?.phoneNumber) {
        const normalizedPhone = user.phoneNumber.replace(/^\+/, '')
        setLoginPhoneNumber(normalizedPhone)
        setPhoneNumber(normalizedPhone)
      }
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const loadStatementSync = async () => {
      if (!currentUser) {
        setStatementSync(null)
        return
      }

      try {
        const idToken = await currentUser.getIdToken()
        const currentPhone = (currentUser.phoneNumber ?? loginPhoneNumber).replace(/^\+/, '')
        const response = await fetchJson<StatementSyncStatusResponse>(
          `/statement-sync-status?phone_number=${encodeURIComponent(currentPhone)}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          },
        )
        setStatementSync(response.sync)
        if (response.workspace) {
          setWorkspace(response.workspace)
        }
      } catch (caughtError) {
        setUploadError(caughtError instanceof Error ? caughtError.message : 'Unable to load statement sync status.')
      }
    }

    loadStatementSync()
  }, [currentUser, loginPhoneNumber])

  const setupRecaptcha = () => {
    if (!firebaseAuth) {
      throw new Error('Firebase auth is not configured.')
    }

    const existingVerifier = window.recaptchaVerifier
    if (existingVerifier) {
      return existingVerifier
    }

    const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
      size: 'normal',
    })

    window.recaptchaVerifier = verifier
    return verifier
  }

  const resetRecaptcha = async () => {
    const verifier = window.recaptchaVerifier
    if (!verifier) {
      return
    }

    try {
      const widgetId = await verifier.render()
      if (typeof window.grecaptcha !== 'undefined') {
        window.grecaptcha.reset(widgetId)
      }
    } catch {
      // Ignore reset failures and allow the next request to recreate the verifier.
    }
  }

  const handleRequestLoginOtp = async () => {
    if (!firebaseAuth) {
      setAuthError('Firebase phone authentication is not configured yet.')
      return
    }

    setAuthSubmitting(true)
    setAuthError(null)

    try {
      const verifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(firebaseAuth, `+${loginPhoneNumber.replace(/^\+/, '')}`, verifier)
      setConfirmationResult(result)
    } catch (caughtError) {
      await resetRecaptcha()
      setAuthError(caughtError instanceof Error ? caughtError.message : 'Unable to send login code.')
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleVerifyLoginOtp = async () => {
    if (!confirmationResult) {
      return
    }

    setAuthVerifying(true)
    setAuthError(null)

    try {
      const result = await confirmationResult.confirm(loginOtpCode)
      setCurrentUser(result.user)
      setPhoneNumber((result.user.phoneNumber ?? loginPhoneNumber).replace(/^\+/, ''))
      setConfirmationResult(null)
      setLoginOtpCode('')
    } catch (caughtError) {
      setAuthError(caughtError instanceof Error ? caughtError.message : 'Unable to verify login code.')
    } finally {
      setAuthVerifying(false)
    }
  }

  const handleRequestConsent = async () => {
    if (!currentUser) {
      setError('Sign in with your phone number before requesting wallet access.')
      return
    }

    setSubmitting(true)
    setError(null)
    setStatusDetail(null)
    setWorkspace(null)

    try {
      const idToken = await currentUser.getIdToken()
      const response = await fetchJson<ConsentRequest>('/consent-requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      })

      setConsentRequest(response)
      setOtpCode(response.demo_otp ?? '')
      setStatusDetail(response.approval_message)
    } catch (caughtError) {
      setConsentRequest(null)
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to request wallet approval.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyConsent = async () => {
    if (!consentRequest || !currentUser) {
      return
    }

    setVerifying(true)
    setError(null)

    try {
      const idToken = await currentUser.getIdToken()
      const response = await fetchJson<ConsentVerificationResponse>(
        `/consent-requests/${consentRequest.request_id}/verify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otp_code: otpCode }),
        },
      )

      setConsentRequest(response)
      setStatusDetail(response.detail ?? 'Wallet approval confirmed.')
      setWorkspace(response.workspace ?? null)
      setStatementSync(response.workspace?.sync ?? statementSync)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to verify wallet approval.')
    } finally {
      setVerifying(false)
    }
  }

  const handleUploadStatement = async () => {
    if (!currentUser) {
      setUploadError('Sign in before uploading a statement.')
      return
    }

    if (!statementFile) {
      setUploadError('Choose a statement file before uploading.')
      return
    }

    setUploadingStatement(true)
    setUploadError(null)
    setStatusDetail(null)

    try {
      const fileContent = await statementFile.arrayBuffer()
      const bytes = new Uint8Array(fileContent)
      let binary = ''
      for (const byte of bytes) {
        binary += String.fromCharCode(byte)
      }
      const contentBase64 = btoa(binary)
      const idToken = await currentUser.getIdToken()
      const response = await fetchJson<StatementUploadResponse>('/statement-uploads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: statementProvider,
          phone_number: phoneNumber || (currentUser.phoneNumber ?? '').replace(/^\+/, ''),
          filename: statementFile.name,
          mime_type: statementFile.type || 'application/octet-stream',
          content_base64: contentBase64,
        }),
      })

      setWorkspace(response.workspace)
      setStatementSync(response.sync)
      setStatusDetail(response.detail)
      setStatementFile(null)
    } catch (caughtError) {
      setUploadError(caughtError instanceof Error ? caughtError.message : 'Unable to upload the statement.')
    } finally {
      setUploadingStatement(false)
    }
  }

  const handleSignOut = async () => {
    setAuthSigningOut(true)
    setAuthError(null)
    setError(null)
    setStatusDetail(null)

    try {
      if (firebaseAuth) {
        await signOut(firebaseAuth)
      }
    } catch (caughtError) {
      setAuthError(caughtError instanceof Error ? caughtError.message : 'Unable to sign out right now.')
    } finally {
      setCurrentUser(null)
      setConfirmationResult(null)
      setLoginOtpCode('')
      setConsentRequest(null)
      setWorkspace(null)
      setStatementSync(null)
      setStatementFile(null)
      setUploadError(null)
      setOtpCode('')
      setStatusDetail(null)
      setError(null)
      setAuthSigningOut(false)
    }
  }

  if (!currentUser) {
    return (
      <AuthPage
        isDark={isDark}
        onToggleTheme={() => setIsDark((current) => !current)}
        isFirebaseConfigured={isFirebaseConfigured}
        authLoading={authLoading}
        authSubmitting={authSubmitting}
        authVerifying={authVerifying}
        authError={authError}
        loginPhoneNumber={loginPhoneNumber}
        loginOtpCode={loginOtpCode}
        confirmationPending={Boolean(confirmationResult)}
        setLoginPhoneNumber={setLoginPhoneNumber}
        setLoginOtpCode={setLoginOtpCode}
        onSendOtp={handleRequestLoginOtp}
        onVerifyOtp={handleVerifyLoginOtp}
      />
    )
  }

  return (
    <FinanceDashboard
      isDark={isDark}
      onToggleTheme={() => setIsDark((current) => !current)}
      onSignOut={handleSignOut}
      currentUserPhone={currentUser.phoneNumber ?? loginPhoneNumber}
      loading={loading}
      signingOut={authSigningOut}
      submitting={submitting}
      verifying={verifying}
      error={error}
      statusDetail={statusDetail}
      demoAccounts={demoAccounts}
      phoneNumber={phoneNumber}
      otpCode={otpCode}
      consentRequest={consentRequest}
      workspace={workspace}
      statementSync={statementSync}
      statementProvider={statementProvider}
      statementFileName={statementFile?.name ?? null}
      uploadError={uploadError}
      uploadingStatement={uploadingStatement}
      setPhoneNumber={setPhoneNumber}
      setOtpCode={setOtpCode}
      setStatementProvider={setStatementProvider}
      onStatementFileSelected={setStatementFile}
      onUploadStatement={handleUploadStatement}
      onRequestConsent={handleRequestConsent}
      onVerifyConsent={handleVerifyConsent}
    />
  )
}

export default App

declare global {
  interface Window {
    grecaptcha?: {
      reset: (widgetId?: number) => void
    }
    recaptchaVerifier?: RecaptchaVerifier
  }
}
