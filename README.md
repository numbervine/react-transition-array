# React Transition Array

This component is a simple alternative for applying an array of style transitions in React.

## Philosophy
ReactCSSTransitionGroup (https://facebook.github.io/react/docs/animation.html) and ReactInlineTransitionGroup (https://github.com/felipethome/react-inline-transition-group) seemed like the only options to render transitions using React. Now, both these appear to be limited in terms of how many transitions you can squeeze into appear/enter and leave. It isn't intuitive how one would go about supplying an array of more than two transitions to be applied to a component sequentially. That's where React Transition Array comes to the rescue.

There's no appear/enter/leave constraint. This component works off an array of styles that are applied sequentially. The first is equivalent to appear/enter and the last is leave. If there's just one style element in the array, apear/enter/leave are rolled into one. Optionally, we can unmount all child components after the last transition style is applied.

[Demo](http://numbervine.github.io/react-transition-array/).

## How to install

```bash
    npm install react-transition-array
```

## How it works

Dynamically build styles object as an array of transitions, and pass it as a property using the key of the corresponding React element passed as a child element to link the style:

```jsx

import Transition from 'react-transition-array'

let styles = {
  base: {
    position: 'absolute',
    top: '100px',
    left: '100px',
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
      top: (75) + 'px',
      left: (75) + 'px',
      border: '2px solid #80CBC4',
      height: '150px',
      width: '150px',
    },
    {
      transition: 'all 600ms ease-in',
      opacity: '1',
      top: (50) + 'px',
      left: (50) + 'px',
      border: '2px solid #26A69A',
      height: '200px',
      width: '200px',
    },
    {
      border: '2px solid #004D40',
      transition: 'all 600ms ease-in',
      opacity: '0',
    }
  ]
}

...

render() {
  let keyTmp = 'xmplky'
  let transitionStyles = {}
  transitionStyles[keyTmp] =  styles

  return (
    <Transition transitionStyles={transitionStyles} keepAllAlive={false}>
      <div key={keyTmp} />
    </Transition>
  )
}

```


## Properties

Property name | Description
------------ | -------------
**component** | String. Wrapper component. Default: `div`.
**transitionStyles** | Object. This object has a nested structure containing a first level of properties matching those of child React element keys. Each of the above top level objects contain objects with `base` and `transitionArray` properties. `base` is an object containing styles that are common to each transition contained in `transitionArray`, which is an array of objects, each containing styles including `transition` specs to be applied sequentially.
**keepAllAlive** | Boolean. Flag to be used to determine whether child elements should be unmounted after completion of the transition rendering sequence. Default: `false`
**children** | Node. React element on which above transition styles are to be merged with corresponding child's given inline style.

## LICENSE

MIT © [Thomas Varghese] (https://github.com/numbervine)
