var data = {
    paginate: ['subjects'],
    pathname: document.location.pathname,
    token: {},
    user: {
        id: 1,
        name: 'Ayrton Fidelis'
    },
    notification: {},
    new_question_options: [{}],

    councils: [],
    council_grades: [],
    council_topics: [],
    evaluations: [],
    grades: [],
    grade_subjects: [],
    grade_observations: [],
    medical_reports: [],
    medical_report_subjects: [],
    permissions: [],
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

let token = JSON.parse(localStorage.getItem('token'))
if (!token || new Date(token.expires_at) < new Date()) {
    location.href = 'login.html'
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
    councils: 'id, name, active, start_date, end_date, created_at, updated_at',
    council_grades: 'id, council_id -> councils.id, grade_id -> grades.id, created_at, updated_at',
    council_topics: 'id, council_id -> councils.id, topic_id -> topics.id, created_at, updated_at',
    evaluations: 'id, council_id -> councils.id, user_id -> users.id, student_id -> students.id, grade_id -> grades.id, subject_id -> subjects.id, topic_id -> topics.id, topic_option_id -> topic_options.id, created_at, updated_at',
    grades: 'id, name, level, active, created_at, updated_at',
    grade_subjects: 'id, grade_id -> grades.id, subject_id -> subjects.id, created_at, updated_at',
    grade_observations: 'id, grade_id -> grades.id, council_id -> councils.id, user_id -> users.id, subject_id -> subjects.id, observation, created_at, updated_at',
    medical_reports: 'id, student_id -> students.id, created_at, updated_at',
    medical_report_subjects: 'id, medical_report_id -> medical_reports.id, subject_id -> subjects.id, created_at, updated_at',
    permissions: 'id, name, reference, created_at, updated_at',
    role_types: 'id, name, created_at, updated_at',
    role_type_permissions: 'id, role_type_id -> role_types.id, permission_id -> permissions.id, created_at, updated_at',
    schools: 'id, name, created_at, updated_at',
    students: 'id, name, created_at, updated_at',
    student_grades: 'id, number, start_date, end_date, grade_id -> grades.id, student_id -> students.id, created_at, updated_at',
    subjects: 'id, name, active, created_at, updated_at',
    topics: 'id, active, name, topic_option_id -> topic_options.id, created_at, updated_at',
    topic_options: 'id, active, name, value, created_at, updated_at',
    users: 'id, name, &email, created_at, updated_at'

})

db.tables.forEach((table) => {
    let table_name = table.name
    update_view_data(table_name)
})

function update_view_data(resource) {
    if (resource === undefined) {
        let tables = db.tables.forEach((table) => {
            return update_view_data(table.name)
        })
    } else {
        return db[resource].toArray().then((items) => {
            app._data[resource] = []
            app._data[resource].push(...items)
        })
    }
}

function seed() {
    let promises = []

    db.tables.forEach((table) => {
        let table_name = table.name
        let path = table_name.slice(0, -1)

        let promise = api_fetch(path).then((response) => {
            // get data from api
            return response.json()
        }).then((data) => {
            // put data into db
            return db[table_name].bulkPut(data.results)
        })

        promises.push(promise)
    })

    return Promise.all(promises).then(() => {
        // when all data is updated into the db, update the view
        update_view_data()
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

    if (method === 'GET' || method === 'DELETE') {
        body === undefined
    } else {
        body.school_id = 1
        body = JSON.stringify(body)
    }

    if (headers === undefined) {
        headers = {}
    }

    headers = new Headers(headers)
    headers.set('Timezone', '-03:00')
    headers.set('Accept', 'application/json; charset=UTF-8')
    headers.set('Content-Type', 'application/json')
    headers.set('Token', token.value)

    let url = 'http://localhost/conselho-server/'+path
    let options = {
        headers: headers,
        method: method,
        mode: 'cors',
        body: body
    }

    return fetch(url, options).then((response) => {
        if (!response.ok) {
            throw response
        }
        return response
    })
}

function form_submit(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let resource = form.dataset.resource
    let form_data = new FormData(form)
    var data = {}
    form_data.forEach(function(value, field) {
        data[field] = value
    })

    form.querySelectorAll('[type=checkbox]').forEach((checkbox) => {
        data[checkbox.name] = checkbox.checked
    })

    save_resource(resource, data).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch((error) => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}

function delete_resource(resource_name, id) {
    document.location.hash = '' // closes modal

    return api_fetch(resource_name+'/'+id, 'DELETE').then((response) => {
        return db[resource_name+'s'].where({id: ''+id}).delete()
    }).then(() => {
        update_view_data(resource_name+'s')
        notify('Sucesso!', 'Excluído com sucesso', 'success')
    }).catch(() => {
        notify('Erro!', 'Não foi possível excluir', 'danger')
    })
}

function save_resource(resource_name, data) {
    var path = resource_name
    var method = 'POST'

    if (data.id !== undefined) {
        path += '/'+data.id
        method = 'PATCH'
    }

    return api_fetch(path, method, data).then(function(response) {
        return response.json()
    }).then(function(json) {
        if (json.created_at !== undefined) {
            data.id = json.id
            data.created_at = json.created_at
            data.updated_at = json.created_at
        } else {
            data.updated_at = json.updated_at
        }
        return db[resource_name+'s'].put(data).then(() => {
            return update_view_data(resource_name+'s')
        })
    }).then(() => data)
}

function notify(title, message, style, time) {
    if (time === undefined) {
        time = 5000
    }

    if (style === undefined) {
        style = 'info'
    }

    var icon
    if (style === 'success') {
        icon = 'check'
    } else if (style === 'danger') {
        icon = 'close'
    } else if (style === 'warning') {
        icon = 'warning'
    } else if (style === 'info' || style === 'primary') {
        icon = 'info'
    }

    let timestamp = Date.now().toString()

    document.getElementById('no-notification').checked = true

    // it there's already a notification, delay to transition
    let start_delay = Object.keys(app.notification).length > 0 ? 500 : 0

    setTimeout(() => {
        app.notification = {
            style: style,
            icon: icon,
            title: title,
            message: message,
            timestamp: timestamp
        }

        document.getElementById('notification-shown').checked = true

        setTimeout(() => {
            if (app.notification.timestamp !== timestamp) {
                return
            }

            document.getElementById('no-notification').checked = true

            setTimeout(() => { // delay to transition
                if (app.notification.timestamp !== timestamp) {
                    return
                }

                app.notification = {}
            }, 500)
        }, time)
    }, start_delay)
}

function submit_topic(event) {
    event.preventDefault()

    document.location.hash = '' // closes the current modal

    let form = event.target
    let resource = 'topic'
    var topic = {
        name: form.querySelector('[name=name]').value,
        active: true
    }

    let option_name_inputs = form.querySelectorAll('[name="option_name[]"]')
    let option_names = [].map.call(option_name_inputs, input => input.value)

    let option_value_inputs = form.querySelectorAll('[name="option_value[]"]')
    let option_values = [].map.call(option_value_inputs, input => input.value)

    let option_default_inputs = form.querySelectorAll('[name=option_default]')
    let option_defaults = [].map.call(option_default_inputs, input => input.checked)
    let default_option_index = option_defaults.indexOf(true)

    var options = []
    option_names.forEach((name, i) => {
        options.push({
            name: name,
            value: option_values[i],
            active: true
        })
    })

    return save_resource('topic', topic).then(response => {
        topic.id = response.id

        var save_options = []

        options.forEach((option) => {
            option.topic_id = topic.id
            save_options.push(save_resource('topic_option', option))
        })

        return Promise.all(save_options)
    }).then(promises_response => {
        if (default_option_index === -1) {
            return;
        }

        topic.topic_option_id = promises_response[default_option_index].id
        return save_resource('topic', topic)
    }).then(() => {
        notify('Sucesso!', form.dataset.success, 'success')
    }).catch((error) => {
        console.log('Error:', error)
        notify('Erro!', form.dataset.error, 'danger')
    })
}
