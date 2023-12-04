import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyAhaLMdWa8A9o7cfxum72pQL34oHsRXwS0",
  authDomain: "fir-5d300.firebaseapp.com",
  projectId: "fir-5d300",
  storageBucket: "fir-5d300.appspot.com",
  messagingSenderId: "460638741656",
  appId: "1:460638741656:web:417f45dfa18367b9841ced",
  measurementId: "G-DR98LG3DTV",
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
