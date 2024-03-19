import React from 'react'

export default function Delete() {
  return (
    <div className='container'>
      <h1>Delete Post</h1>
        <form className="" action="/delete" method="post">
        <div className="form-group">
            <label>Title</label>
            <input className="form-control" type="text" name="postTitle" placeholder="Enter title of blog to be removed"/>
        </div>
        <button className="btn btn-primary" type="submit" name="button">Delete</button>
        </form>
    </div>
  )
}
