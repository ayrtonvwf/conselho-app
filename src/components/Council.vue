<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">edit</i>Conselhos de Classe</h1>
      </div>
      <div class="col text-right"><a class="btn-success btn-sm no-wrap" href="#modal-new">
        <div class="material-icons">add</div> Criar novo conselho</a></div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table" v-if="councils.length">
          <thead>
          <tr>
            <th>Nome</th>
            <th class="d-none d-sm-table-cell">Período</th>
            <th class="d-none d-lg-table-cell">Status</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="council in councils" :class="activeCouncil(council.id) ? 'text-bold' : ''" :key="council.id">
            <td>{{ council.name }}</td>
            <td class="d-none d-sm-table-cell">{{ new Date(council.start_date).toLocaleDateString('pt-BR') }} - {{ new Date(council.end_date).toLocaleDateString('pt-BR') }}</td>
            <td class="d-none d-lg-table-cell">{{ councilStatus(council.id) }}</td>
            <td class="text-right no-wrap">
              <router-link class="btn-primary btn-sm tooltip tooltip-end" :to="{ name: 'Report', params: { id: council.id } }" title="Relatórios do conselho de classe">
                <div class="material-icons">search</div>
                <span class="d-none d-md-inline">Relatórios</span>
              </router-link>
              <a class="btn-warning btn-sm tooltip tooltip-end" :href="'#modal-edit-' + council.id" title="Editar informações do conselho">
                <div class="material-icons">edit</div>
                <span class="d-none d-md-inline">Editar</span>
              </a>
            </td>
          </tr>
          </tbody>
        </table>
        <div class="text-center text-muted" v-else><br>
          <div class="h4">Ainda não há nenhum conselho de classe cadastrado</div><br>
        </div>
      </div>
    </article>
    <div class="modal" id="modal-new">
      <div class="modal-header">Novo conselho de classe</div>
      <div class="modal-body">
        <div class="row justify-content-center">
          <div class="col-sm-11">
            <form action="#" data-success="Conselho de classe criado com sucesso" data-error="Não foi possível criar o conselho de classe" @submit.prevent="council_save"><br>
              <div class="row">
                <div class="col-md-4 input">
                  <input required :placeholder="'Ex.: '+ (~~((new Date().getMonth() + 1)/4)+1)+'° trimestre '+ new Date().getFullYear()" name="name">
                  <label>Nome</label>
                </div>
                <div class="col-sm-6 col-md-4 input">
                  <input type="date" required name="start_date">
                  <label>
                    Data inicial

                    <div class="material-icons tooltip" data-tooltip="Primeiro dia disponível para avaliação">help</div>
                  </label>
                </div>
                <div class="col-sm-6 col-md-4 input">
                  <input type="date" required name="end_date">
                  <label>
                    Data final

                    <div class="material-icons tooltip" data-tooltip="Último dia disponível para avaliação">help</div>
                  </label>
                </div>
              </div><br>
              <div class="row">
                <div class="col-6 col-md-4" v-for="topic in topics" v-if="topic.active" :key="topic.id">
                  <label>
                    <input type="checkbox" name="council_topic[]" :value="topic.id"> {{ topic.name }}
                  </label>
                </div>
              </div><br><a class="btn-danger" href="#">
                <div class="material-icons">close</div>  Cancelar</a>
              <button class="btn-success pull-right" type="submit">
                <div class="material-icons">check</div>  Salvar
              </button><br>
            </form>
          </div>
        </div>
      </div>
    </div><a class="modal-close" href="#"></a>
    <div v-for="council in councils" :key="council.id">
      <div class="modal" :id="'modal-edit-' + council.id">
        <div class="modal-header">Editar conselho de classe</div>
        <div class="modal-body">
          <div class="row justify-content-center">
            <div class="col-sm-11">
              <form action="#" data-success="Conselho de classe editado com sucesso" data-error="Não foi possível editar o conselho de classe" @submit.prevent="council_update">
                <input type="hidden" name="id" :value="council.id"><br>
                <div class="row">
                  <div class="col-md-4 input">
                    <input required name="name" :value="council.name" :placeholder="'Ex.: '+ (~~((new Date().getMonth() + 1)/4)+1)+'° trimestre '+ new Date().getFullYear()">
                    <label>Nome</label>
                  </div>
                  <div class="col-sm-6 col-md-4 input">
                    <input type="date" required name="start_date" :value="council.start_date" placeholder="Primeiro dia disponível para avaliação">
                    <label>
                      Data inicial

                      <div class="material-icons tooltip" data-tooltip="Primeiro dia disponível para avaliação">help</div>
                    </label>
                  </div>
                  <div class="col-sm-6 col-md-4 input">
                    <input type="date" required name="end_date" :value="council.end_date" placeholder="Primeiro dia disponível para avaliação">
                    <label>
                      Data final

                      <div class="material-icons tooltip" data-tooltip="Último dia disponível para avaliação">help</div>
                    </label>
                  </div>
                </div><br>
                <div class="row">
                  <div class="col-6 col-md-4" v-for="topic in topics" v-if="council_topics.find(council_topic => council_topic.council_id === council.id && council_topic.topic_id === topic.id)" :key="topic.id">
                    <div class="material-icons">check</div> {{ topic.name }}
                  </div>
                </div><br><a class="btn-danger" href="#">
                <div class="material-icons">close</div>  Cancelar</a>
                <button class="btn-success pull-right" type="submit">
                  <div class="material-icons">check</div>  Salvar
                </button><br>
              </form>
            </div>
          </div>
        </div>
      </div><a class="modal-close" href="#"></a>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'Council',
  data: function() {
    return this.$parent.$data
  },
  methods: {
    councilStatus (council_id) {
      let council = this.councils.find(council => council.id === council_id)
      let today = new Date()
      if (today > new Date(council.end_date)) {
        return 'Finalizado'
      }
      if (today < new Date(council.start_date)) {
        return 'Aguardando início'
      }
      return council.active ? 'Acontecendo' : 'Pausado'
    },
    activeCouncil (council_id) {
      let council = this.councils.find(council => council.id === council_id)
      let today = new Date()
      return council.status && today >= new Date(council.start_date) && today <= new Date(council.end_date)
    },
    council_save (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      document.location.hash = '' // closes the current modal

      app.loading = true

      let form = event.target
      let council = {
        name: form.querySelector('[name=name]').value,
        start_date: form.querySelector('[name=start_date]').value,
        end_date: form.querySelector('[name=end_date]').value,
        active: true
      }

      let council_topic_inputs = form.querySelectorAll('[name="council_topic[]"]:checked')
      let council_topic_ids = [].map.call(council_topic_inputs, input => input.value)

      return app.save_resource('council', council).then(response => {
        let save_council_topics = []

        council_topic_ids.forEach(topic_id => {
          save_council_topics.push(app.save_resource('council_topic', {
            topic_id: topic_id,
            council_id: response.id
          }))
        })

        let save_council_grades = []

        app.grades.forEach(grade => {
          save_council_grades.push(app.save_resource('council_grade', {
            grade_id: grade.id,
            council_id: response.id
          }))
        })
        return Promise.all(save_council_topics.concat(save_council_grades))
      }).then(() => {
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    },
    council_update (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      document.location.hash = '' // closes the current modal

      app.loading = true

      let form = event.target
      let council = {
        id: form.querySelector('[name=id]').value,
        name: form.querySelector('[name=name]').value,
        start_date: form.querySelector('[name=start_date]').value,
        end_date: form.querySelector('[name=end_date]').value,
        active: true
      }

      return app.save_resource('council', council).then(() => {
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    }
  }
}
</script>
