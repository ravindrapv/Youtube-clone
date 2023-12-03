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
import { VideoSmall } from "..";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { useAppContext } from "../../context/appContext";
import firebase from "firebase/app";
import "firebase/firestore";

const Watch = ({ video }) => {
  const history = useHistory();
  const handleAvatarRedirect = () => history.push("/PreviewChannel");
  const [showDesc, setShowDesc] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setNewComment] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const { videos } = useAppContext();

  const db = firebase.firestore();

  // Fetch subscribers from Firebase
  useEffect(() => {
    const unsubscribe = db
      .collection("subscribers")
      .doc(video.channelId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setSubscribers(doc.data().subscribers);
        } else {
          setSubscribers([]);
        }
      });

    return () => unsubscribe();
  }, [video.channelId, db]);

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
      user: video.channelName,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setNewComment(""); // Clear input after commenting
  };

  async function updateSubscribers() {
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
  }

  const formatted = moment
    .unix(video?.timestamp?.seconds)
    .format("MMM DD, YYYY  ");

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
                <p className="videothumb__text">123k views • {formatted}</p>
              </div>

              <div className="watch__videoInfoRight">
                <div className="watch__likeContainer">
                  <div className="watch__likeWrap">
                    <div className="watch__likeBtnContainer color--gray">
                      <ThumbUpAlt className="watch__icon" />
                      <p>15k</p>
                    </div>

                    <div className="watch__likeBtnContainer color--gray">
                      <ThumbDownAlt className="watch__icon" />
                      <p>200</p>
                    </div>
                  </div>

                  <div className="watch__likeDislikes" />
                </div>

                <div className="watch__likeBtnContainer color--gray">
                  <Reply className="watch__icon share-icon" />
                  <p>SHARE</p>
                </div>

                <div className="watch__likeBtnContainer color--gray">
                  <PlaylistAdd className="watch__icon play-addIcon" />
                  <p>SAVE</p>
                </div>

                <div className="watch__likeBtnContainer color--gray">
                  <MoreHoriz className="watch__icon play-addIcon" />
                  <p>SAVE</p>
                </div>
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
                onClick={updateSubscribers}
              >
                SUBSCRIBE
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
