<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">book</i>Disciplinas</h1>
      </div>
      <div class="col text-right"><a class="btn-success btn-sm no-wrap" href="#modal-new">
        <div class="material-icons">add</div> Criar nova disciplina</a></div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table" v-if="orderedSubjects.length">
          <thead>
            <tr>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in orderedSubjects" :key="subject.id">
              <td :class="!parseInt(subject.active) ? 'text-muted' : ''">
                {{ subject.name }} <span class="text-muted" v-if="!parseInt(subject.active)">(invisível)</span>
              </td>
              <td class="text-right no-wrap">
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar disciplina" @click="setCurrentSubject(subject.id)">
                  <div class="material-icons">edit</div>
                  <span class="d-none d-md-inline">Editar</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-center text-muted" v-else><br>
          <div class="h4">Ainda não há nenhuma disciplina cadastrada</div><br>
        </div>
      </div>
    </article>
    <modal anchor="modal-new" title="Nova disciplina" ref="modalNew">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina cadastrada com sucesso" data-error="Não foi possível cadastrar a disciplina" @submit.prevent="subjectSave">
            <input type="hidden" name="active" value="1"><br>
            <div class="input">
              <input required name="name" placeholder="Ex.: Matemática">
              <label>Nome</label>
            </div>
            <br>
            <a class="btn-danger" href="#">
              <div class="material-icons">close</div> Cancelar
            </a>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button>
            <br>
          </form>
        </div>
      </div>
    </modal>
    <modal anchor="modal-edit" title="Editar disciplina" ref="modalEdit" @close="setCurrentSubject(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina editada com sucesso" data-error="Não foi possível editar a disciplina" @submit.prevent="subjectUpdate">
            <br>
            <div class="row">
              <div class="input col-12 col-sm-8">
                <input required name="name" :value="currentSubject.name" placeholder="Ex.: Matemática" minlength="3">
                <label>Nome</label>
              </div>
              <div class="col-12 col-sm-4">
                <label><br>
                  <input name="active" :value="1" :checked="parseInt(currentSubject.active)" type="checkbox">Visível
                </label>
              </div>
            </div>
            <br>
            <a class="btn-danger" href="#">
              <div class="material-icons">close</div> Cancelar
            </a>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  name: 'Subject',
  data () {
    return {
      'current_subject_id': undefined
    }
  },
  computed: {
    orderedSubjects () {
      return this.$store.getters['subjects/getOrderedSubjects']
    },

    currentSubject () {
      if (!this.current_subject_id) {
        return {}
      }

      return this.orderedSubjects.find(subject =>
        subject.id === this.current_subject_id
      )
    }
  },
  methods: {
    setCurrentSubject (subjectId) {
      this.current_subject_id = subjectId
    },

    subjectSave (event) {
      this.$emit('loading')

      const form = event.target

      const subject = {
        name: form.querySelector('[name=name]').value,
        active: true
      }

      return this.$store.dispatch('subjects/create', subject).then(() => {
        form.querySelector('[name=name]').value = ''
        this.$emit('notify', 'Sucesso!', 'Disciplina criada com sucesso!', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível criar a disciplina.', 'danger')
        console.log('Error:', error.stack)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    subjectUpdate (event) {
      this.$emit('loading')

      const form = event.target

      const subject = {
        id: this.current_subject_id,
        name: form.querySelector('[name=name]').value,
        active: !!form.querySelector('[name=active]').checked
      }

      return this.$store.dispatch('subjects/update', subject).then(() => {
        this.$emit('notify', 'Sucesso!', 'Disciplina editada com sucesso!', 'success')
        this.$refs.modalEdit.close()
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível editar a disciplina.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    load () {
      const required = [
        'subjects'
      ]

      const promises = required.map(module =>
        this.$store.dispatch(module + '/loadFromDb')
      )

      return Promise.all(promises)
    }
  },

  beforeCreate () {
    this.$emit('loading')
  },

  created () {
    this.load().then(() => {
      this.$emit('loaded')
    })
  }
}
</script>
