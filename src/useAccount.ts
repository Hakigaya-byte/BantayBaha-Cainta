import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase'
import { subscribeToStaffAccess } from './account'

type AccountState = { user: User | null; isStaff: boolean; loading: boolean; error: string }

export function useAccount() {
  const [account, setAccount] = useState<AccountState>({ user: null, isStaff: false, loading: true, error: '' })
  useEffect(() => {
    let stopRole = () => {}
    let generation = 0
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopRole()
      const current = ++generation
      setAccount({ user, isStaff: false, loading: Boolean(user), error: '' })
      if (user) {
        stopRole = subscribeToStaffAccess(user.uid, (isStaff) => {
          if (current === generation) setAccount({ user, isStaff, loading: false, error: '' })
        }, () => {
          if (current === generation) setAccount({ user, isStaff: false, loading: false,
            error: 'Unable to check account access. Check your connection and reload the page.' })
        })
      }
    }, () => {
      stopRole()
      generation++
      setAccount({ user: null, isStaff: false, loading: false, error: 'Unable to load your session. Please reload the page.' })
    })
    return () => { generation++; stopRole(); stopAuth() }
  }, [])
  return account
}
