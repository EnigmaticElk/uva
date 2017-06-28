import React from 'react';
import NavButtons from './QuestionNavButtons.jsx'
import $ from 'jquery';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

class Questionnaire extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      wineType: {
        red: false,
        white: false,
      },
      varietal: {
        cabernet: false,
        merlot: false,
        chardonnay: false,
        sauvignonBlanc: false,
        unsure: false,
      },
      price: {
        '10': false,
        '20': false,
        '30': false,
        '40': false,
        '50': false,
        '60': false,
        '70': false,
        '80': false,
        '90': false,
        '100': false,
      }
    };
    this.updateAnswers = this.updateAnswers.bind(this);
    this.submitAnswers = this.submitAnswers.bind(this);
  } 

  updateAnswers (e) {
    let question = e.target.name;
    let answer = e.target.value;
    this.setState(() => {
      this.state[question][answer] = !this.state[question][answer];
    });
  }

  submitAnswers() {
    let state = this.state;
    let answers = {
    }
    for (let category in state) {
      for (let checked in state[category]) {
        if (state[category][checked]) {
          if (answers[category]) {
            answers[category].push(checked);
          } else {
            answers[category] = [checked];
          }
        }
      }
    }
    console.log('answers', answers);

    $.ajax({
      url: '/train',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({answers}),
      success: function(data) {
        console.log('successful training!', data);
      },
      error: function(err) {
        console.error(err);
      }
    })
  }

  render () {

    const wineTypes = Object.keys(this.state.wineType);    
    const varietals = Object.keys(this.state.varietal);
    const prices = Object.keys(this.state.price);
    

    const RedOrWhite = () => (
      <form onSubmit={this.updateAnswers}>
        <div>
          <div>
            Please check each wine type that you enjoy drinking. <br/> (Must select at least one)
          </div>
          {wineTypes.map((type, index) => (
            <div>
                <input key={index}
                      type="checkbox" 
                      name={`wineType`} 
                      value={type}
                      checked={this.state.wineType[type]}
                      onChange={this.updateAnswers}
                />
              <label>{type}</label><br/>
            </div>
          ))}
        </div>
      </form>
    )

    const Varietal = () => (

        <div>
          <div>
            Please check each common varietal that you enjoy drinking. <br/> (Must select at least one)
          </div>
          {varietals.map((vartype, index) => {
            let option;
            if (vartype === 'unsure') {
              option = `Unsure - only check this box if none of the above are checked!`;
            } else {
              option = vartype;
            }
            return (
              <div>            
                <input key={index} 
                      type="checkbox" 
                      name="varietal" 
                      value={vartype}
                      checked={this.state.varietal[vartype]}
                      onChange={this.updateAnswers} 
                />
                <label>{option}</label><br/>
              </div>
            )
          })}
        </div>

    )

    const Price = () => (

        <div> 
          <div>
            Please check each price you would be comfortable paying for one bottle of wine. <br/> (Must select at least one)
          </div>

          {prices.map((cost, index) => (
            <div>            
              <input key={index}
                    type="checkbox" 
                    name="price" 
                    value={cost}
                    checked={this.state.price[cost]}
                    onChange={this.updateAnswers}
              />
              <label>${cost}</label><br/>
            </div>
          ))}                                                                
        </div>

    )

    return (

      <div className='questionnaire'>
        <h2>Help Us Give You Great Recommendations</h2>
        <p>Answer a few brief questions so we can provide you personalized recommendations!</p>
        <Route exact path='/questionnaire/1' component={RedOrWhite} />
        <Route exact path='/questionnaire/2' component={Varietal} />
        <Route exact path='/questionnaire/3' component={Price} />
        <Route path='/questionnaire' render={() => (<NavButtons location={this.props.location} submitAnswers={this.submitAnswers} />) }/>
      </div>

    )
  }

}


export default Questionnaire;
