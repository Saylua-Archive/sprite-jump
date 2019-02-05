import React, { Component } from 'react';

export default class GameLoop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: null,
    }
  }

  componentDidMount() {
    const timer = setInterval(this.props.step, 1000 / this.props.fps);
    this.setState({timer});
  }

  componentWillUnmount() {
    this.clearInterval(this.state.timer);
  }

  render() {
    return <div/>
  }
}
