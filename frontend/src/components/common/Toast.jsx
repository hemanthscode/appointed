import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = ({ position = 'top-right', autoClose = 3000 }) => (
  <ToastContainer
    position={position}
    autoClose={autoClose}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    toastClassName="bg-white text-black border-2 border-black rounded-xl shadow-lg"
    bodyClassName="text-black font-medium"
    progressClassName="bg-black"
  />
);

export default Toast;