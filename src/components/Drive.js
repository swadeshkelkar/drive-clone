import React, { useEffect, useState } from "react";
import { Modal, Input } from "antd";
import ProgressBar from "./Progress";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
function Drive({ database }) {
  const storage = getStorage(); let userEmail=localStorage.getItem('userEmail');
  let navigate = useNavigate();
  let auth = getAuth();
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const collectionRef = collection(database, "driveData");
  const showModal = () => {
    setIsModalOpen(true);
  };

  const folderUpload = () => {
    setIsModalOpen(false);
    addDoc(collectionRef, { userEmail: userEmail,
      folderName: folderName,
      filesArray: [{ downloadURL: "", fileName: "" }],
    })
      .then(() => {})
      .catch((err) => {
        alert(err.message);
      });
    setFolderName("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const readData = () => {
    onSnapshot(collectionRef, (data) => {
      setFolders(
        data.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        })
      );
    });
  };
  const openFolder = (id) => {
    navigate(`/folder/${id}`);
  };
  const redirect = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/drive/");
      } else {
        navigate("/");
      }
    });
  };
  useEffect(() => {
    readData();
    redirect();
  }, []);
  const getFile = (e) => {
    const fileRef = ref(storage, e.target.files[0].name);
    const uploadTask = uploadBytesResumable(fileRef, e.target.files[0]);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.round(progress));
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
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
          addDoc(collectionRef, { userEmail: userEmail,
            fileName: e.target.files[0].name,
            downloadURL: downloadURL,
          });

          setProgress(null);
        });
      }
    );
  };
  const openFile = (id) => {
    window.open(id, "_blank");
  };

  const logout = () => {
    signOut(auth)
      .then(() =>{navigate("/"); localStorage.removeItem('userEmail')})
      .catch((err) => alert(err.message));
  };

  let props = { getFile: getFile, showModal: showModal, logout: logout, type: 'Root', nav: true };
  return (
    <div>
      <Navbar {...props} />
      <div className="container">
      <div className='progress-bar'>
        {progress && <ProgressBar pc={progress} />}
      </div>
      <div className="title">
        <h3>Folders</h3>
        
      </div>

      <div className='grid-parent'>
        {folders.map((folder) => folder.userEmail === userEmail && folder.filesArray && (
          <div
            className='grid-child'
            key={folder.id}
            onClick={() =>
          
               openFolder(folder.id)
               
            }
          >
            <p>{folder.folderName}</p>
          </div>
        ))}
      </div>

      
      
      <div className="title">
        <h3>Files</h3>
      </div>
      <div className='grid-parent'>
        {folders.map((file) => file.userEmail === userEmail && file.downloadURL && (
          <div
            className='grid-child'
            key={file.id}
            onClick={() =>
              
                  openFile(file.downloadURL)
            }
          >
            <p>{file.fileName}</p>
          </div>
        ))}
        
      </div>
      <Modal
        title='Folder Upload'
        open={isModalOpen}
        onOk={folderUpload}
        onCancel={handleCancel}
        centered
      >
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder='Enter folder name...'
        />
      </Modal>
      </div>
    </div>
  );
}

export default Drive;
