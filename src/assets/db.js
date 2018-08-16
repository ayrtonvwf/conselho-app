import Dexie from 'dexie'

const db = new Dexie('conselho')
db.version(1).stores({
  councils: 'id',
  council_grades: 'id',
  council_topics: 'id',
  evaluations: 'id',
  grades: 'id',
  grade_subjects: 'id',
  grade_observations: 'id',
  medical_reports: 'id',
  medical_report_subjects: 'id',
  permissions: 'id',
  roles: 'id',
  role_types: 'id',
  role_type_permissions: 'id',
  schools: 'id',
  students: 'id',
  student_observations: 'id',
  student_grades: 'id',
  subjects: 'id',
  teachers: 'id',
  teacher_requests: 'id',
  topics: 'id',
  topic_options: 'id',
  users: 'id'
})

export default db
