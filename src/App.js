import React, { Component } from 'react';
import * as Mousetrap from 'mousetrap';
import './App.css';
import GameLoop from './GameLoop';
import Jumper from './Jumper';
import Platform from './Platform';

const FPS = 60; // frames/s default 60
const GRAVITY_ACCEL = 9.81; // m/s/s
const SCALE = 5; // %/m
const JUMP_HEIGHT = 6; // m
const RUN_SPEED = 8; // m/s

const GRAV_PER_FRAME = GRAVITY_ACCEL / FPS; // m/s/frame
const RUN_PER_FRAME = RUN_SPEED * SCALE / FPS;
const JUMP_VELOCITY = Math.sqrt(2 * GRAVITY_ACCEL * JUMP_HEIGHT); // m/s

const STARTING_STATE = {
  sceneObjects : [
    {
      type: "jumper",
      x: 5,
      y: 50,
      v_y: 0,
      width: 5,
    },
    {
      type: "platform",
      key: Math.random(),
      x: 0,
      y: 1,
      width: 100,
    },
  ],
  keyState: [],
  score: 0,
  gameOver: '',
  log: [],
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = STARTING_STATE;
    this.gameKeys = ['w', 'up', 'space', 's', 'down'];
    this.step = this.step.bind(this);
  }

  componentDidMount() {
    // Match keyboard presses to events.
    Mousetrap.bind(this.gameKeys, event => this.handleKeydown(event), 'keydown');
    Mousetrap.bind(this.gameKeys, event => this.handleKeyup(event), 'keyup');
  }
  componentWillUnmount() {
    Mousetrap.unbind(this.gameKeys);
  }

  handleKeydown(event) {
    if (!event || !this.state || !this.state.keyState) return;
    const tag = event.target.tagName.toLowerCase();
    //  Make sure keys can still be inputted if a form is focused.
    if (tag === 'input' || tag === 'textarea') return;
    const nextKeyState = this.state.keyState;
    nextKeyState[event.keyCode || event.which] = true;
    this.setState({keyState: nextKeyState});
    event.preventDefault();
  }

  handleKeyup(event) {
    if (!event || !this.state || !this.state.keyState) return;
    const tag = event.target.tagName.toLowerCase();
    //  Make sure keys can still be inputted if a form is focused.
    if (tag === 'input' || tag === 'textarea') return;
    const nextKeyState = this.state.keyState;
    nextKeyState[event.keyCode || event.which] = false;
    this.setState({keyState: nextKeyState});
    event.preventDefault();
  }

  isJumpingKey() {
    return this.state.keyState[38] || this.state.keyState[32] || this.state.keyState[87];
  }

  isDroppingKey() {
    return this.state.keyState[40] || this.state.keyState[83];
  }

  isMakeable(distance, height) { // distance and height in m
    return  height < JUMP_VELOCITY * (distance / RUN_SPEED) + ((GRAVITY_ACCEL / -2) * ((distance / RUN_SPEED) ** 2));
  }

  checkPlatforms(jumper, platforms) {
    for (let i = 0; i < platforms.length; i++) {
      if (this.standingOn(jumper, platforms[i])) {
        return platforms[i];
      }
    }
    return null;
  }

  standingOn(jumper, platform) {
    return jumper.x + jumper.width > platform.x &&
    jumper.x < platform.x + platform.width &&
    jumper.y >= platform.y - 1 &&
    jumper.y + jumper.v_y <= platform.y;
  }

  step() {
    if (this.state.sceneObjects[0].y <= -20) {
      return;
    }
    let nextScore = this.state.score;
    const newSceneObjects = [];
    const nextSceneObjects = this.state.sceneObjects.map((current, i) => {
      const nextCurrent = current;
      const foothold = this.checkPlatforms(nextCurrent, this.state.sceneObjects.slice(1));
      if (current.type === "jumper") {
        if (this.isJumpingKey() && foothold) {
          nextCurrent.v_y = Math.sqrt(JUMP_VELOCITY);
        }
        if (nextCurrent.y > 0 && !this.isJumpingKey() && nextCurrent.v_y > 0) {
          nextCurrent.v_y = 0;
        }
        if (foothold && !this.isDroppingKey()) {
          nextCurrent.y = foothold.y;
          nextCurrent.v_y = Math.max(nextCurrent.v_y, 0);
        } else if (nextCurrent.y + nextCurrent.v_y <= -20) {
          nextCurrent.y = -20;
          nextCurrent.v_y = 0;
        } else {
          nextCurrent.v_y -= GRAV_PER_FRAME;
        }
        nextCurrent.y += nextCurrent.v_y;
      } else if (current.type === "platform") {
        nextCurrent.x -= RUN_PER_FRAME;
        if (nextCurrent.x + nextCurrent.width  + (2 * RUN_PER_FRAME) <= 0) {
          nextScore += 1;
          nextCurrent.remove = true;
        }
        if (nextCurrent.x + nextCurrent.width < 100 && !nextCurrent.followed) {
          newSceneObjects.push(
            {
              type: "platform",
              key: Math.random(),
              x: Math.random() * 30 + 100,
              y: Math.min(Math.random() * 80 + 1, nextCurrent.y + 30),
              width: Math.random() * 30 + 5,
            },
          );
          nextCurrent.followed = true;
        }
      }
      return nextCurrent;

    })
    const filteredSceneObjects = nextSceneObjects.filter(object => !object.remove).concat(newSceneObjects);
    this.setState({sceneObjects: filteredSceneObjects, score: nextScore});
  }

  render() {
    const platforms = this.state.sceneObjects.slice(1).map(platform => {
      return <Platform
        x={platform.x}
        y={platform.y}
        width={platform.width}
        key={platform.key}/>
    });
    const jumper = <Jumper
      y={this.state.sceneObjects[0].y}
      x={this.state.sceneObjects[0].x}
      width={this.state.sceneObjects[0].width}
    />;
    return (
      <div className="playfield">
        <GameLoop fps={FPS} step={this.step} />
        <div>Score: {this.state.score} VY: {this.state.sceneObjects[0].v_y}</div>
        <div className="game-over">{this.state.gameOver}</div>
        {platforms}
        {jumper}
      </div>
    )
  }
}

export default App;
