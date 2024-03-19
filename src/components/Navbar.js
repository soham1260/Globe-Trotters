import React from 'react'
import logout from '../assets/logout.png'
import { Link,useNavigate } from 'react-router-dom'
export default function Navbar() {

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/signup");
  }

  return (
    <nav className="navbar navbar-default" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
    <div className="container">
      <div className="navbar-header">
        <Link className="navbar-brand" to="/">Globe Trotters</Link>
      </div>
        <ul className="nav navbar-nav navbar-right">
          <li id="home"><Link to="/">HOME</Link></li>
          <li id="about"><Link to="/my-posts">MY-POSTS</Link></li>
          <li id="compose"><Link to="/compose">COMPOSE</Link></li>
          <li id="home"><a onClick={handleLogout}>LOGOUT<img src={logout} alt="logout logo" width="16px"/></a></li>
        </ul>
    </div>
  </nav>
  )
}
