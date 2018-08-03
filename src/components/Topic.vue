<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">list</i>Tópicos</h1>
      </div>
      <div class="col text-right">
        <a class="btn-success btn-sm no-wrap" href="#modal-new">
          <div class="material-icons">add</div>
          Criar novo tópico
        </a>
      </div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table" v-if="topics.length">
          <thead>
          <tr>
            <th>Nome</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="topic in topics" :key="topic.id">
            <td :class="!parseInt(topic.active) ? 'text-muted' : ''">
              {{ topic.name }}
              <span class="text-muted" v-if="!parseInt(topic.active)">(invisível)</span>
            </td>
            <td class="text-right no-wrap">
              <a class="btn-warning btn-sm tooltip tooltip-end" :href="'#modal-'+topic.id" title="Editar tópico e suas opções de resposta">
                <div class="material-icons">edit</div>
                <span class="d-none d-md-inline">Editar</span>
              </a>
            </td>
          </tr>
          </tbody>
        </table>
        <div class="text-center text-muted" v-else><br>
          <div class="h4">Ainda não há nenhum tópico cadastrado</div><br>
        </div>
      </div>
    </article>
    <modal anchor="modal-new" title="Criar novo tópico">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Tópico cadastrado com sucesso" data-error="Não foi possível cadastrar o tópico" @submit.prevent="topic_save"><br>
            <div class="input">
              <input required placeholder="Ex.: Tarefas de casa" name="name" minlength="3">
              <label>Nome</label>
            </div>
            <hr>
            <div class="h4">Opções de resposta</div>
            <table class="table">
              <thead>
              <tr>
                <th>Nome</th>
                <th class="no-wrap">Valor (0-100)</th>
                <th class="text-center">Padrão</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(topic_option, i) in new_topic_options" :key="topic_option.id">
                <td>
                  <div class="input">
                    <input required style="margin: 0px" placeholder="Ex.: Excelente" v-model="topic_option.name" name="option_name[]" minlength="3">
                  </div>
                </td>
                <td>
                  <div class="input">
                    <input required type="number" min="0" max="100" style="margin: 0px" placeholder="0 - 100" v-model="topic_option.value" name="option_value[]">
                  </div>
                </td>
                <td class="text-center">
                  <input type="radio" name="option_default" value="1" v-model="topic_option.default" required>
                </td>
                <td class="text-right" style="margin-top: -2px">
                  <button class="btn-danger tooltip tooltip-end" title="Remover opção de resposta" style="margin: 0px 2px" :disabled="new_topic_options.length &lt;= 2" v-on:click="new_topic_options.splice(i, 1)" type="button">
                    <div class="material-icons">delete</div><span class="d-none d-md-inline"> Remover</span>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
            <div class="text-center">
              <button class="btn-primary tooltip" title="Criar uma nova opção de resposta para este tópico" type="button" v-on:click="new_topic_options.push({})">
                <div class="material-icons">add</div>Criar nova opção
              </button>
            </div><br><br><a class="btn-danger" href="#">
              <div class="material-icons">close</div>  Cancelar</a>
            <button class="btn-success pull-right" type="submit">
              <div class="material-icons">check</div>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>
    <modal v-for="topic in topics" :key="topic.id" :anchor="'modal-' + topic.id" title="Editar tópico">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Tópico editado com sucesso" data-error="Não foi possível editar o tópico" @submit.prevent="topic_update">
            <input type="hidden" name="id" :value="topic.id"><br>
            <div class="row">
              <div class="col-8">
                <div class="input">
                  <input required :value="topic.name" placeholder="Ex.: Tarefas de casa" name="name" minlength="3">
                  <label>Nome</label>
                </div>
              </div>
              <div class="col-4"><br>
                <label>
                  <input type="checkbox" name="active" value="1" :checked="parseInt(topic.active)"> Visível
                </label>
              </div>
            </div>
            <hr>
            <div class="h4">Opções de resposta</div>
            <table class="table">
              <thead>
              <tr>
                <th>Nome</th>
                <th>Valor (0-100)</th>
                <th class="text-center">Padrão</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="topic_option in orderedTopicOptions(topic.id)" :key="topic_option.id">
                <td>
                  <input type="hidden" name="option_id[]" :value="topic_option.id">
                  <div class="input">
                    <input required :value="topic_option.name" style="margin: 0px" placeholder="Ex.: Excelente" name="option_name[]" minlength="3">
                  </div>
                </td>
                <td>
                  <div class="input">
                    <input required :value="topic_option.value" type="number" min="0" max="100" style="margin: 0px" placeholder="0 - 100" name="option_value[]">
                  </div>
                </td>
                <td class="text-center">
                  <input type="radio" name="option_default" value="1" :checked="topic.topic_option_id === topic_option.id" required>
                </td>
              </tr>
              </tbody>
            </table>
            <div class="text-center">
              <button class="btn-primary tooltip" type="button" title="Criar uma nova opção de resposta para este tópico" v-on:click="topic_options.push({topic_id: topic.id})">
                <div class="material-icons">add</div>Criar nova opção
              </button>
            </div>
            <br><br>
            <a class="btn-danger" href="#">
              <div class="material-icons">close</div>
              Cancelar
            </a>
            <button class="btn-success pull-right" type="submit">
              <div class="material-icons">check</div>
              Salvar
            </button>
            <br>
          </form>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'Topic',
  data: function() {
    let data = this.$parent.$data
    data.orderedTopicOptions = this.$parent.orderedTopicOptions
    return data
  },
  methods: {
    topic_save (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      document.location.hash = '' // closes the current modal

      app.loading = true

      let form = event.target
      let topic = {
        name: form.querySelector('[name=name]').value,
        active: true,
        topic_option_id: null
      }

      let option_name_inputs = form.querySelectorAll('[name="option_name[]"]')
      let option_names = [].map.call(option_name_inputs, input => input.value)

      let option_value_inputs = form.querySelectorAll('[name="option_value[]"]')
      let option_values = [].map.call(option_value_inputs, input => input.value)

      let option_default_inputs = form.querySelectorAll('[name=option_default]')
      let option_defaults = [].map.call(option_default_inputs, input => input.checked)
      let default_option_index = option_defaults.indexOf(true)

      let options = []
      option_names.forEach((name, i) => {
        options.push({
          name: name,
          value: option_values[i],
          active: true
        })
      })

      return app.save_resource('topic', topic, true, false).then(response => {
        topic.id = response.id

        let save_options = []

        options.forEach(option => {
          option.topic_id = response.id
          save_options.push(app.save_resource('topic_option', option, true, false))
        })

        return Promise.all(save_options)
      }).then(promises_response => {
        if (default_option_index === -1) {
          return
        }

        topic.topic_option_id = promises_response[default_option_index].id
        return app.save_resource('topic', topic)
      }).then(() => {
        return Promise.all([
          app.db.topics.toArray().then(data => app.topics = data),
          app.db.topic_options.toArray().then(data => app.topic_options = data)
        ])
      }).then(() => {
        app.loading = false
        app.notify('Sucesso!', form.dataset.success, 'success')
        component.$forceUpdate()
      }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        app.notify('Erro!', form.dataset.error, 'danger')
        component.$forceUpdate()
      })
    },
    topic_update (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      document.location.hash = '' // closes the current modal

      app.loading = true

      let form = event.target

      let option_id_inputs = form.querySelectorAll('[name="option_id[]"]')
      let option_ids = [].map.call(option_id_inputs, input => input.value)

      let option_name_inputs = form.querySelectorAll('[name="option_name[]"]')
      let option_names = [].map.call(option_name_inputs, input => input.value)

      let option_value_inputs = form.querySelectorAll('[name="option_value[]"]')
      let option_values = [].map.call(option_value_inputs, input => input.value)

      let option_default_inputs = form.querySelectorAll('[name=option_default]')
      let option_defaults = [].map.call(option_default_inputs, input => input.checked)
      let default_option_index = option_defaults.indexOf(true)

      let topic = {
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        active: form.querySelector('[name=active]').checked,
        topic_option_id: option_ids[default_option_index] ? option_ids[default_option_index] : null
      }

      let options = []
      option_names.forEach((name, i) => {
        options.push({
          id: option_ids[i],
          name: name,
          value: option_values[i],
          active: true,
          topic_id: topic.id
        })
      })

      return app.save_resource('topic', topic, true, false).then(() => {
        let save_options = []

        options.forEach(option => {
          save_options.push(app.save_resource('topic_option', option, true, false))
        })

        return Promise.all(save_options)
      }).then(() => {
        return Promise.all([
          app.db.topics.toArray().then(data => app.topics = data),
          app.db.topic_options.toArray().then(data => app.topic_options = data)
        ])
      }).then(() => {
        app.loading = false
        app.notify('Sucesso!', form.dataset.success, 'success')
        component.$forceUpdate()
      }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        app.notify('Erro!', form.dataset.error, 'danger')
        component.$forceUpdate()
      })
    }
  }
}
</script>
