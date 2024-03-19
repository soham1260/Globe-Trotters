import React from 'react'
import { createContext,useState } from "react";
import { useNavigate } from 'react-router-dom';
export const postContext = createContext();

export default function PostState(props) {
    const postsInitial = []

    const [posts, setposts] = useState(postsInitial)

    const navigate = useNavigate();

    const getPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/fetchposts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
          }
        });
    
        if (!response.ok) {
          throw new Error('Token is invalid or request failed');
        }
    
        const json = await response.json();
        setposts(json);
      } catch (error) {
        console.error(error);
        navigate("/signup");
      }
    };
    

    const getAllPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/fetchallposts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
          }
        });
    
        if (!response.ok) {
          throw new Error('Token is invalid or request failed');
        }
    
        const json = await response.json();
        setposts(json);
      } catch (error) {
        console.error(error);
        navigate("/signup");
      }
    };

    const addPost = async (title,content) => {

      const response = await fetch(`http://localhost:5000/compose`,{method : 'POST',headers : {'Content-Type' : 'application/json','auth-token' : localStorage.getItem('token')},body : JSON.stringify({title,content})});
      const json=await response.json();
      setposts(posts.concat(json))
    }

    const deletePost = async (id) => {
      const response = await fetch(`http://localhost:5000/deletepost/${id}`,{method : 'DELETE',headers : {'Content-Type' : 'application/json','auth-token' : localStorage.getItem('token')}});
      const newpost = posts.filter((post) => {return post._id !== id});
      setposts(newpost);
    }

    const editPost = async (id,title,content) => {

      const response = await fetch(`http://localhost:5000/updatepost/${id}`,{method : 'PUT',headers : {'Content-Type' : 'application/json','auth-token' : localStorage.getItem('token')},body : JSON.stringify({title,content})});
      const json=await response.json();

      let newposts = JSON.parse(JSON.stringify(posts));

      for(let index=0;index<newposts.length;index++)
      {
        const element = newposts[index];
        if(element._id === id)
        {
          newposts[index].title=title;
          newposts[index].content=content;
          break;
        }
      }
      setposts(newposts);
    }

  return (
      <postContext.Provider value={{posts,addPost , deletePost , editPost, getPosts, getAllPosts}}>
          {props.children}
      </postContext.Provider>
  )
}
