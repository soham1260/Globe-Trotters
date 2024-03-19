import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { postContext } from "./state/PostState";
import spinner from "../assets/spinner.gif";
export default function Data() {
  let navigate = useNavigate();
  const context = useContext(postContext);
  const { posts, getAllPosts } = context;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getAllPosts().then(() => {
        setLoading(false);
      });
    } else {
      navigate("/signup");
    }
  }, []);
  const startingContent =
    "Globe Trotters, a travel blog for those who love to explore the world and its wonders. Whether you’re looking for inspiration, tips, or stories, you’ll find them here. We as a community share our adventures and experiences from different countries and cultures. We’ll show you the best places to visit, the most amazing things to do, and the most delicious food to eat. We’ll also give you honest and helpful advice on how to travel smarter, cheaper, and better. Globe Trotters is more than just a travel blog. It’s a community of passionate travellers who want to make the most of their journeys and live their dreams 😊";

  function stripHtmlTags(str) {
    if (str === null || str === "") return false;
    else str = str.toString();
    return str.replace(/<[^>]*>/g, " ");
  }
  return (
    <div
      className="container"
      style={{ paddingTop: "5%", paddingBottom: "5%" }}
    >
      <h1
        style={{
          textAlign: "center",
          fontFamily: "'Times New Roman', Times, serif",
        }}
      >
        Globe Trotters
      </h1>
      <p style={{ textAlign: "center", marginBottom: "3%" }}>
        {startingContent}
      </p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={spinner} alt="loading..." width="100px" />
        </div>
      ) : (
        posts.map((post) => {
          return (
            <div key={post._id}>
              <h1>{post.title}</h1>
              <p style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {stripHtmlTags(post.content).substring(0, 150)}
                {post.content.length > 150 && (
                  <Link
                    to={{ pathname: `/posts/${post._id}`, state: { post } }}
                  >
                    ...Read More
                  </Link>
                )}
              </p>
              <div
                style={{
                  fontFamily:
                    "Lucida Sans,Lucida Sans Regular,Lucida Grande,Lucida Sans Unicode, Geneva, Verdana, sans-serif",
                }}
              >
                <i>
                  ~ {post.name} <br />{" "}
                  <small>{new Date(post.date).toLocaleString()}</small>
                </i>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
