import React, { Component } from 'react';

import Button from '../Button/Button';
import classes from './Category.module.css';

class Category extends Component {
  state = {
    category: true
  }

  changeCategoryHandler = () => {
    this.props.onClick({id: this.props.id, title: this.props.title});
    this.setState({category: true});
    console.log("changeCategorySucceeded");
  }

  render() {
    return (
      <div>
      {this.state.category
        ? <button
            className={classes.Category}
            style={{alignItems: 'center'}}
            onClick={() => {this.changeCategoryHandler(); this.props.clicked()}}
            id={this.props.id}
            value={this.props.title}>
            {this.props.title}
          </button>
        : null}
      </div>

    );
  }
}

export default Category;
