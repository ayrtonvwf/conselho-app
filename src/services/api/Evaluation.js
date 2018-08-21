import {getResource, saveResource, updateResource} from './helpers'

export default {
  getEvaluations () {
    return getResource('evaluations')
  },

  createEvaluation (evaluation) {
    return saveResource('evaluation', evaluation)
  },

  updateEvaluation (evaluation) {
    return updateResource('evaluation', evaluation)
  }
}
