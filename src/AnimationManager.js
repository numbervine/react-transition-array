/**
 * @license Copyright 2017 Thomas Varghese, MIT License
 * see https://github.com/numbervine/react-transition-array/blob/master/LICENSE
 */

import has from 'lodash/has'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'

export default class AnimationManager {

  static _frames = {}

  _getKey = () => {
    let key
    while (!key || has(AnimationManager._frames,key)) {
      key = Math.floor(Math.random() * 1E9)
    }
    return key
  }

  requestNextFrame = (callback) => {
    let key = this._getKey()

    // without the double rAF workaround transitionend event does not fire
    // among other problems
    // Chrome and Safari have a bug where calling rAF once returns the current
    // frame instead of the next frame, so we need to call a double rAF here.
    // See https://crbug.com/675795 for more.

    if (window.requestAnimationFrame) {
      AnimationManager._frames[key] = window.requestAnimationFrame(() => {
        AnimationManager._frames[key] = window.requestAnimationFrame((timestamp) => {
          delete AnimationManager._frames[key]
          callback(timestamp)
        })
      })
    } else {
      setTimeout(callback, 0)
    }

    return key
  }

  _cancelFrame = (key) => {
    if (AnimationManager._frames[key]) {
      cancelAnimationFrame(AnimationManager._frames[key])
      delete AnimationManager._frames[key]
    }
  }

  cancelFrames = (keys) => {
    if (isArray(keys)) {
      keys.forEach( (key) => {
        this._cancelFrame(key)
      })
    } else if (isString(keys) || isNumber(keys)) {
      this._cancelFrame(keys)
    }
  }
}
