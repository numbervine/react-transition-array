import React from 'react'
import Transition from 'react-transition-array'
import PropTypes from 'prop-types'

const styles = {
  container: {
    position: 'relative',
    background: '#000',
    height: '100%',
    width: '100%',
  },

  description: {
    position: 'absolute',
    top: '100px',
    width: '100%',
    textAlign: 'center',
    color: '#B2FF59',
  }
}

export default class Example extends React.Component {
  static displayName = 'Example';

  static propTypes = {
    styles: PropTypes.object
  }

  state = {
    styles: {}
  }

  componentWillMount() {
    this.count = 0;
  }

  _handleMouseMove = (event) => {
    this.setState({
      styles: this._calculateNewStyle(event.clientY,event.clientX)
    })
  }

  _handleTouchMove = (event) => {
    this.setState({
      top: event.touches[0].pageY,
      left: event.touches[0].pageX,
      styles: this._calculateNewStyle(event.touches[0].pageY,event.touches[0].pageX)
    })
  }

  _calculateNewStyle = (top, left) => {
    let stylesTmp = {
      base: {
        position: 'absolute',
        top: (top - 50) + 'px',
        left: (left - 50) + 'px',
        borderRadius: '50%',
        border: '2px solid #B2FF59',
        height: '100px',
        width: '100px',
        opacity: '0.5',
      },
      transitionArray: [
        {
          transition: 'all 600ms ease-in',
          opacity: '0.75',
        },
        {
          transition: 'all 600ms ease-in',
          opacity: '1',
          top: (top - 75) + 'px',
          left: (left - 75) + 'px',
          border: '2px solid #80CBC4',
          height: '150px',
          width: '150px',
        },
        {
          transition: 'all 600ms ease-in',
          opacity: '1',
          top: (top - 100) + 'px',
          left: (left - 100) + 'px',
          border: '2px solid #26A69A',
          height: '200px',
          width: '200px',
        },
        {
          transition: 'all 600ms ease-in',
          opacity: '1',
          top: (top - 75) + 'px',
          left: (left - 75) + 'px',
          border: '2px solid #00897B',
          height: '150px',
          width: '150px',
        },
        {
          transition: 'all 600ms ease-in',
          opacity: '1',
          top: (top - 100) + 'px',
          left: (left - 100) + 'px',
          border: '2px solid #7CB342',
          height: '200px',
          width: '200px',
        },
        {
          transition: 'all 600ms ease-in',
          opacity: '1',
          top: (top - 75) + 'px',
          left: (left - 75) + 'px',
          border: '2px solid #00695C',
          height: '150px',
          width: '150px',
        },
        {
          border: '2px solid #004D40',
          transition: 'all 600ms ease-in',
          opacity: '0',
        }
      ]
    }

    return stylesTmp
  }

  render() {
    let transitionComponent = ''
    if (Object.keys(this.state.styles).length > 0) {
      let keyTmp = this.count++

      let transitionStyles = {}
      transitionStyles[keyTmp] =  this.state.styles

      transitionComponent = (
        <Transition transitionStyles={transitionStyles} keepAllAlive={false}>
          <div key={keyTmp} />
        </Transition>
      )
    }

    return (
      <div
        style={styles.container}
        onMouseMove={this._handleMouseMove}
        onTouchMove={this._handleTouchMove}
      >
        <div style={styles.description}>
          <h2>react-transition-array demo</h2>
          <p> Move your mouse around.   What you see is an array</p>
          <p>of transient React components, each transitioning through its</p>
          <p>own unique array of inline styles calculated dynamically.</p>
        </div>
        {transitionComponent}
      </div>
    )
  }
}
