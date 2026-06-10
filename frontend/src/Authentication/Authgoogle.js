import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

const provider = new GoogleAuthProvider();

export const googleSignIn = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user;
};
