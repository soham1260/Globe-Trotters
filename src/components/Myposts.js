import React,{useContext, useEffect, useRef, useState} from 'react'
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import {postContext} from './state/PostState'
import update from '../assets/update.svg'
import del from '../assets/delete.svg'
import spinner from '../assets/spinner.gif'
export default function Myposts() {
      let navigate = useNavigate();
      const context = useContext(postContext)
      const {posts,getPosts,deletePost} = context;
      const [loading, setLoading] = useState(true);

      useEffect(() => {
          if(localStorage.getItem('token'))
          {
            getPosts()
            .then(() => {
              setLoading(false);
            });
          }
          else
          {
              navigate("/signup");
          }
      },[])
      
      function stripHtmlTags(str) {
        if ((str===null) || (str===''))
          return false;
        else
          str = str.toString();
        return str.replace(/<[^>]*>/g, ' ');
      }
      
      return (
        <div className="container" style={{paddingTop : "5%",paddingBottom: "5%"}}>
          {loading ? 
            <div style={{ display: 'flex', justifyContent: 'center'}}>
              <img src={spinner} alt="loading..." width="100px" />
            </div> :
            posts.map((post) => {
            return (
              <div className="row" key={post._id}>
                <div className='col-md-11'>
                  <h1>{post.title}</h1>
                  <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {stripHtmlTags(post.content).substring(0, 150)}
                    {post.content.length > 150 && <Link to={{ pathname: `/posts/${post._id}`, state: { post } }}>...Read More</Link>}
                  </p>
                  <div style={{fontFamily: "Lucida Sans,Lucida Sans Regular,Lucida Grande,Lucida Sans Unicode, Geneva, Verdana, sans-serif"}}><i><small>{new Date(post.date).toLocaleString()}</small></i></div>
                </div>
                <div className='col-md-1' style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px",width: "2%",padding: "0%"}}>
                  <img style={{paddingTop: "150%"}} src={`${update}`} onClick={() => {navigate(`/updatepost/${post._id}`)}}/>
                  <img src={`${del}`} onClick={() => {deletePost(post._id)}}/>
                </div>
              </div>
            )
          })}
        </div>
      )
      
}
