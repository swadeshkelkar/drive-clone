import React, {useEffect} from "react";
import Navbar from "./Navbar";
import GoogleButton from "react-google-button";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
function Auth() {
  let auth = getAuth();
  let googleProvider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const signUp = () => {
    signInWithPopup(auth, googleProvider)
      .then((res) => {
        localStorage.setItem('userEmail', res.user.email);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
  useEffect(() => {
    onAuthStateChanged(auth, user=>{//console.log(user)
    if(user){
        navigate('/drive/')
    }else{
        navigate('/')
    }})
  }, [])
  let props = {nav: false};
  return (
    <><Navbar {...props}/><div className='auth-btn'>
      <h1>Sign In</h1>
      <GoogleButton onClick={signUp} />
    </div>
    </>
  );
}

export default Auth;
