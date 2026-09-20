import React, { useState, useEffect } from 'react';

import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import './LoginPage.css';

function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [incorrect, setIncorrect] = useState('');

	const [showerr, setShowerr] = useState('');

    const {setIsLoggedIn} = useAppContext(); // link to system's monitoring variable

    const bearerToken = sessionStorage.getItem('bearer-token'); // ?

    const navigate = useNavigate();

    // we need another logic to handle a case user already login:
    // but this logic need to be run-after-render, so we need to put this inside useEffect
    useEffect(() => {
       if(sessionStorage.getItem('auth-token')){
                navigate('/app');
            }
        }, [navigate] // if [] -> only 1st mount; [navigate] - when navigate is changed
        // React wants to make sure it always has the most fresh, up-to-date version of that function
        // so any function or variable use inside this useEffect should put here
    )

    const handleLogin = async() =>
    {
        try{
            // prepare what to pass to fetch()
            const fetchUrl = `${urlConfig.backendUrl}/api/auth/login`;
            // since login use POST method, here will pass option to fetch as 2nd parameter
            const option = {};
            option.method = 'POST';
            option.headers = 
            {
                'content-type': 'application/json',
                'Authorization': bearerToken ? `Bearer ${bearerToken}` : '', // ??? Include Bearer token if available
            };
            option.body = JSON.stringify(
            {
        	    email: email,
			    password: password
            }
            );

            // call fetch
            const response = await fetch(fetchUrl, option);

            // convert response data to json
            const fetchResult = response.json();

            // check what the login-endpoint from backend what will be returned:
            // return res.status(200).json({authtoken, userName, userEmail });

            if(fetchResult.authtoken){
                sessionStorage.setItem('auth-token', fetchResult.authtoken);
			    sessionStorage.setItem('name', fetchResult.userName);
			    sessionStorage.setItem('email', fetchResult.email);

                setIsLoggedIn(true);
                navigate('/app');
            }
            else{
                document.getElementById("email").value="";
                document.getElementById("password").value="";
                setIncorrect("Wrong password. Try again.");
                setTimeout(() => {
                setIncorrect("");
                }, 2000);
            }

            // client side no logic to determine what kind of error, only receive from server
            if (fetchResult.error) {
			    setShowerr(fetchResult.error);
		    }
        
        }catch(e){
            console.log("Error fetching details: " + e.message);
        }




    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {setEmail(e.target.value); setIncorrect("")}}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {setPassword(e.target.value);setIncorrect("")}}
                            />

							{/*Step 2: Task 6*/}
                            <div className="text-danger">{showerr}</div>
                            <span style={{color:'red',height:'.5cm',display:'block',fontStyle:'italic',fontSize:'12px'}}>{incorrect}</span>
                        </div>
                        <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>Login</button>
                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;