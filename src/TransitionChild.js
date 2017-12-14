import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import AnimationManager from './AnimationManager'
import TransitionParser from './TransitionParser'
import first from 'lodash/first'
import get from 'lodash/get'
import has from 'lodash/has'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'
import { isVoid } from 'misc-utils'

const TIMEOUT_BUFFER = 10
const TIMEOUT_FACTOR = 1.1

export default class TransitionChild extends Component {

  static displayName = 'TransitionChild'

  static propTypes = {
    children: PropTypes.any,
    id: PropTypes.oneOfType(
      [PropTypes.string, PropTypes.number]
    ),
    style: PropTypes.object,
    transitionStyles: PropTypes.object,
    child: PropTypes.node
  }

  constructor(props){
    super(props)

    let transitionStyles = cloneDeep(get(props,'transitionStyles',{}))
    if (has(transitionStyles,'transitionArray') && isArray(transitionStyles.transitionArray)) {
      transitionStyles.transitionArray.reverse()
    } else {
      transitionStyles.transitionArray = []
    }

    this.state = {
      style: {},
      child: React.Children.only(this.props.children),
      transitionStyles: transitionStyles
    }
  }

  componentWillMount() {
    this._animationManager = new AnimationManager()
    this._transitionParser = new TransitionParser()
  }

  componentDidMount = () => {
    this._frames = []
    this._node = ReactDOM.findDOMNode(this)
    if (!this._node) {
      throw new Error('Invalid node returned by ReactDOM.findDOMNode')
    }
  }

  componentWillUnmount = () => {
    this._node.removeEventListener('transitionend', this._onTransitionEndRef)
    this._animationManager.cancelFrames(this._frames)
  }

  componentWillTransition = (callback=null) => {
    let frameId = this._animationManager.requestNextFrame(() => {
      this._renderTransition(callback)
    })
    this._frames.push(frameId)
  }

  _onTransitionEnd = (payload, event) => {
    let { longestTransitionProperty, transitionProperties, callback } = payload

    this._awaitingTransitionEnd = false
    if (this._node === event.target) {
      let matchesLongestTransitionProperty = this._transitionParser.matchesProperty(event.propertyName,longestTransitionProperty)
      let matchesLongestTransitionEqualsAll = longestTransitionProperty === 'all' && !this._transitionParser.matchesProperty(event.propertyName,transitionProperties)

      if (matchesLongestTransitionProperty || matchesLongestTransitionEqualsAll) {
        this._processTransitionEnd(callback)
      }
    }
  }

  _processTransitionEnd = (callback) => {
    this._node.removeEventListener('transitionend', this._onTransitionEndRef)

    if (callback) {
      callback()
    }
    if (this.state.transitionStyles.transitionArray.length>0) {
      this.props.onNextTransition(this.props.id)
    }

    if (this._timerId) {
      clearTimeout(this._timerId)
      this._timerId = false
    }
  }

  _getNextStyle = () => {
    let transitionStyles = cloneDeep(this.state.transitionStyles)
    let baseStyle = get(transitionStyles,'base',{})
    let  phaseStyle = transitionStyles.transitionArray.pop()
    if (typeof phaseStyle == "undefined") {
      phaseStyle = {}
    }
    return { transitionStyles, nextStyle: Object.assign( {}, baseStyle, phaseStyle, this.props.style) }
  }

  _renderTransition = (callback) => {
    let { transitionStyles, nextStyle } = this._getNextStyle()
    let { longestTransition, transitionProperties } = this._transitionParser.processStyle(nextStyle)

    this._node.removeEventListener('transitionend', this._onTransitionEndRef)

    if (!isVoid(longestTransition)) {
      this._onTransitionEndRef = this._onTransitionEnd.bind(
        this,
        {
          longestTransitionProperty: longestTransition.transitionProperty,
          transitionProperties,
          callback
        }
      )

      this._awaitingTransitionEnd = true
      this._node.addEventListener('transitionend', this._onTransitionEndRef);
      let transitionEndTimeout = Math.trunc(TIMEOUT_BUFFER+TIMEOUT_FACTOR*(longestTransition.transitionDuration+longestTransition.transitionDelay))

      this._timerId = setTimeout( ()=> {
        if (this._awaitingTransitionEnd) {
          this._node.removeEventListener('transitionend', this._onTransitionEndRef)
          this._awaitingTransitionEnd = false
          this._processTransitionEnd(callback)
        }
      }, transitionEndTimeout)
    }
    else {
      this._processTransitionEnd(callback)
    }

    this.setState({transitionStyles, style: nextStyle});
  }

  render()  {
    return React.cloneElement(this.state.child, {
      style: this.state.style,
    })
  }
}
