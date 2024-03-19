import React,{ useContext,useEffect,useState  } from 'react';
import {postContext} from './state/PostState'
import { useParams,useNavigate  } from 'react-router-dom';
import ReactQuill from 'react-quill';

export default function Update() {

    let navigate = useNavigate();
    const context = useContext(postContext)
    const {posts,getPosts,editPost} = context;
    const { id } = useParams();
    const [Post, setPost] = useState({title : "", content : ""});
    const [Error,setError] = useState({title : false,content : false});
    useEffect(() => {
        if(localStorage.getItem('token'))
        {
            getPosts()
            .then(() => {
                return posts.find(post => post._id === id);
            })
            .then((post) => {
                !post? navigate("/") : setPost({title : post.title,content : post.content})
            })
        }
        else
        {
            navigate("/signup");
        }
        },[])
        
        const handleClick = (e) => {
            e.preventDefault();
            if(!Post.title)
            {
                setError({title : true,content : false});
                if(!Post.content)
                {
                    setError({title : true,content : true});
                }
            }
            else if(!Post.content)
            {
                setError({title : false,content : true})
            }
            else
            {
                editPost(id,Post.title,Post.content);
                navigate('/my-posts')
            }
        }

        const onChange = (e) => {
            if (e.target) {
              setPost({ ...Post, [e.target.name]: e.target.value });
            } else {
              setPost({ ...Post, content: e });
            }
        };

    return (
        <div className='container' style={{paddingTop : "5%",paddingBottom: "5%"}}>
            <h1>Update</h1>
            <form>
            <div className="form-group">
                <label style={{fontSize: "larger"}}>Title</label>
                <input className="form-control" type="text" name="title" value={Post.title} onChange={onChange}/>
                {
                    Error.title && <p className="error-message">Please Enter title</p>
                }
                <label style={{fontSize: "larger", marginTop: "2%"}}>Post</label>
                <ReactQuill value={Post.content} onChange={onChange} />
                {
                    Error.content && <p className="error-message">Please Enter content</p>
                }
            </div>
            <button className="btn btn-class" type="submit" name="button" onClick={handleClick}>Update</button>
            </form>
        </div>
  )
}
