import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBW6LppDa-Ba1tpOVAhJx8XR-WH0YsqLBo",
    authDomain: "west-wind-1153b.firebaseapp.com",
    projectId: "west-wind-1153b",
    storageBucket: "west-wind-1153b.appspot.com",
    messagingSenderId: "760080407548",
    appId: "1:760080407548:web:754bc7ed26165a6cab3079",
    measurementId: "G-G9D0QLNY1Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (import.meta.env.DEV) {
    // Connect to Firebase Auth Emulator
    // Note: This disables the production provider, so Google Sign-In flow will change
    import('firebase/auth').then(({ connectAuthEmulator }) => {
        connectAuthEmulator(auth, "http://localhost:9099");
        console.log("Connected to Firebase Auth Emulator at http://localhost:9099");
    });
}

export const googleProvider = new GoogleAuthProvider();
