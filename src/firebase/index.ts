'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase.
 * Uses a safe probe to check for App Hosting environment variables 
 * before falling back to the local config object to prevent app/no-options errors.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Probing for App Hosting environment variables safely
      // In many environments, initializeApp() with no args throws if options are missing.
      // We only attempt it if we're not in a typical local dev setup without vars.
      if (process.env.NODE_ENV === "production" && !firebaseConfig.apiKey) {
        firebaseApp = initializeApp();
      } else {
        firebaseApp = initializeApp(firebaseConfig);
      }
    } catch (e) {
      // Fallback to the hardcoded config if automatic init fails
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
