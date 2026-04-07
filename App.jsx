import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from './components/Homepage';
import Register from './components/Register';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AddProject from './components/AddProject';

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Homepage/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
          <Route path='/dashboard' element={<UserDashboard/>}/>.
          <Route path="/add-project" element={<AddProject />} />
        </Routes>
      </Router>
    </>
  )
}

export default App