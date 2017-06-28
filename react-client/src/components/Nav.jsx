import React from 'react';
import WineList from './WineList.jsx';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render () {
    const NavOption = ({option}) => (
      <div>{option}</div> 
    )

    return (
      <div className='nav'>
        {this.props.wineRoutes.map((route, index) => (
          <div className='navItem' key={index}>
            <Link to={route.path}>
              <h2 className={this.props.selection[index]} onClick={() => {this.props.handleClickedNavItem(index)}}>{route.title}</h2>
            </Link>
          </div>
        ))}
      </div>
    )
  }
}

export default Nav;