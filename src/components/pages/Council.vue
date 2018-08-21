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
        <table class="table" v-if="orderedCouncils.length">
          <thead>
            <tr>
              <th>Nome</th>
              <th class="d-none d-sm-table-cell">Período</th>
              <th class="d-none d-lg-table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="council in orderedCouncils" :class="activeCouncil(council.id) ? 'text-bold' : ''" :key="council.id">
              <td>{{ council.name }}</td>
              <td class="d-none d-sm-table-cell">{{ new Date(council.start_date).toLocaleDateString('pt-BR') }} - {{ new Date(council.end_date).toLocaleDateString('pt-BR') }}</td>
              <td class="d-none d-lg-table-cell">{{ councilStatus(council.id) }}</td>
              <td class="text-right no-wrap">
                <router-link class="btn-primary btn-sm tooltip tooltip-end" :to="{ name: 'Report', params: { id: council.id } }" title="Relatórios do conselho de classe">
                  <div class="material-icons">search</div>
                  <span class="d-none d-md-inline">Relatórios</span>
                </router-link>
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar informações do conselho" @click="setCurrentCouncil(council.id)">
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
          <form action="#" data-success="Conselho de classe criado com sucesso" data-error="Não foi possível criar o conselho de classe" @submit.prevent="councilSave"><br>
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
              <div class="col-6 col-md-4" v-for="topic in orderedActiveTopics" :key="topic.id">
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
    <modal anchor="modal-edit" title="Editar conselho de classe" ref="modalEdit" @close="setCurrentCouncil(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Conselho de classe editado com sucesso" data-error="Não foi possível editar o conselho de classe" @submit.prevent="councilUpdate">
            <br>
            <div class="row">
              <div class="col-md-4 input">
                <input required name="name" :value="currentCouncil.name" :placeholder="'Ex.: '+ (~~((new Date().getMonth() + 1)/4)+1)+'° trimestre '+ new Date().getFullYear()">
                <label>Nome</label>
              </div>
              <div class="col-sm-6 col-md-4 input">
                <input type="date" required name="start_date" :value="currentCouncil.start_date" placeholder="Primeiro dia disponível para avaliação">
                <label>
                  Data inicial

                  <div class="material-icons tooltip" data-tooltip="Primeiro dia disponível para avaliação">help</div>
                </label>
              </div>
              <div class="col-sm-6 col-md-4 input">
                <input type="date" required name="end_date" :value="currentCouncil.end_date" placeholder="Primeiro dia disponível para avaliação">
                <label>
                  Data final

                  <div class="material-icons tooltip" data-tooltip="Último dia disponível para avaliação">help</div>
                </label>
              </div>
            </div><br>
            <div class="row">
              <div class="col-6 col-md-4" v-for="topic in currentTopics" :key="topic.id">
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
export default {
  name: 'Council',
  data () {
    return {
      current_council_id: undefined
    }
  },
  computed: {
    orderedActiveTopics () {
      return this.$store.getters['topics/getOrderedTopics'].filter(topic =>
        topic.active
      )
    },

    orderedCouncils () {
      return this.$store.getters['councils/getOrderedCouncils']
    },

    currentCouncil () {
      if (!this.current_council_id) {
        return {}
      }

      const council = this.orderedCouncils.find(council =>
        council.id === this.current_council_id
      )

      return council || {}
    },

    currentTopics () {
      if (!this.current_council_id) {
        return []
      }

      return this.$store.getters['topics/getOrderedTopics'].filter(topic =>
        this.$store.getters['council_topics/getCouncilTopics'].find(councilTopic =>
          councilTopic.topic_id === topic.id &&
          councilTopic.council_id === this.current_council_id
        )
      )
    }
  },
  methods: {
    // getters
    councilStatus (councilId) {
      const council = this.orderedCouncils.find(council =>
        council.id === councilId
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

    activeCouncil (councilId) {
      const council = this.orderedCouncils.find(council =>
        council.id === councilId
      )

      const today = new Date()

      return council.active &&
        today >= new Date(council.start_date) &&
        today <= new Date(council.end_date)
    },

    // setters
    setCurrentCouncil (councilId) {
      this.current_council_id = councilId
    },

    councilSave (event) {
      this.$emit('loading')

      const form = event.target

      const councilTopicInputs = form.querySelectorAll('[name="council_topic[]"]:checked')
      const councilTopicIds = [].map.call(councilTopicInputs, input => input.value)

      const council = {
        name: form.querySelector('[name=name]').value,
        start_date: form.querySelector('[name=start_date]').value,
        end_date: form.querySelector('[name=end_date]').value,
        active: true
      }
      return this.$store.dispatch('councils/create', council).then(council => {
        const promises = []

        councilTopicIds.forEach(topicId => {
          const councilTopic = {
            topic_id: topicId,
            council_id: council.id
          }

          const promise = this.$store.dispatch('council_topics/create', councilTopic)

          promises.push(promise)
        })

        this.$store.getters['grades/getGrades'].forEach(grade => {
          const councilGrade = {
            grade_id: grade.id,
            council_id: council.id
          }

          const promise = this.$store.dispatch('council_grades/create', councilGrade)

          promises.push(promise)
        })

        return Promise.all(promises)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', 'Conselho de Classe cadastrado com sucesso!', 'success')
        this.$refs.modalNew.close()

        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=start_date]').value = ''
        form.querySelector('[name=end_date]').value = ''
        councilTopicInputs.forEach(input => {
          input.checked = false
        })
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível cadastrar o conselho de Classe.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    councilUpdate (event) {
      this.$emit('loading')

      const form = event.target
      const council = {
        id: this.current_council_id,
        name: form.querySelector('[name=name]').value,
        start_date: form.querySelector('[name=start_date]').value,
        end_date: form.querySelector('[name=end_date]').value,
        active: true
      }

      return this.$store.dispatch('councils/update', council).then(() => {
        this.$emit('notify', 'Sucesso!', 'Conselho de Classe editado com sucesso!', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível editar o Conselho de Classe.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  }
}
</script>
