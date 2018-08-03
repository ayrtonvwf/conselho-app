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
                <a class="btn-warning btn-sm tooltip tooltip-end" :href="&quot;#modal-edit-&quot; + subject.id" title="Editar disciplina">
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
    <modal v-for="subject in subjects" :key="subject.id" :anchor="'modal-edit-'+subject.id" title="Editar disciplina">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina editada com sucesso" data-error="Não foi possível editar a disciplina" @submit.prevent="subject_update">
            <input type="hidden" name="id" :value="subject.id"><br>
            <div class="row">
              <div class="input col-12 col-sm-8">
                <input required name="name" :value="subject.name" placeholder="Ex.: Matemática">
                <label>Nome</label>
              </div>
              <div class="col-12 col-sm-4">
                <label><br>
                  <input name="active" :value="1" :checked="parseInt(subject.active)" type="checkbox">Visível
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
    return this.$parent.$data
  },
  methods: {
    subject_save (event) {
      event.preventDefault()

      let app = this.$parent

      app.loading = true

      document.location.hash = '' // closes the current modal

      let form = event.target
      let subject = app.parseObject({
        name: form.querySelector('[name=name]').value,
        active: true
      })

      return app.save_resource('subject', subject).then(() => {
        app.loading = false
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        app.notify('Erro!', form.dataset.error, 'danger')
      })
    },
    subject_update (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      app.loading = true

      document.location.hash = '' // closes the current modal

      let form = event.target
      let subject = app.parseObject({
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        active: !!form.querySelector('[name=active]').checked
      })

      return app.save_resource('subject', subject).then(() => {
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
