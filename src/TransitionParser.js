/**
 * @license Copyright 2017 Thomas Varghese, MIT License
 * see https://github.com/numbervine/react-transition-array/blob/master/LICENSE
 */

import StyleHelper from './StyleHelper'
import has from 'lodash/has'
import union from 'lodash/union'
import intersection from 'lodash/intersection'
import maxBy from 'lodash/maxBy'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import { isVoid } from 'misc-utils'

const _styleHelper = new StyleHelper

export default class TransitionParser {

  matchesProperty = (propertyKey, transitionProperties) => {
    let candidateProperties = _styleHelper.expandPropertyKey(propertyKey)
    let targetProperties = []
    if (isArray(transitionProperties)) {
      transitionProperties.forEach( (property) => {
        if (isString(property)) {
          targetProperties = union(targetProperties,_styleHelper.expandPropertyKey(property))
        }
      })
    } else if (isString(transitionProperties)) {
      targetProperties = union(targetProperties,_styleHelper.expandPropertyKey(transitionProperties))
    }
    return isVoid(intersection(candidateProperties,targetProperties))
  }

  processStyle = (style) => {
    let { filters } = this.transitionFilter(style)
    if (typeof filters == "undefined") return {}

    let transitionProperties = [], transitionDurations = [], transitionDelays = []
    filters.forEach((filter)=> {
      let { result } = filter
      if (has(result,'transition')) {
        transitionProperties = union(transitionProperties,result.transition.transitionProperty)
        transitionDurations = union(transitionDurations,result.transition.transitionDuration)
        transitionDelays = union(transitionDelays,result.transition.transitionDelay)
      } else if (has(result,'transitionProperty')) {
        transitionProperties = union(transitionProperties,result.transitionProperty)
      } else if (has(result,'transitionDuration')) {
        transitionDurations = union(transitonDurations,result.transitionDuration)
      } else if (has(result,'transitionDelay')) {
        transitionDelays = union(transitionDelays,result.transitionDelay)
      }
    })

    return this.findLongestTransition( { transitionProperties, transitionDurations, transitionDelays } )
  }

  findLongestTransition = ( payload ) => {
    let { transitionProperties, transitionDurations, transitionDelays } = payload

    let combinedTransitions = []
    for (let i=0; i<transitionProperties.length; i++) {
      let transitionTmp = {}
      transitionTmp.transitionProperty = transitionProperties[i]
      transitionTmp.transitionDuration = transitionDurations[i%transitionDurations.length]
      transitionTmp.transitionDelay = transitionDelays[i%transitionDelays.length]
      combinedTransitions.push(transitionTmp)
    }

    let longestTransition = maxBy(combinedTransitions, (transition) => {
      return transition.transitionDuration + transition.transitionDelay
    })

    return { ... payload, longestTransition }
  }

  transitionFilter = (style) => {

    let filters = [
      {
        name: 'transition',
        result: {},
        filterKeys: ['transition', 'WebkitTransition', 'MozTransition','msTransition'],
        filterProcess: (payload) => {
          let { raw } = payload

          let transitionProperties = []
          let transitionDurations = []
          let transitionDelays = [];
          let timeRegex = /^([0-9]*\.?[0-9]+)(m?s)$/
          let transitions = raw.toLowerCase().trim().split(/\s*,\s*/)

          transitions.forEach((transition) => {
            let transitionComponents = transition.split(/\s+/)

            transitionProperties.push(transitionComponents[0]);
            transitionDurations.push(transitionComponents[1] || '0s')
            if (typeof transitionComponents[2] == "undefined") {
              transitionDelays.push('0s')
            }
            else if (timeRegex.test(transitionComponents[2])) {
              transitionDelays.push(transitionComponents[2])
            }
            else if (typeof transitionComponents[3] == "undefined") {
              transitionDelays.push('0s')
            }
            else {
              transitionDelays.push(transitionComponents[3])
            }
          })

          transitionDurations = _styleHelper.parseTime(transitionDurations)
          transitionDelays = _styleHelper.parseTime(transitionDelays)

          return { transitionProperty: transitionProperties, transitionDuration: transitionDurations, transitionDelay: transitionDelays }
        }
      },
      {
        name: 'transitionProperty',
        result: {},
        filterKeys: ['transitionProperty', 'WebkitTransitionProperty', 'MozTransitionProperty','msTransitionProperty'],
        filterProcess: (payload) => {
          let { raw } = payload
          return raw.toLowerCase().trim().split(/\s*,\s*/)
        }
      },
      {
        name: 'transitionDuration',
        result: {},
        filterKeys: ['transitionDuration', 'WebkitTransitionDuration', 'MozTransitionDuration','msTransitionDuration'],
        filterProcess: (payload) => {
          let { raw } = payload
          let values = raw.toLowerCase().trim().split(/\s*,\s*/)
          return _styleHelper.parseTime(values)
        }
      },
      {
        name: 'transitionDelay',
        result: {},
        filterKeys: ['transitionDelay', 'WebkitTransitionDelay', 'MozTransitionDelay','msTransitionDelay'],
        filterProcess: (payload) => {
          let { raw } = payload
          let values = raw.toLowerCase().trim().split(/\s*,\s*/)
          return _styleHelper.parseTime(values)
        }
      }
    ]
    return _styleHelper.filter({ style, filters })
  }
}
