import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TransitionChild from './TransitionChild';
import CallbackManager from './CallbackManager'
import findIndex from 'lodash/findIndex';
import has from 'lodash/has'
import isArray from 'lodash/isArray'

export default class Transition extends Component {

  static displayName = 'Transition'

  static propTypes = {
    children: PropTypes.node,
    component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    keepAllAlive: PropTypes.bool,
    transitionStyles: PropTypes.object
  }

  static defaultProps = {
      component: 'div',
      keepAllAlive: false,
      transitionStyles: {}
  }

  constructor(props){
    super(props);

    let childrenWrapped = React.Children.toArray(props.children).map((child) => {
      let transitionChildKey = child.key
      let transitionChild = (<TransitionChild
          key={transitionChildKey}
          id={transitionChildKey}
          transitionStyles={props.transitionStyles[transitionChildKey.substr(2)]} // TODO: refactor (substr is because key prepended with .$)
          onNextTransition={this._transition.bind(this)} >
          {child}
        </TransitionChild>)
      return React.cloneElement(transitionChild, { ref: this._manageComponent.bind(this, transitionChildKey) })
    })

    this.state = {
      childrenWrapped
    }
  }

  componentDidMount() {
    let triggerKeys = {};
    this.state.childrenWrapped.forEach(function (child) {
      triggerKeys[child.key] = true
    })

    this._launchTransitions(triggerKeys)
  }

  componentWillMount() {
    this._components = {}
    this._callbackManager = new CallbackManager()
  }

  componentWillReceiveProps(nextProps) {
    let updatedCurrentChildren = []
    let triggerKeys = {}

    React.Children.toArray(nextProps.children).forEach((nextChild) => {
      let transitionChildKey = nextChild.key
      let transitionChildTmp = (<TransitionChild
        key={transitionChildKey}
        id={transitionChildKey}
        transitionStyles={nextProps.transitionStyles[transitionChildKey.substr(2)]}  // TODO: refactor (substr is because key prepended with .$)
        onNextTransition={this._transition.bind(this)} >
        {nextChild}
        </TransitionChild>)

      let transitionChild = React.cloneElement(transitionChildTmp, { ref: this._manageComponent.bind(this, transitionChildKey) })
      updatedCurrentChildren.push(transitionChild)
      triggerKeys[nextChild.key] = true
    })

    this.state.childrenWrapped.forEach(function (prevChild) {
      let position = findIndex(updatedCurrentChildren, function (element) {
        if (prevChild.key === element.key) return true
      })
      if (position == -1) {
        updatedCurrentChildren.push(prevChild)
      }
    });

    this.setState({
      childrenWrapped: updatedCurrentChildren
    }, () => {
      this._launchTransitions(triggerKeys)
    })
  }

  componentWillUnmount() {
    this._callbackManager.cancelAll()
  }

  _manageComponent = (key, component) => {
    if (component) {
      this._components[key] = component
    } else {
      delete this._components[key]
    }
  }

  _transition = (key) => {
    let hasValidTransitionArray = has(this._components[key].state,'transitionStyles.transitionArray') &&
                          isArray(this._components[key].state.transitionStyles.transitionArray)
    let numRemainingTransitions = hasValidTransitionArray ? this._components[key].state.transitionStyles.transitionArray.length : 0

    this._callbackManager.cancel(key)
    switch (numRemainingTransitions) {
      case 0 :  // cycle through transition rendering and call cleanup callback in this case too
      case 1 :  // last transition: set cleanup callback to remove react component per keepAllAlive property value
        this._components[key].componentWillTransition(this._cleanup(key))
        break
      default:
        this._components[key].componentWillTransition()
    }
  }

  _launchTransitions = (triggerKeys) => {
    Object.keys(triggerKeys).forEach( (key) => {
      this._transition(key)
    })
  }

  _cleanup = (key) => {
    let callback = () => {
      if (!this.props.keepAllAlive) {
        this.setState( (previousState) => {
          let newChildren = previousState.childrenWrapped.slice()
          let position = findIndex(newChildren, function (element) {
            if (element.key === key) return true
          })
          if (position >= 0) {
            newChildren.splice(position, 1)
          }

          return {
            childrenWrapped: newChildren
          }
        })
      }
    }

    return this._callbackManager.register(callback, key, this)
  }

  render() {
    return React.createElement(this.props.component, {}, this.state.childrenWrapped)
  }
}
