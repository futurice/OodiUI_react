import React, { Component } from 'react';
import axios from 'axios';

import classes from './SearchForm.module.css';
import Aux from '../../hoc/Aux';
import Button from '../Button/Button';
import InfoBar from '../InfoBar/InfoBar';
import MenuSelector from '../../containers/MenuSelector/MenuSelector';
import SearchBar from '../SearchBar/SearchBar';

import leftArrow from '../../assets/images/Icon-Arrow-Left.svg';
import rightArrow from '../../assets/images/Icon-Arrow-Right.svg';
import upArrow from '../../assets/images/Icon-Arrow-Up.svg';
import homeImage from '../../assets/images/Icon-Home.svg';
import { withTranslation, Trans } from 'react-i18next';

import Oodi from '../../assets/images/Icon-Oodi-Black.svg';

class SearchForm extends Component {
  state = {
    searchTerm: '',
    notSearching: true,
    books: [],
    showInfoBars: true,
    showBackButton: true,
    showSearchResultsHeader: false,
    chosenBook: '',
    chosenBookId: '',
    arrowMessage: '',
    arrowDirection: '',
    guidanceStarted: false,
  }

  searchTermHandler = (event) => {
    this.setState({searchTerm: event.target.value});
  }

  sendDataHandler = () => {
    this.setState({showSearchResultsHeader: true});
    this.setState({notSearching: false})
    console.log(this.state.searchTerm);
    let searchTerm = this.state.searchTerm;
    axios
      .post('http://localhost:3001/searchterm', {searchTerm})
      .then(() =>
        axios
          .get('http://localhost:3001/get_books')
          .then(response => {
            this.setState({books: Object.entries(Object.entries(response.data)[0][1])});
            console.log("Books received in form:", this.state.books);
          })

          .catch(err => {
            console.log(err);
          })
        )
      .catch(err => {
        console.error(err);
      })
  }

  changeNotSearchingHandler = () => {
    this.setState({notSearching: true});
    this.setState({searchTerm: ''});
  }

  changeInfoBarsStateFalseHandler = (bookTitle, bookId) => {
    //will set the states so that the different book result buttons will be hidden.
    //also sets the states to hide the back button in the term results view AND hide the found books.
    //Also, the state for showing the chosen book's title is enabled here.
    this.setState({showInfoBars: false});
    this.setState({showBackButton: false});
    this.setState({showSearchResultsHeader: false});
    this.setState({chosenBook: bookTitle})
    this.setState({chosenBookId: bookId});
    console.log("Infobars will be HIDDEN");
  }

  changeInfoBarsStateTrueHandler = () => {
    //reverts the changes done in changeInfoBarsStateFalseHandler!
    this.setState({showInfoBars: true});
    this.setState({showBackButton: true});
    this.setState({showSearchResultsHeader: true});
    console.log("Infobars will be SHOWN");
  }

  startGuidanceHandler = (bookId) => {
    this.setState({guidanceStarted: true})
    axios
      .post('http://localhost:3001/selected_book', {bookId})
      .then(() => ( this.getArrowSignalHandler()
      ))
      .catch(err => {
        console.log(err)
      })

  }

  getArrowSignalHandler = () => {
    axios
    .get('http://localhost:3001/guidance')
    .then( response => {
      console.log("The arrow response from the server is", response.data.data);
      if (response.data.data === 'home') {
        this.setState({arrowDirection: homeImage});
        this.setState({arrowMessage: "Bye bye! I'm going back to the starting point!"})
        console.log("arrow is currently:", this.state.arrowDirection);
        return this.returnHomeHandler();
      }
      else {
        if (response.data.data === 'l') {
          this.setState({arrowDirection: leftArrow});
          this.setState({arrowMessage: "Look to your left!"});
          console.log("received left arrow");
        }
        else if (response.data.data === 'r') {
          this.setState({arrowDirection: rightArrow});
          this.setState({arrowMessage: "Look to your right!"});
          console.log("received right arrow");
        }
        else if (response.data.data === 'lr') {
          this.setState({arrowDirection: leftArrow});
          this.setState({arrowMessage: "Look to your both sides!"});
          console.log("received leftright arrow");
        }
        else {
          this.setState({arrowDirection: upArrow});
          this.setState({arrowMessage: "Let's go!"});
          console.log("no matching arrow");
        }
        setTimeout(this.getArrowSignalHandler, 2000)
      }
    })
    .catch(err => {
      console.log(err);
      })
  }

  returnHomeHandler = () => {
    axios
      .get('http://localhost:3001/guidance')
      .then( response => {
        if (response.data.data === 'home') {
          console.log("Still only receiving home")
          setTimeout(this.returnHomeHandler, 2000);
        }
        else if (response.data.data === 'home2') {
          console.log("WE ARE BACK HOME!");
          this.props.backToStart();

        }
        else {
          console.log("received something else");
          setTimeout(this.returnHomeHandler, 2000);
        }
      })
      .catch(err => {
        console.log(err);
      })
  }

  render() {
    const { t } = this.props

    //book[1].title, book[1].author, book[1].bibid show the book's title, author and id, in respect.

    let form;
    if (this.state.notSearching) {
      form = (
        <Aux>
          <form>
            <input
              type="text"
              className={classes.SearchForm}
              placeholder={t('bookMenu.findBookPlaceholder')}
              onChange={this.searchTermHandler}
              values={this.state.searchTerm}
              />
            <div className={classes.Button}>
              <input type="submit" onClick={() => {this.sendDataHandler(); this.props.clicked()}} />
            </div>
          </form>
        </Aux>
      )
    }
    else {
      if (this.state.showSearchResultsHeader) {
        form = <div>
        {t('bookSearch.available')}
        <strong>{this.state.searchTerm}</strong>
                </div>
      }
    }

    return (
      <div>
      <SearchBar />

        {form}
          {this.state.notSearching
          ? null
          : <Aux>
            {this.state.showBackButton
              ? <Button btnType="Back" clicked={() => {this.changeNotSearchingHandler();  this.props.showCategories()}}>{t('button.back')}</Button>
              : null
            }
              {this.state.showInfoBars
              ? this.state.books.map(book => {
                return <div key={book[1].bibid}>
                  <InfoBar author={book[1].author} title={book[1].title} id={book[1].bibid} clicked={() => {this.changeInfoBarsStateFalseHandler(book[1].title, book[1].bibid)}}/>
                  </div>
              })
              : <div>
                {this.state.guidanceStarted === false
                ?  <Aux>
                  <h1>{t('bookSearch.startGuidance')}
                  {this.state.chosenBook}</h1>
                  <Button btnType="Back" clicked={this.changeInfoBarsStateTrueHandler}>{t('button.back')}</Button>
                  <Button clicked={() => this.startGuidanceHandler(this.state.chosenBookId)}>{t('button.proceed')}</Button>
                  </Aux>
                : <div>
                  <h1>{t(`arrowMessage.${this.state.arrowMessage}`)}</h1>
                  <img src={this.state.arrowDirection} alt="arrow"/>
                  </div>
            }
            </div>
            }
            </Aux>
          }
      </div>
    )
  }
};

export default withTranslation('common')(SearchForm);
