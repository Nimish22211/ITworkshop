import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAqyOm3bg1zC0y9xWEcmVcD0qtoxespAX0",
    authDomain: "realtime-transport-test.firebaseapp.com",
    projectId: "realtime-transport-test",
    storageBucket: "realtime-transport-test.firebasestorage.app",
    messagingSenderId: "628278034774",
    appId: "1:628278034774:web:846f7430233e9aca3896f7"
};

let app
if (!getApps().length) {
    app = initializeApp(firebaseConfig)
} else {
    app = getApps()[0]
}

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export { signInWithPopup, onAuthStateChanged, signOut }


