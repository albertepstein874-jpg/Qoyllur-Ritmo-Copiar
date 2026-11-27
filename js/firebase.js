
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  runTransaction,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

// Configuración del proyecto Qoyllur Ritmo
const firebaseConfig = {
  apiKey: "AIzaSyB09Fwo1jkcFPk3hBfZMQ1foyizmeMI-LA",
  authDomain: "qoyllur-ritmo-78673.firebaseapp.com",
  projectId: "qoyllur-ritmo-78673",
  storageBucket: "qoyllur-ritmo-78673.firebasestorage.app",
  messagingSenderId: "131400591588",
  appId: "1:131400591588:web:1688911238e14cd6cfa4f1"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);

// Servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Proveedor de Google
const googleProvider = new GoogleAuthProvider();

// Persistencia de sesión en el navegador
const ready = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.info('Firebase: persistencia configurada.');

    window.dispatchEvent(
      new CustomEvent('qr:firebase-ready')
    );

    return true;
  })
  .catch(error => {
    console.error('Firebase: error de inicialización.', error);

    window.dispatchEvent(
      new CustomEvent('qr:firebase-error', {
        detail: { code: error.code }
      })
    );

    return false;
  });

// API compartida con los demás archivos
window.QR_FIREBASE = Object.freeze({
  app,
  auth,
  db,
  googleProvider,
  ready,

  // Authentication
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,

  // Persistencia
  setPersistence,
  browserLocalPersistence,

  // Firestore
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  runTransaction,
  writeBatch
});

console.info('Firebase: servicios inicializados.');
