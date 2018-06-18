import React, { Component } from 'react'
import Login from '../login/Login'
import {connect} from 'react-redux'
import HomeBurger from '../dropdowns/homeDropdown/testBurger'
import Cart from '../MenuView/components/Cart'
import trucksvg from '../assets/images/truck.svg'
import {Link} from 'react-router-dom'

import {hideCart} from '../MenuView/actions/MenuViewActions'

import './homeHeader.css'

export class HomeHeader extends Component {

  handleCartHide(){
    hideCart()
  }

  render() {
    return (
      <div className="home-header">
            
        {this.props.username ? '' : <div className="home-header-login">
                                  <Login />
                                </div>}

        <div className="logo-container" onClick={this.handleCartHide}><Link to="/" style={{color: "inherit", cursor: "pointer"}}><h1 className="content-headers-title">Lets Eat</h1></Link></div>

        <div className="home-header-dropdown">
          {this.props.username ? <div className="header-user-info">
                                  <span>{this.props.username}</span>
                                  {this.props.source === 'user' ? <img src={this.props.avatar} alt="avatar"/> :
                                                                  <img src={this.props.companyLogo} alt=""/>}
                                </div> : ' '}
              <HomeBurger />
        </div>
        <Cart />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    username: state.loginReducer.username,
    avatar: state.loginReducer.avatar,
    source: state.loginReducer.source,
    companyLogo: state.loginReducer.logo,
    cartView: state.MenuViewReducer.cartView
  }
}

export default connect(mapStateToProps)(HomeHeader)
