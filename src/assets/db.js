import Dexie from 'dexie'

const db = new Dexie('conselho')

db.version(2).stores({
  councils: 'id',
  council_grades: 'id',
  council_topics: 'id',
  council_observation_topics: 'id',
  evaluations: 'id',
  grades: 'id',
  grade_subjects: 'id',
  grade_observations: 'id',
  observation_topics: 'id',
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

db.version(3).stores({
  councils: 'id',
  council_grades: 'id',
  council_topics: 'id',
  council_observation_topics: 'id',
  evaluations: null,
  grades: 'id',
  grade_subjects: 'id',
  grade_observations: 'id',
  observation_topics: 'id',
  permissions: 'id',
  roles: 'id',
  role_types: 'id',
  role_type_permissions: 'id',
  schools: 'id',
  students: 'id',
  student_observations: null,
  student_grades: 'id',
  subjects: 'id',
  teachers: 'id',
  teacher_requests: 'id',
  topics: 'id',
  topic_options: 'id',
  users: 'id'
})

export default db
