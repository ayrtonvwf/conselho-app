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
        <table class="table" v-if="$store.state.topics.length">
          <thead>
          <tr>
            <th>Nome</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="topic in $store.state.topics" :key="topic.id">
            <td :class="!parseInt(topic.active) ? 'text-muted' : ''">
              {{ topic.name }}
              <span class="text-muted" v-if="!parseInt(topic.active)">(invisível)</span>
            </td>
            <td class="text-right no-wrap">
              <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar tópico" @click="setCurrentTopic(topic.id)">
                <div class="material-icons">edit</div>
                <span class="d-none d-md-inline">Editar</span>
              </a>
              <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-topic_options" title="Opções de resposta" @click="setCurrentTopic(topic.id)">
                <div class="material-icons">list</div>
                <span class="d-none d-md-inline">Opções</span>
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

    <modal anchor="modal-new" title="Criar novo tópico" ref="modalNew">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Tópico cadastrado com sucesso" data-error="Não foi possível cadastrar o tópico" @submit.prevent="topicSave"><br>
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
              <tr v-for="(topic_option, index) in new_topic_options" :key="'new-topic-option'+index">
                <td>
                  <div class="input">
                    <input required style="margin: 0px" placeholder="Ex.: Excelente" v-model="topic_option.name" name="topic_option_name[]" minlength="3">
                  </div>
                </td>
                <td>
                  <div class="input">
                    <input required type="number" min="0" max="100" style="margin: 0px" placeholder="0 - 100" v-model="topic_option.value" name="topic_option_value[]">
                  </div>
                </td>
                <td class="text-center">
                  <input type="radio" name="option_default" value="1" v-model="topic_option.default" required>
                </td>
                <td class="text-right" style="margin-top: -2px">
                  <button class="btn-danger tooltip tooltip-end" title="Remover opção de resposta" style="margin: 0px 2px" :disabled="new_topic_options.length <= 2" @click="removeNewTopicOption(index)" type="button">
                    <div class="material-icons">delete</div>
                    <span class="d-none d-md-inline">Remover</span>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
            <div class="text-center">
              <button class="btn-primary tooltip" title="Criar uma nova opção de resposta para este tópico" type="button" @click="newTopicOption">
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

    <modal anchor="modal-edit" title="Editar tópico" ref="modalEdit" @close="setCurrentTopic(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Tópico editado com sucesso" data-error="Não foi possível editar o tópico" @submit.prevent="topicUpdate">
            <br>
            <div class="row">
              <div class="col-8">
                <div class="input">
                  <input required :value="currentTopic.name" placeholder="Ex.: Tarefas de casa" name="name" minlength="3">
                  <label>Nome</label>
                </div>
              </div>
              <div class="col-4"><br>
                <label>
                  <input type="checkbox" name="active" value="1" :checked="parseInt(currentTopic.active)"> Visível
                </label>
              </div>
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

    <modal anchor="modal-topic_options" title="Editar opções de resposta" ref="modalTopicOptions" @close="setCurrentTopic(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Opções editadas com sucesso" data-error="Não foi possível editar as opções de resposta" @submit.prevent="topicOptionsUpdate">
            <br>
            <table class="table">
              <thead>
              <tr>
                <th>Nome</th>
                <th>Valor (0-100)</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
                <tr v-for="(topic_option, index) in editing_topic_options" :key="index">
                  <td>
                    <div class="input">
                      <input required v-model="topic_option.name" style="margin: 0px" placeholder="Ex.: Excelente" name="topic_option_name[]" minlength="3">
                    </div>
                  </td>
                  <td>
                    <div class="input">
                      <input required v-model="topic_option.value" type="number" min="0" max="100" style="margin: 0px" placeholder="0 - 100" name="topic_option_value[]">
                    </div>
                  </td>
                  <td class="text-right">
                    <template v-if="topic_option.id">
                      <button type="button" class="btn btn-success disabled tooltip tooltip-end" title="Esta já é a opção padrão" v-if="currentTopic.topic_option_id === topic_option.id">
                        <span class="material-icons">check</span>
                      </button>
                      <button type="button" class="btn btn-warning tooltip tooltip-end" title="Tornar esta a opção padrão" v-else @click="updateDefaultOption(topic_option.id)">
                        <span class="material-icons">close</span>
                      </button>
                    </template>
                    <button class="btn-danger tooltip tooltip-end" title="Remover opção de resposta" style="margin: 0px 2px" @click="removeEditingTopicOption(index)" type="button" v-else>
                      <span class="material-icons">delete</span>
                      <span class="d-none d-md-inline">Remover</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-center">
              <button class="btn-primary tooltip" type="button" title="Criar uma nova opção de resposta para este tópico" v-on:click="newTopicOption">
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
/* eslint camelcase: 0 */
export default {
  name: 'Topic',
  data () {
    return {
      current_topic_id: undefined,

      /* needed to use v-model and don't loose already
      typed data when adding a new topic_option */
      new_topic_options: [{}, {}],
      editing_topic_options: []
    }
  },
  computed: {
    currentTopic () {
      if (!this.current_topic_id) {
        return {}
      }

      const topic = this.$store.state.topics.find(topic =>
        topic.id === this.current_topic_id
      )

      return topic || {}
    },

    currentTopicOptions () {
      if (!this.current_topic_id) {
        return []
      }

      return this.$store.state.topic_options.filter(topic_option =>
        topic_option.topic_id === this.current_topic_id
      )
    }
  },
  watch: {
    current_topic_id () {
      if (!this.current_topic_id) {
        this.editing_topic_options = []
        return
      }

      this.editing_topic_options = JSON.parse(JSON.stringify(this.currentTopicOptions))
    }
  },
  methods: {
    setCurrentTopic (topic_id) {
      this.current_topic_id = topic_id

      if (topic_id) {
        this.new_topic_options = []
      } else {
        this.new_topic_options = [{}, {}]
      }
    },

    removeNewTopicOption (index) {
      this.$delete(this.new_topic_options, index)
    },

    removeEditingTopicOption (index) {
      this.$delete(this.editing_topic_options, index)
    },

    topicSave (event) {
      this.$emit('loading')

      const form = event.target
      const topic = {
        name: form.querySelector('[name=name]').value,
        active: true,
        topic_option_id: null
      }

      const option_name_inputs = form.querySelectorAll('[name="topic_option_name[]"]')
      const option_names = [].map.call(option_name_inputs, input => input.value)

      const option_value_inputs = form.querySelectorAll('[name="topic_option_value[]"]')
      const option_values = [].map.call(option_value_inputs, input => input.value)

      const option_default_inputs = form.querySelectorAll('[name="option_default"]')
      const option_defaults = [].map.call(option_default_inputs, input => input.checked)
      const default_option_index = option_defaults.indexOf(true)

      const options = []
      option_names.forEach((name, i) => {
        options.push({
          name: name,
          value: option_values[i],
          active: true
        })
      })

      const save_resource = {
        resource_name: 'topic',
        data: topic
      }
      return this.$store.dispatch('save_resource', save_resource).then(response => {
        topic.id = response.id

        const save_options = []

        options.forEach(option => {
          option.topic_id = response.id

          const save_resource = {
            resource_name: 'topic_option',
            data: option
          }
          const promise = this.$store.dispatch('save_resource', save_resource)

          save_options.push(promise)
        })

        return Promise.all(save_options)
      }).then(promises_response => {
        if (default_option_index === -1) {
          return
        }

        topic.topic_option_id = promises_response[default_option_index].id

        const save_resource = {
          resource_name: 'topic',
          data: topic
        }
        return this.$store.dispatch('save_resource', save_resource)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        form.querySelector('[name=name]').value = ''
        this.new_topic_options = [{}, {}]
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    topicUpdate (event) {
      this.$emit('loading')

      const form = event.target

      const topic = {
        id: this.current_topic_id,
        name: form.querySelector('[name=name]').value,
        active: form.querySelector('[name=active]').checked,
        topic_option_id: this.currentTopic.topic_option_id
      }

      const save_resource = {
        resource_name: 'topic',
        data: topic
      }
      return this.$store.dispatch('save_resource', save_resource).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.$refs.modalEdit.close()
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    topicOptionsUpdate (event) {
      this.$emit('loading')

      const form = event.target

      const save_options = []

      this.editing_topic_options.forEach(topic_option => {
        const save_resource = {
          resource_name: 'topic_option',
          data: topic_option
        }
        const promise = this.$store.dispatch('save_resource', save_resource)

        save_options.push(promise)
      })

      return Promise.all(save_options).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.editing_topic_options = JSON.parse(JSON.stringify(this.currentTopicOptions))
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    updateDefaultOption (topic_option_id) {
      this.$emit('loading')

      const form = event.target

      const topic = {
        id: this.current_topic_id,
        name: this.currentTopic.name,
        active: this.currentTopic.active,
        topic_option_id: topic_option_id
      }

      const save_resource = {
        resource_name: 'topic',
        data: topic
      }
      return this.$store.dispatch('save_resource', save_resource).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    newTopicOption () {
      const blank_option = {
        topic_id: this.current_topic_id,
        active: true
      }

      if (this.current_topic_id) {
        this.editing_topic_options.push(blank_option)
      } else {
        this.new_topic_options.push(blank_option)
      }

      this.$nextTick(() => {
        const inputs = document.querySelectorAll('input[name="topic_option_name[]"]')

        if (!inputs.length) {
          return
        }

        inputs[inputs.length - 1].focus()
      })
    }
  },
  created () {
    this.current_topic_id = undefined
    this.new_topic_options = [{}, {}]
    this.editing_topic_options = []
  }
}
</script>
