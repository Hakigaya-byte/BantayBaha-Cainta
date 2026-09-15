import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

// Only a project administrator can create staff records. The browser cannot
// grant this role; Firestore rules enforce the same active-record check.
export function subscribeToStaffAccess(
  uid: string,
  onChange: (isStaff: boolean) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(doc(db, 'staff', uid), (snapshot) => {
    onChange(snapshot.exists() && snapshot.data().active === true)
  }, onError)
}

export function authErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email already has an account. Choose Sign in to continue.'
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return 'Choose a stronger password that meets the password requirements.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a while before trying again.'
    case 'auth/network-request-failed':
      return 'Cannot connect. Check your internet connection and try again.'
    default:
      return 'Unable to sign in. Check your email and password, then try again.'
  }
}
