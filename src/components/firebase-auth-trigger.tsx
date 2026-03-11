
'use client';

import { useEffect } from 'react';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';

/**
 * A simple component that ensures the user is at least signed in anonymously
 * so they have a UID for Firestore data ownership.
 */
export function AuthTrigger() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If auth is initialized, and we're not currently loading user state,
    // and there is no user signed in, then initiate anonymous sign-in.
    if (auth && !isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  return null;
}
