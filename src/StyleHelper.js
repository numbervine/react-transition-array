import has from 'lodash/has'
import get from 'lodash/get'
import findKey from 'lodash/findKey'
import trim from 'lodash/trim'
import union from 'lodash/union'
import isString from 'lodash/isString'
import { isVoid } from 'misc-utils'

const animateableShorthandPropertyMap = {
  '-moz-outline-radius-bottomleft': '-moz-outline-radius',
  '-moz-outline-radius-bottomright': '-moz-outline-radius',
  '-moz-outline-radius-topleft': '-moz-outline-radius',
  '-moz-outline-radius-topright': '-moz-outline-radius',
  '-webkit-text-stroke-color': '-webkit-text-stroke',
  '-webkit-text-stroke-width': '-webkit-text-stroke',

  'background-color': 'background',
  'background-position': 'background',
  'background-size': 'background',

  'border-bottom-color': 'border border-bottom border-color',
  'border-bottom-left-radius': 'border-radius',
  'border-bottom-right-radius': 'border-radius',
  'border-bottom-width': 'border border-bottom border-width',

  'border-left-color': 'border border-left border-color',
  'border-left-width': 'border border-left border-width',

  'border-right-color': 'border border-right border-color',
  'border-right-width': 'border border-right border-width',

  'border-top-color': 'border border-top border-color',
  'border-top-left-radius': 'border-radius',
  'border-top-right-radius': 'border-radius',
  'border-top-width': 'border border-top border-width',

  'column-rule-color': 'column-rule',
  'column-rule-width': 'column-rule',

  'column-width': 'columns',
  'column-count': 'columns',

  'flex-basis': 'flex',
  'flex-grow': 'flex',
  'flex-shrink': 'flex',

  'font-size': 'font',
  'font-weight': 'font',

  'grid-column-gap': 'grid-gap',
  'grid-row-gap': 'grid-gap',

  'line-height': 'font',

  'margin-bottom': 'margin',
  'margin-left': 'margin',
  'margin-right': 'margin',
  'margin-top': 'margin',

  'mask-position': 'mask',
  'mask-size': 'mask',

  'outline-color': 'outline',
  'outline-width': 'outline',

  'padding-bottom': 'padding',
  'padding-left': 'padding',
  'padding-right': 'padding',
  'padding-top': 'padding',

  'text-emphasis-color': 'text-emphasis'
}

export default class StyleHelper {

  expandPropertyKey = (propertyKey) => {
    if (!isString(propertyKey)) return []
    let result = []
    let inputKey = trim(propertyKey)
    let longhandKey = ''
    if (has(animateableShorthandPropertyMap,inputKey)) {
      longhandKey = inputKey
    } else {
      longhandKey = findKey( (o) => {
        o.split(' ').forEach( (candidateKey) => {
          if (candidateKey==propertyKey) {
            return true
          }
        })
        return false
      })
    }
    if (inputKey!=longhandKey) {
      result.push(inputKey)
    }
    if (!isVoid(longhandKey)) {
      result.push(longhandKey)
      result = union(result,get(animateableShorthandPropertyMap,longhandKey,'').split(' '))
    }
    return result
  }

  parseTime = (timeArray) => {
    let result = []

    timeArray.forEach( (time) => {
      let matches = time.match(/([0-9]*\.?[0-9]+)(m?s)/)
      if (matches) {
        if (matches[2] === 's') {
          result.push(parseFloat(matches[1] * 1000))
        } else {
          result.push(parseFloat(matches[1]))
        }
      }
      else {
        throw new Error('Unexpected time: ' + time + ', expecting duration / delay in millis (ms) or seconds (s)')
      }
    })

    return result
  }

  filter = (payload) => {
    let { style, filters } = payload
    if (typeof style == "undefined") return {}
    Object.keys(style).forEach( (styleKey) => {
      filters.forEach( (filterObj) => {
        let { result, filterKeys, filterProcess } = filterObj
        filterKeys.forEach( (filterKey) => {
          if (filterKey==styleKey) {
            result[filterKey] = filterProcess({ raw: style[styleKey] })
          }
        })
      })
    })

    return payload
  }
}
