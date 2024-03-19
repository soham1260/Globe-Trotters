import React,{useState} from 'react'
import {useNavigate,Link} from 'react-router-dom'
import demo from '../assets/demo.jpg'
export default function Signup() {
	const [Credentials, setCredentials] = useState({name : "", email : "", password : ""});
	const [Error, setError] = useState({ errors: [] });
	let navigate = useNavigate();

		const handleSubmit = async (e) => {
			e.preventDefault();
			const {name , email , password } = Credentials;
			const response = await fetch(`http://localhost:5000/signup`,{method : 'POST',headers : {'Content-Type' : 'application/json'},body : JSON.stringify({name,email,password})});
			const json=await response.json();
			console.log(json);

			if(json.success)
			{
				localStorage.setItem('token',json.authtoken);
				navigate('/');
			}
			else
			{
				setError(json);
			}
		}

	const onChange = (e) => {
		setCredentials({...Credentials,[e.target.name] : e.target.value})
	}
	return (
		<div className="container" style={{backgroundColor : "#1abc9c" , width: "100%"}}>
			<div className="row content">
				<div className="col-md-12">
					<h1 className="header-text" style={{fontSize: "5rem"}}>Globe Trotters</h1>
				</div>
			<div className="col-md-6 mb-3">
			<img src={demo} alt="Image in login page" width="500px"/>
			</div>
			<div className="col-md-6">
				<h2 className="signin-text mb-3">Join Us</h2>
				<form onSubmit={handleSubmit}>
				<div className="form-group formfont">
					<label htmlFor="name">Name</label>
					<input type="name" name="name" className="form-control" onChange={onChange}/>
				</div>
				{
					Error.errors && Error.errors.some(error => error.msg === "password") &&  <p className="error-message">Name must be alteast 3 characters</p>
				}
				<div className="form-group formfont">
					<label htmlFor="email">Email</label>
					<input type="email" name="email" className="form-control" onChange={onChange}/>
				</div>
				{
					Error.errors && Error.errors.some(error => error.msg === "exist") && <p className="error-message">Email already exists, please <Link to="/login" >Login</Link></p>
				}
				{
					Error.errors && Error.errors.some(error => error.msg === "email") && <p className="error-message">Email is required</p>
				}
				<div className="form-group formfont">
					<label htmlFor="password">Password</label>
					<input type="password" name="password" className="form-control" onChange={onChange}/>
				</div>
				{
					Error.errors && Error.errors.some(error => error.msg === "password") && <p className="error-message">Password must be alteast 5 characters</p>
				}
				<div className="form-group">
					Already a traveller, <Link to="/login" >click here</Link> to explore
				</div>
				<button className="btn btn-class">Explore</button>
				</form>
			</div>
			</div>
		</div>
  )
}
