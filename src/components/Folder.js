import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ProgressBar from "./Progress";
import { signOut, getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

function Folder({database}) {
  const auth = getAuth();
  const storage = getStorage();
  const [files, setFiles] = useState([]); let userEmail = localStorage.getItem('userEmail');
  const navigate = useNavigate(); const [progress, setProgress] = useState(null);
  const params = useParams();
  const databaseRef = doc(database, 'driveData', params?.id);
  const [folderName, setFolderName] = useState('');
  const getFile = (e) => {
    
    const fileRef = ref(storage, e.target.files[0].name);
    const uploadTask = uploadBytesResumable(fileRef, e.target.files[0]);

    uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    setProgress(Math.round(progress));
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
    console.log(error);
  }, 
  () => {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      updateDoc(databaseRef, {filesArray: [...files, {userEmail: userEmail, downloadURL: downloadURL, fileName: e.target.files[0].name}]})

      setProgress(null)
    });
  }
);
};
  const goBack = () =>{navigate('/drive/')}
  const readData = () =>{
    onSnapshot(databaseRef, (doc)=>{
      // console.log(doc.data())
      setFiles(doc.data().filesArray);
      setFolderName(doc.data().folderName);
    })
  }
  useEffect(()=>{
    readData();
  },[])
  const openFile = (id)=>{window.open(id, '_blank')}
  
  const logout = () => {
    signOut(auth)
      .then(()=>{localStorage.removeItem('userEmail');
      navigate("/")})
      .catch((err) => alert(err.message));
  };

  let props = { getFile: getFile, goBack: goBack, logout: logout, type: 'Folder', folderName: folderName, nav: true };
  return (
    <div><Navbar {...props}/>     
      <div className="title"><h3>{folderName}</h3></div>



<div className="progress-bar">{progress && <ProgressBar pc={progress}/>}</div>
<div className="title">
        <h3>Files</h3>
      </div>
      <div className='grid-parent'>
        {files.map((file) => file.userEmail === userEmail && file.downloadURL && (
          <div
            className='grid-child'
            key={file.downloadURL}
            onClick={() =>
              
                openFile(file.downloadURL)
            }
          >
            <p>{file.fileName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Folder;
