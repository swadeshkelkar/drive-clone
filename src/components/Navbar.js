import React from "react";
import { FiUpload, FiFolderPlus, FiLogOut, FiArrowUpCircle } from "react-icons/fi";
function Navbar({ getFile, showModal, logout, goBack, type, nav }) {
  return (
    <header>
      <div className='left'>
        <h2>My Drive</h2>
      </div>
      {nav &&<div className='right'>
        <nav>
          <ul>
            
            
            {type==='Root' ? <li onClick={showModal}>
              <FiFolderPlus /> Create Folder
            </li>: <li onClick={goBack}><FiArrowUpCircle/> Go Back</li>}
            <li className='upload-btn-wrapper' onChange={getFile}>
              <FiUpload /> Upload File <input type='file' name='file' />
            </li>
            <li onClick={logout}>
              <FiLogOut /> Logout
            </li>
          </ul>
        </nav>
      </div>}
    </header>
  );
}

export default Navbar;
