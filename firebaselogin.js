import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDL2fGCvbAq3MFqUu1kdoNH5QujrBgdIL0",
    authDomain: "galeria-virtual-ca31e.firebaseapp.com",
    projectId: "galeria-virtual-ca31e",
    storageBucket: "galeria-virtual-ca31e.firebasestorage.app",
    messagingSenderId: "995853556041",
    appId: "1:995853556041:web:e33cfc53d0566ec68c6298",
    measurementId: "G-HLNF9Q89VQ"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const token = await user.getIdTokenResult(true);
        console.log("Claims del usuario:", token.claims);

        if (token.claims.role) {
            localStorage.setItem("userRole", token.claims.role);
        } else {
            localStorage.removeItem("userRole");
        }
    } else {
        localStorage.removeItem("userRole");
    }
});


export {
    auth,
    provider,
    db,
    storage,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    getDoc,
    doc,
    setDoc,
    serverTimestamp,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    storageRef,
    uploadBytes,
    getDownloadURL
};

