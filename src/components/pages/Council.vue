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
        <table class="table" v-if="$store.state.councils.length">
          <thead>
            <tr>
              <th>Nome</th>
              <th class="d-none d-sm-table-cell">Período</th>
              <th class="d-none d-lg-table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="council in $store.state.councils" :class="activeCouncil(council.id) ? 'text-bold' : ''" :key="council.id">
              <td>{{ council.name }}</td>
              <td class="d-none d-sm-table-cell">{{ new Date(council.start_date).toLocaleDateString('pt-BR') }} - {{ new Date(council.end_date).toLocaleDateString('pt-BR') }}</td>
              <td class="d-none d-lg-table-cell">{{ councilStatus(council.id) }}</td>
              <td class="text-right no-wrap">
                <router-link class="btn-primary btn-sm tooltip tooltip-end" :to="{ name: 'Report', params: { id: council.id } }" title="Relatórios do conselho de classe">
                  <div class="material-icons">search</div>
                  <span class="d-none d-md-inline">Relatórios</span>
                </router-link>
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar informações do conselho" @click="current_council_id = council.id">
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
    <modal anchor="modal-new" title="Novo conselho de classe" ref="modalNew">
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
              <div class="col-6 col-md-4" v-for="topic in $store.state.topics" v-if="topic.active" :key="topic.id">
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
    </modal>
    <modal anchor="modal-edit" title="Editar conselho de classe" ref="modalEdit">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Conselho de classe editado com sucesso" data-error="Não foi possível editar o conselho de classe" @submit.prevent="council_update">
            <br>
            <div class="row">
              <div class="col-md-4 input">
                <input required name="name" :value="current_council.name" :placeholder="'Ex.: '+ (~~((new Date().getMonth() + 1)/4)+1)+'° trimestre '+ new Date().getFullYear()">
                <label>Nome</label>
              </div>
              <div class="col-sm-6 col-md-4 input">
                <input type="date" required name="start_date" :value="current_council.start_date" placeholder="Primeiro dia disponível para avaliação">
                <label>
                  Data inicial

                  <div class="material-icons tooltip" data-tooltip="Primeiro dia disponível para avaliação">help</div>
                </label>
              </div>
              <div class="col-sm-6 col-md-4 input">
                <input type="date" required name="end_date" :value="current_council.end_date" placeholder="Primeiro dia disponível para avaliação">
                <label>
                  Data final

                  <div class="material-icons tooltip" data-tooltip="Último dia disponível para avaliação">help</div>
                </label>
              </div>
            </div><br>
            <div class="row">
              <div class="col-6 col-md-4" v-for="topic in current_topics" :key="topic.id">
                <div class="material-icons">check</div> {{ topic.name }}
              </div>
            </div>
            <br>
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
  name: 'Council',
  data () {
    return {
      current_council_id: undefined,
      current_council: {},
      current_topics: []
    }
  },
  watch: {
    current_council_id () {
      if (!this.current_council_id) {
        this.current_council = []
        this.current_topics = []
        return
      }

      this.current_council = this.$store.state.councils.find(council =>
        council.id === this.current_council_id
      )

      this.current_topics = this.$store.state.topics.filter(topic =>
        this.$store.state.council_topics.find(council_topic =>
          council_topic.topic_id === topic.id &&
          council_topic.council_id === this.current_council_id
        )
      )
    }
  },
  methods: {
    councilStatus (council_id) {
      const council = this.$store.state.councils.find(council =>
        council.id === council_id
      )

      const today = new Date()

      if (today > new Date(council.end_date)) {
        return 'Finalizado'
      }

      if (today < new Date(council.start_date)) {
        return 'Aguardando início'
      }

      return council.active ? 'Acontecendo' : 'Pausado'
    },

    activeCouncil (council_id) {
      const council = this.$store.state.councils.find(council =>
        council.id === council_id
      )

      const today = new Date()

      return council.active &&
        today >= new Date(council.start_date) &&
        today <= new Date(council.end_date)
    },

    council_save (event) {
      this.$emit('loading')

      const form = event.target

      const council_topic_inputs = form.querySelectorAll('[name="council_topic[]"]:checked')
      const council_topic_ids = [].map.call(council_topic_inputs, input => input.value)

      const save_resource = {
        resource_name: 'council',
        data: {
          name: form.querySelector('[name=name]').value,
          start_date: form.querySelector('[name=start_date]').value,
          end_date: form.querySelector('[name=end_date]').value,
          active: true
        }
      }
      return this.$store.dispatch('save_resource', save_resource).then(council => {
        const promises = []

        council_topic_ids.forEach(topic_id => {
          const save_resource = {
            resource_name: 'council_topic',
            data: {
              topic_id: topic_id,
              council_id: council.id
            }
          }

          const promise = this.$store.dispatch('save_resource', save_resource)

          promises.push(promise)
        })

        this.$store.state.grades.forEach(grade => {
          const save_resource = {
            resource_name: 'council_grade',
            data: {
              grade_id: grade.id,
              council_id: council.id
            }
          }

          const promise = this.$store.dispatch('save_resource', save_resource)

          promises.push(promise)
        })

        return Promise.all(promises)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.$refs.modalNew.close()

        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=start_date]').value = ''
        form.querySelector('[name=end_date]').value = ''
        council_topic_inputs.forEach(input => {
          input.checked = false
        })
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    council_update (event) {
      this.$emit('loading')

      const form = event.target

      const save_resource = {
        resource_name: 'council',
        data: {
          id: this.current_council_id,
          name: form.querySelector('[name=name]').value,
          start_date: form.querySelector('[name=start_date]').value,
          end_date: form.querySelector('[name=end_date]').value,
          active: true
        }
      }

      return this.$store.dispatch('save_resource', save_resource).then(council => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.current_council = council
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },
  created () {
    this.current_council_id = undefined
    this.current_council = {}
    this.current_topics = []
  }
}
</script>
