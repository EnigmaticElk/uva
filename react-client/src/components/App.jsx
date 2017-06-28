import React from 'react';
import Search from './SearchBar.jsx';
import $ from 'jquery';
import Login from './loginForm.jsx';
import ProductList from './productList.jsx';
import TopBar from './TopBar.jsx';
import ProductOverview from './productOverview.jsx';
import Questionnaire from './Questionnaire.jsx';
import HomePageWines from './HomePageWines.jsx';
import Nav from './Nav.jsx';
import WineList from './WineList.jsx';
import TripleList from './TripleList.jsx';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';


class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      allWines: {
        reds: {
          path: '/reds',
          title: 'Top Reds',
        },
        whites: {
          path: '/whites',
          title: 'Top Whites',
        },
        uvas: {
          path: '/uvaschoices',
          title: 'Uva\'s Choices',
          choice: 'true',
        },
      },
      navSelection: {
        0: '',
        1: '',
        2: ''
      },
      searchHistory: [],
      userHasSearched: false,
      userWantsProductList: false,
      currentWine: null,
    }

    this.search = this.search.bind(this);
    this.submitReview = this.submitReview.bind(this);
    this.getReviews = this.getReviews.bind(this);
    this.init = this.init.bind(this);
    this.handleUserWantsProductList = this.handleUserWantsProductList.bind(this);
    this.handleClickedProductEntry = this.handleClickedProductEntry.bind(this);
    this.postLike = this.postLike.bind(this);
    this.handleClickedNavItem = this.handleClickedNavItem.bind(this);
  }

  componentDidMount(){
    this.init();
  }

  handleUserWantsProductList(event){
    console.log('inside  product list handler')
    this.setState({
      userWantsProductList: !this.state.userWantsProductList,
    })
  }

  init(){
    var context = this;
    $.ajax({
      url: '/init',
      success: function (data) {
        context.setState(() => {
          context.state.allWines.reds.wines = data.top30Reds;
          context.state.allWines.whites.wines = data.top30Whites;
          context.state.allWines.uvas.wines = data.topRated;
        })
      },
      error: function(error) {
        console.log('error inside init duuudeeee', error)
      }
    })
  }

  getReviews(product_id){
    var context = this;
    console.log('this is the key', product_id);

    $.ajax({
      url: '/reviews',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        product_id: product_id
      }),
      success: function(reviews){
        if (context.state.reviews && reviews.length === context.state.reviews.length) {
          return;
        }
        context.setState({
          reviews: reviews
        });
      },
      error: function(error){
        console.log('error after getting reviews AJAX', error)
      }
    });
  }

  submitReview (review, rating, wine) {
    var context = this;
    console.log('wine', wine);

    $.ajax({
      url: '/review',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        review: review,
        rating: rating,
        product: wine.name,
        username: context.state.username,
        product_id: wine._id,
        time: Date
      }),
      success: function(data) {
        context.getReviews(wine._id);
      },
      error: function(error) {
        console.log('Error submitReview AJAX', error)
      }
    })
  }

  search (query, price) {
    var context = this;
    var searchHistory = this.state.searchHistory;
    searchHistory[searchHistory.length] = query;
    console.log('serach histnig' , searchHistory);
    this.setState({
      searchHistory: searchHistory,
      userHasSearched: true,
      userWantsProductList: true
    })
    console.log('query inside search', query);
    console.log('price inside search', price);
    $.ajax({
      url: '/search',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        search: query,
        price: price
      }),
      success: function(data) {
        console.log('success res from searchAJAX', data);
        if (data.length > 0) {
          context.setState({
            products: data,
            userHasSearched: true
          })
        }
      },
      error: function(err) {
        console.log(err)
      }
    })
  }

  postLike (wine, likeOrDislike) {
    var context = this;
    var allWines = this.state.allWines
    wine.like = likeOrDislike;

    $.ajax({
      url: '/likes',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        wine: wine
      }),
      success: function(data) {
        allWines.uvas.wines = data;
        context.setState({
          allWines: allWines
        });
      },
      error: function(err) {
        console.error(err);
      }
    })
  }

  handleClickedProductEntry(wine) {
    console.log('inside clicked product entry', wine);
    if (wine) {
      this.setState({
        userClickedEntry: true,
        currentWine: {
          wine: wine
        }
      })
    }
  }

  handleClickedNavItem(index) {
    var selection = {
      navSelection: {
        0: '',
        1: '',
        2: ''
      }
    };
    if (index !== -1) {
      selection.navSelection[index] = 'active';
    }
    this.setState(selection);
  }

  render () {

    const wineRoutes = Object.values(this.state.allWines);

    console.log('wineRoutes', wineRoutes)
    
    const Products = () => (
      <ProductList 
        handleUserWantsProductList={this.handleUserWantsProductList} 
        searchHistory={this.state.searchHistory} 
        reviews={this.state.reviews} 
        getReviews={this.getReviews} 
        products={this.state.products} 
        submitReview={this.submitReview} 
        userHasSearched={this.state.userHasSearched} 
        userWantsProductList={this.state.userWantsProductList}
      />
    )

    const Homepage = () => (
      <HomePageWines
        topReds={this.state.allWines.reds.wines && this.state.allWines.reds.wines.slice(0, 10)}
        topWhites={this.state.allWines.whites.wines && this.state.allWines.whites.wines.slice(0, 10)}
        topRated={this.state.allWines.uvas.wines && this.state.allWines.uvas.wines.slice(0, 10)}
        handleClickedProductEntry={this.handleClickedProductEntry}
        postLike={this.postLike}
      />
    )

    const ProductOverviewComp = () => (
      <ProductOverview
        reviews={this.state.reviews}
        currentWine={this.state.currentWine}
        getReviews={this.getReviews}
        submitReview={this.submitReview}
      />
    )

    const Triplelist = (wines, choice) => (
      <TripleList
        first={wines.slice(0, 10)}
        second={wines.slice(10, 20)}
        third={wines.slice(20, 30)}
        handleClickedProductEntry={this.handleClickedProductEntry}
        postLike={choice ? this.postLike : undefined}
      />
    )

    return (
      <div className = 'container'>
        <Router>
          <div>
            <div className = 'topBackgroundImageWrapper'>
              <Link to='/'>  
                <TopBar 
                  handleClickedNavItem={this.handleClickedNavItem}
                />
              </Link>
              <div>
                <div className = 'heroContentWrapper'>
                  <h1>Uva 2.Grape</h1>
                  <Search className ='SearchBar' search={this.search} />
                </div>
              </div>    
            </div>
            <div>
              <Nav
                wineRoutes={wineRoutes}
                handleClickedNavItem={this.handleClickedNavItem}
                selection={this.state.navSelection}
              />
              <hr/>
            </div>
            <div>
              <Route path='/questionnaire' component={Questionnaire}/>
              <Route exact path='/' component={Homepage}/>
              <Route path='/products' component={Products}/>
              <Route path='/product/overview' component={ProductOverviewComp}/>
              {wineRoutes.map((route, index) => (
                <Route
                  key={index}
                  exact path={route.path}
                  component={() => {
                    return Triplelist(route.wines, route.choice);
                  }}
                />
              ))}
            </div>
          </div>
        </Router>
      </div>
    )
  }
}

export default App;