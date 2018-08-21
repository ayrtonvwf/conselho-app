import axios from 'axios'
import {getResource, saveResource} from './helpers'

export default {
  getGradeSubjects () {
    return getResource('grade_subjects')
  },

  createGradeSubject (gradeSubject) {
    return saveResource('grade_subject', gradeSubject)
  },

  deleteGradeSubject (gradeSubjectId) {
    return axios.delete('/grade_subject/' + gradeSubjectId)
  }
}
