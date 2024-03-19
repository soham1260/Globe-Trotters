import React,{ useContext,useEffect  } from 'react';
import {postContext} from './state/PostState'
import { useParams,useNavigate  } from 'react-router-dom';
import spinner from '../assets/spinner.gif'
import {jwtDecode} from 'jwt-decode';
export default function Post() {
    let navigate = useNavigate();
    const context = useContext(postContext)
    const {posts,getAllPosts,deletePost} = context;
    useEffect(() => {
    if(localStorage.getItem('token'))
    {
        getAllPosts();
    }
    else
    {
        navigate("/signup");
    }
    },[])

    const { id } = useParams();
    const post = posts.find(post => post._id === id);
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.user.id;
    return (
    <div className='container' style={{paddingTop : "5%",paddingBottom: "5%"}}>
      { !post ? 
        <div style={{ display: 'flex', justifyContent: 'center'}}>
          <img src={spinner} alt="loading..." width="100px" />
        </div> : 
        <><h1>{post.title}</h1>
        <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
        <div style={{fontFamily: "Lucida Sans,Lucida Sans Regular,Lucida Grande,Lucida Sans Unicode, Geneva, Verdana, sans-serif", fontSize: "larger" }}><i>~ {post.name} <br/> <small>{new Date(post.date).toLocaleString()}</small></i></div>
        {userId === post.user && <div className='row' style={{marginTop: "1%"}}>
          <button className="btn btn-class col-md-1" style={{marginLeft: "1%", marginRight: "2%"}} type="submit" name="button" onClick={() => {navigate(`/updatepost/${post._id}`)}}>Edit</button>
          <button className="btn btn-class col-md-1" type="submit" name="button" onClick={() => {deletePost(post._id);navigate("/");}}>Delete</button>
        </div>}
        </>
      }
      
    </div>
  )
}
