import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';


var TopBar = ({handleClickedNavItem}) => (
  <div className='flexContainer'>
    <Link to='/'>
      <button style={{"margin-right": "15px"}} onClick={() => {handleClickedNavItem(-1)}}>Home</button>
    </Link>
    <Link to='/questionnaire'>
      <button onClick={() => {handleClickedNavItem(-1)}}>Survey</button>
    </Link>
  </div>
);

export default TopBar;