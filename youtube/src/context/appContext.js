import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [appState, setAppState] = useState("empty");
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      try {
        if (user) {
          setAppState("home");
          setCurrentUser(user);
          console.log(user);
        } else {
          setCurrentUser(null);
          setAppState("login");
        }
      } catch (error) {
        setError(error.message);
      }
    });

    return () => unsubscribeAuth(); // Cleanup function
  }, []);

  useEffect(() => {
    const unsubscribeVideos = db.collection("Videos").onSnapshot(
      (snapshot) => {
        setVideos(snapshot.docs.map((doc) => doc.data()));
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribeVideos(); // Cleanup function
  }, []);

  console.log(videos);
  console.log(currentUser);
  const value = {
    videos,
    appState,
    currentUser,
    showUploadVideo,
    setShowUploadVideo,
    isLoading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
