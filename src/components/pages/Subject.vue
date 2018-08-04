<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">book</i>Disciplinas</h1>
      </div>
      <div class="col text-right"><a class="btn-success btn-sm no-wra" href="#modal-new">
        <div class="material-icons">add</div> Criar nova disciplina</a></div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table" v-if="subjects.length">
          <thead>
            <tr>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.id">
              <td :class="!parseInt(subject.active) ? 'text-muted' : ''">
                {{ subject.name }} <span class="text-muted" v-if="!parseInt(subject.active)">(invisível)</span>
              </td>
              <td class="text-right no-wrap">
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar disciplina" @click="current_subject_id = subject.id">
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
    <modal anchor="modal-new" title="Nova disciplina">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina cadastrada com sucesso" data-error="Não foi possível cadastrar a disciplina" @submit.prevent="subject_save">
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
              <div class="material-icons">check</div>  Salvar
            </button>
            <br>
          </form>
        </div>
      </div>
    </modal>
    <modal anchor="modal-edit" title="Editar disciplina">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina editada com sucesso" data-error="Não foi possível editar a disciplina" @submit.prevent="subject_update">
            <br>
            <div class="row">
              <div class="input col-12 col-sm-8">
                <input required name="name" :value="current_subject.id ? current_subject.name : ''" placeholder="Ex.: Matemática">
                <label>Nome</label>
              </div>
              <div class="col-12 col-sm-4">
                <label><br>
                  <input name="active" :value="1" :checked="current_subject.id && parseInt(current_subject.active)" type="checkbox">Visível
                </label>
              </div>
            </div>
            <br>
            <a class="btn-danger" href="#">
              <div class="material-icons">close</div> Cancelar
            </a>
            <button class="btn-success pull-right" type="submit">
              <div class="material-icons">check</div>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'Subject',
  data: function() {
    return {
      'subjects': [],
      'current_subject_id': undefined,
      'current_subject': {}
    }
  },
  watch: {
    current_subject_id() {
      if (!this.current_subject_id) {
        this.current_subject = {}
        return
      }

      this.current_subject = this.subjects.find(subject =>
        subject.id === this.current_subject_id
      )
    }
  },
  methods: {
    subject_save (event) {
      this.$emit('loading')

      let app = this.$parent

      let form = event.target

      let subject = {
        name: form.querySelector('[name=name]').value,
        active: true
      }

      return app.save_resource('subject', subject).then(subject => {
        document.location.hash = '' // closes the current modal

        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')

        this.subjects.push(subject)
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    subject_update (event) {
      this.$emit('loading')

      let app = this.$parent

      let form = event.target

      let subject = {
        id: this.current_subject_id,
        name: form.querySelector('[name=name]').value,
        active: !!form.querySelector('[name=active]').checked
      }

      return app.save_resource('subject', subject, true, false).then(subject => {
        document.location.hash = '' // closes the current modal

        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')

        let index = this.subjects.findIndex(subject =>
          subject.id === this.current_subject_id
        )
        this.$set(this.subjects, index, subject)
        this.current_subject = subject
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },
  created() {
    this.db = this.$parent.db
    this.loading = true
    this.subjects = []
    this.db.subjects.toArray().then(subjects => {
      this.subjects = subjects
    })
  }
}
</script>
