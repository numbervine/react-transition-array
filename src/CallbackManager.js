/**
 * @license Copyright 2017 Thomas Varghese, MIT License
 * see https://github.com/numbervine/react-transition-array/blob/master/LICENSE
 */

export default class CallbackManager {

  static _register = {}

  register = (callback, key, context) => {

    let wrappedFunction = () => {
      if (!key || !callback || typeof callback !== 'function') return
      callback.apply(context, arguments)
      this.cancel(key)
    }

    wrappedFunction.cancel = () => {
      delete CallbackManager._register[key]
    }

    CallbackManager._register[key] = wrappedFunction

    return wrappedFunction
  }

  cancel = (key) => {
    if (CallbackManager._register[key]) CallbackManager._register[key].cancel()
  }

  cancelAll = () => {
    Object.keys(CallbackManager._register).forEach((key) => {
      CallbackManager._register[key].cancel()
    })
  }
}
