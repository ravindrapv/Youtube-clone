import React, { useState, useEffect } from "react";
import "./styles.css";
import {
  MoreHoriz,
  PlaylistAdd,
  Reply,
  ThumbDownAlt,
  ThumbUpAlt,
} from "@material-ui/icons";
import { Avatar, Button } from "@material-ui/core";
import moment from "moment";
import firebase from "firebase/app";
import "firebase/firestore";
import { useHistory } from "react-router-dom";
import { useAppContext } from "../../context/appContext";

const Watch = ({ video }) => {
  const { currentUser } = useAppContext();
  const history = useHistory();
  const handleAvatarRedirect = () => history.push("/PreviewChannel");
  const [showDesc, setShowDesc] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setNewComment] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const db = firebase.firestore();

  // Fetch subscribers from Firebase
  // Check if the current user is subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (currentUser) {
        const userSubscriptionsRef = db
          .collection("subscribers")
          .doc(video.channelId)
          .collection("users");

        try {
          const userSubscriptionDoc = await userSubscriptionsRef
            .doc(currentUser.uid)
            .get();

          const isSubscribed = userSubscriptionDoc.exists;
          setSubscribed(isSubscribed);

          // Save subscription status to local storage
          localStorage.setItem(
            "subscriptionStatus",
            JSON.stringify(isSubscribed)
          );
        } catch (error) {
          console.error("Error checking subscription status:", error.message);
        }
      }
    };

    checkSubscription();
  }, [currentUser, video.channelId, db]);

  // Check if the current user is subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (currentUser) {
        const userSubscriptionsRef = db
          .collection("subscribers")
          .doc(video.channelId)
          .collection("users");

        const userSubscriptionDoc = await userSubscriptionsRef
          .doc(currentUser.uid)
          .get();

        const isSubscribed = userSubscriptionDoc.exists;
        setSubscribed(isSubscribed);

        // Save subscription status to local storage
        localStorage.setItem(
          "subscriptionStatus",
          JSON.stringify(isSubscribed)
        );
      }
    };

    checkSubscription();
  }, [currentUser, video.channelId, db]);

  // Fetch comments from Firebase
  useEffect(() => {
    const videoCommentsRef = db
      .collection("comments")
      .doc(video.id)
      .collection("comments");

    const unsubscribe = videoCommentsRef.onSnapshot((snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [video.id, db]);

  const handleAddComment = async () => {
    const videoCommentsRef = db
      .collection("comments")
      .doc(video.id)
      .collection("comments");

    await videoCommentsRef.add({
      user: currentUser.displayName, // Assuming user.displayName is available
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setNewComment(""); // Clear input after commenting
  };

  const handleSubscribe = async () => {
    if (currentUser) {
      const userSubscriptionsRef = db
        .collection("subscribers")
        .doc(video.channelId)
        .collection("users");

      // Check if the user is already subscribed
      const userSubscriptionDoc = await userSubscriptionsRef
        .doc(currentUser.uid)
        .get();

      if (!userSubscriptionDoc.exists) {
        // User is not subscribed, update Firestore
        await userSubscriptionsRef.doc(currentUser.uid).set({
          subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Update subscriber count
        updateSubscribers();
      }

      setSubscribed(true); // Update local state

      // Save subscription status to local storage
      localStorage.setItem("subscriptionStatus", JSON.stringify(true));
    }
  };

  const updateSubscribers = async () => {
    const channelDocRef = db.collection("subscribers").doc(video.channelId);
    try {
      const channelDoc = await channelDocRef.get();
      const currentSubscribers = channelDoc.exists
        ? channelDoc.data().subscribers || 0
        : 0;

      // Use set with merge option if the document doesn't exist
      await channelDocRef.set(
        {
          subscribers: currentSubscribers + 1,
        },
        { merge: true }
      );

      console.log("Successfully subscribed!");

      // Update the subscribers state after the count is updated in the database
      setSubscribers(currentSubscribers + 1);
    } catch (error) {
      console.error("Error updating channel subscribers:", error.message);
    }
  };

  const formatted = moment
    .unix(video?.timestamp?.seconds)
    .format("MMM DD, YYYY  ");

  // Retrieve subscription status from local storage on component mount
  useEffect(() => {
    const storedSubscriptionStatus = localStorage.getItem("subscriptionStatus");
    if (storedSubscriptionStatus) {
      setSubscribed(JSON.parse(storedSubscriptionStatus));
    }
  }, []);

  return (
    <div className="watch">
      <div className="watch__wrap">
        <div className="watch__left">
          <video className="watch__video" autoPlay controls>
            <source src={video.videoURL} type="video/mp4" />
          </video>

          <div className="watch__leftBtm">
            <h1 className="watch__title">{video.title}</h1>

            <div className="watch__videoInfo">
              <div className="watch__videoInfoLeft">
                <p className="videothumb__text">1 views • {formatted}</p>
              </div>

              <div className="watch__videoInfoRight">
                {/* Like, dislike, share, save buttons */}
              </div>
            </div>
          </div>

          <div className="watch__details">
            <div className="watch__detailsContainer">
              <div className="videothumb__details watch__avatarWrap">
                <Avatar
                  style={{ cursor: "pointer" }}
                  onClick={handleAvatarRedirect}
                />
                <div className="videothumb__channel">
                  <h1 className="videothumb__title">{video.channelName}</h1>
                  <p className="videothumb__text watch__subCount">
                    {subscribers} Subscribers
                  </p>
                </div>
              </div>
              <Button
                className="watch__subBtn"
                color="primary"
                variant="contained"
                onClick={handleSubscribe}
                disabled={subscribed} // Disable button if already subscribed
              >
                {subscribed ? "SUBSCRIBED" : "SUBSCRIBE"}
              </Button>
            </div>

            <div className="watch__description">
              <p style={{ maxHeight: showDesc && "100%" }}>
                {video.description}
              </p>
              <p
                className="watch__showMore"
                onClick={() => setShowDesc(!showDesc)}
              >
                SHOW {showDesc ? "LESS" : "MORE"}
              </p>
            </div>

            <div className="watch__comments">
              <h2>Comments</h2>
              {comments.map((comment) => (
                <div key={comment.id} className="watch__comment">
                  <Avatar className="watch__commentAvatar" />
                  <div className="watch__commentDetails">
                    <p className="watch__commentUser">{comment.user}</p>
                    <p className="watch__commentText">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="watch__addComment">
              <Avatar className="watch__commentAvatar" />
              <input
                type="text"
                placeholder="Add a public comment..."
                onChange={(e) => setNewComment(e.target.value)}
                value={comment}
              />
              <Button onClick={handleAddComment}>Comment</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
