var data = {
    pathname: document.location.pathname,
    token: {
        value: '68fba17762ba2728abedd746b5b5e9112f5d41ac65fc50f906eef3c543467cd4',
        expires_at: ''
    },
    user: {
        id: 1,
        name: 'Ayrton Fidelis'
    },

    councils: [],
    council_grades: [],
    council_topics: [],
    evaluations: [],
    grades: [],
    grade_subjects: [],
    grade_observations: [],
    medical_reports: [],
    medical_report_subjects: [],
    role_types: [],
    role_type_permissions: [],
    schools: [],
    students: [],
    student_grades: [],
    subjects: [],
    topics: [],
    topic_options: [],
    users: []
}

if (document.location.pathname.endsWith('evaluate.html')) {
    let current_council_id = new URL(document.location.href).searchParams.get('id')
    data.current_council = data.councils.find(function(council) {
        return council.id == current_council_id
    })
}

var app = new Vue({
    el: '#app',
    data: data
})

var db = new Dexie('conselho', {addons: [dexieRelationships]})
db.version(1).stores({
    councils: 'id, name, active, start_date, end_date',
    council_grades: 'id, council_id -> councils.id, grade_id -> grades.id',
    council_topics: 'id, council_id -> councils.id, topic_id -> topics.id',
    evaluations: 'id, council_id -> councils.id, user_id -> users.id, student_id -> students.id, grade_id -> grades.id, subject_id -> subjects.id, topic_id -> topics.id, topic_option_id -> topic_options.id',
    grades: 'id, name, level, active',
    grade_subjects: 'id, grade_id -> grades.id, subject_id -> subjects.id',
    grade_observations: 'id, grade_id -> grades.id, council_id -> councils.id, user_id -> users.id, subject_id -> subjects.id, observation',
    medical_reports: 'id, student_id -> students.id',
    medical_report_subjects: 'id, medical_report_id -> medical_reports.id, subject_id -> subjects.id',
    role_types: 'id, name',
    role_type_permissions: 'id, role_type_id -> role_types.id, permission_id -> permissions.id',
    schools: 'id, name',
    students: 'id, name',
    student_grades: 'id, number, start_date, end_date, grade_id -> grades.id, student_id -> students.id',
    subjects: 'id, name, active',
    topics: 'id, active, name, topic_option_id -> topic_options.id',
    topic_options: 'id, active, name, value',
    users: 'id, name, &email'

})

db.tables.forEach((table) => {
    let table_name = table.name
    db[table_name].toArray().then((items) => {
        app._data[table_name].push(...items)
    })
})

function seed() {
    return db.transaction('rw', db.councils, db.council_grades, db.council_topics, db.evaluations, db.grades,
        db.grade_subjects, db.grade_observations, db.medical_reports, db.medical_report_subjects, db.role_types,
        db.role_type_permissions, db.schools, db.students, db.student_grades, db.subjects, db.topics, db.topic_options, db.users, () => {
            api_fetch('council').then((response) => {
                return response.json()
            }).then((data) => {
                db.councils.bulkAdd(data.results);
            })
            api_fetch('council_grade').then((response) => {
                return response.json()
            }).then((data) => {
                db.council_grades.bulkAdd(data.results);
            })
            api_fetch('council_topic').then((response) => {
                return response.json()
            }).then((data) => {
                db.council_topics.bulkAdd(data.results);
            })
            api_fetch('evaluation').then((response) => {
                return response.json()
            }).then((data) => {
                db.evaluations.bulkAdd(data.results);
            })
            api_fetch('grade').then((response) => {
                return response.json()
            }).then((data) => {
                db.grades.bulkAdd(data.results);
            })
            api_fetch('grade_subject').then((response) => {
                return response.json()
            }).then((data) => {
                db.grade_subjects.bulkAdd(data.results);
            })
            api_fetch('grade_observation').then((response) => {
                return response.json()
            }).then((data) => {
                db.grade_observations.bulkAdd(data.results);
            })
            api_fetch('medical_report').then((response) => {
                return response.json()
            }).then((data) => {
                db.medical_reports.bulkAdd(data.results);
            })
            api_fetch('medical_report_subject').then((response) => {
                return response.json()
            }).then((data) => {
                db.medical_report_subjects.bulkAdd(data.results);
            })
            api_fetch('role_type').then((response) => {
                return response.json()
            }).then((data) => {
                db.role_types.bulkAdd(data.results);
            })
            api_fetch('role_type_permission').then((response) => {
                return response.json()
            }).then((data) => {
                db.role_type_permissions.bulkAdd(data.results);
            })
            api_fetch('school').then((response) => {
                return response.json()
            }).then((data) => {
                db.schools.bulkAdd(data.results);
            })
            api_fetch('student').then((response) => {
                return response.json()
            }).then((data) => {
                db.students.bulkAdd(data.results);
            })
            api_fetch('student_grade').then((response) => {
                return response.json()
            }).then((data) => {
                db.student_grades.bulkAdd(data.results);
            })
            api_fetch('subject').then((response) => {
                return response.json()
            }).then((data) => {
                db.subjects.bulkAdd(data.results);
            })
            api_fetch('topic').then((response) => {
                return response.json()
            }).then((data) => {
                db.topics.bulkAdd(data.results);
            })
            api_fetch('topic_option').then((response) => {
                return response.json()
            }).then((data) => {
                db.topic_options.bulkAdd(data.results);
            })
            api_fetch('user').then((response) => {
                return response.json()
            }).then((data) => {
                db.users.bulkAdd(data.results);
            })
        })
}

var login = {
    id: 3,
    name: 'John Doe',
    email: 'john.doe@email.com',
    password: 'johndoe'
}

function api_fetch(path, method, body, headers) {
    if (method === undefined) {
        method = 'GET'
    }

    if (body === undefined || body === null || method === 'GET') {
        body = undefined
    } else {
        body = JSON.stringify(body)
    }

    if (headers === undefined) {
        headers = {}
    }

    headers = new Headers(headers)
    headers.set('Timezone', '-03:00')
    headers.set('Accept', 'application/json; charset=UTF-8')
    headers.set('Content-Type', 'application/json')
    headers.set('Token', '35b8f07e9c53e59e7697aba208f86dec314f9f3e9fe286b169d19b39b74bb94f')

    let url = 'https://conselho-api.infomec.net.br/'+path
    let options = {
        headers: headers,
        method: method,
        mode: 'cors',
        body: body
    }

    return fetch(url, options)
}