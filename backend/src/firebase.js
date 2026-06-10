import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const auth = getAuth();
export const db = getFirestore();
export const bucket = process.env.FIREBASE_STORAGE_BUCKET
  ? getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET)
  : null;
export { FieldValue };
