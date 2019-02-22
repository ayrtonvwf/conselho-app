<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">people</i>Turma</h1>
      </div>
      <div class="col text-right">
        <a class="btn-success btn-sm no-wrap" href="#modal-new">
          <div class="material-icons">add</div>
          Criar nova turma
        </a>
      </div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table" v-if="orderedGrades.length">
          <thead>
            <tr>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in orderedGrades" :key="grade.id">
              <td :class="!parseInt(grade.active) ? 'text-muted' : ''">
                {{ grade.name }}
                <span class="text-muted" v-if="!parseInt(grade.active)">(invisível)</span>
              </td>
              <td class="text-right no-wrap">
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar informações da turma" @click="setCurrentGrade(grade.id)">
                  <div class="material-icons">edit</div>
                  <span class="d-none d-md-inline">Editar</span>
                </a>
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-subjects" title="Disciplinas" @click="setCurrentGrade(grade.id)">
                  <div class="material-icons">book</div>
                  <span class="d-none d-md-inline">Disciplinas</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-center text-muted" v-else><br>
          <div class="h4">Ainda não há nenhuma turma cadastrada</div><br>
        </div>
      </div>
    </article>

    <modal anchor="modal-new" title="Nova turma" ref="modalNew">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-resource="grade" data-success="Turma cadastrada com sucesso" data-error="Não foi possível cadastrar a turma" @submit.prevent="gradeSave">
            <input type="hidden" name="active" value="1"><br>
            <div class="row">
              <div class="col-sm-8 input">
                <input required placeholder="Ex.: 1° Ano A" name="name" minlength="3" autocomplete="off">
                <label>Nome</label>
              </div>
              <div class="col-sm-4 input">
                <input type="number" required min="1" placeholder="Ex. 1° ano: 1" name="level" step="1" autocomplete="off">
                <label>
                  Nível

                  <span class="material-icons tooltip tooltip-left tooltip-start" data-tooltip="1° ano: nível 1;&#xa;2° ano: nível 2;&#xa;3° ano: nível 3;&#xa;etc">info</span>
                </label>
              </div>
            </div><br>
            <div class="row">
              <div class="col-6 col-md-4" v-for="subject in orderedActiveSubjects" :key="subject.id">
                <label>
                  <input type="checkbox" name="grade_subject[]" :value="subject.id"> {{ subject.name }}
                </label>
              </div>
            </div><br><a class="btn-danger" href="#">
            <div class="material-icons">close</div>  Cancelar</a>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>

    <modal anchor="modal-edit" title="Editar turma" ref="modalEdit" @close="setCurrentGrade(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Turma editada com sucesso" data-error="Não foi possível editar a turma" @submit.prevent="gradeUpdate">
            <br>
            <div class="row">
              <div class="col-sm-8 input">
                <input required :value="currentGrade.name" placeholder="Ex.: 1° Ano A" name="name" minlength="3" autocomplete="off">
                <label>Nome</label>
              </div>
              <div class="col-sm-4 input">
                <input type="number" required :value="currentGrade.level" min="1" placeholder="Ex.: 1" name="level" step="1" autocomplete="off">
                <label>
                  Nível
                  <span class="material-icons tooltip tooltip-left tooltip-start" data-tooltip="1° ano: nível 1;&#xa;2° ano: nível 2;&#xa;3° ano: nível 3;&#xa;etc">info</span>
                </label>
              </div>
            </div>
            <div class="row">
              <div class="col-12 text-center">
                <label><br>
                  <input name="active" value="1" :checked="parseInt(currentGrade.active)" type="checkbox">Visível
                </label>
              </div>
            </div><br><a class="btn-danger" href="#">
            <div class="material-icons">close</div>  Cancelar</a>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>

    <modal anchor="modal-subjects" :title="'Disciplinas - '+(currentGrade ? currentGrade.name : '')" ref="modalSubjects">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina incluída com sucesso" data-error="Não foi possível incluir a disciplina" @submit.prevent="gradeSubjectSave"><br>
            <div class="row justify-content-center">
              <div class="col-12 col-sm-6 input">
                <select required name="subject_id">
                  <option value="" disabled hidden selected>Selecione...</option>
                  <option v-for="subject in orderedActiveSubjects" :value="subject.id" :key="subject.id" :disabled="currentGradeHasSubject(subject.id)">{{ subject.name }}</option>
                </select>
                <label>Disciplina</label>
              </div>
              <div class="col-12 col-sm-3"><br class="d-none d-sm-inline">
                <button class="btn-success" type="submit">
                  <span class="material-icons">check</span> Salvar
                </button>
              </div>
            </div>
            <div class="row">
              <div class="col-6 col-md-4" v-for="subject in currentSubjects" :key="subject.id">
                <div class="material-icons">check</div> {{ subject.name }}
              </div>
            </div><br><a class="btn-danger" href="#">
              <div class="material-icons">close</div>  Cancelar</a><br>
          </form>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  name: 'Grade',
  data () {
    return {
      current_grade_id: undefined
    }
  },
  computed: {
    orderedGrades () {
      return this.$store.getters['grades/getOrderedGrades']
    },

    orderedActiveSubjects () {
      return this.$store.getters['subjects/getOrderedSubjects'].filter(subject =>
        subject.active
      )
    },

    currentGrade () {
      if (!this.current_grade_id) {
        return {}
      }

      const grade = this.orderedGrades.find(grade =>
        grade.id === this.current_grade_id
      )

      return grade || {}
    },

    currentGradeSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['grade_subjects/getGradeSubjects'].filter(gradeSubject =>
        gradeSubject.grade_id === this.current_grade_id
      )
    },

    currentSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['subjects/getSubjects'].filter(subject =>
        this.currentGradeSubjects.find(gradeSubject =>
          gradeSubject.subject_id === subject.id
        )
      )
    }
  },
  methods: {
    setCurrentGrade (gradeId) {
      this.current_grade_id = gradeId
    },

    currentGradeHasSubject (subjectId) {
      return !!this.currentGradeSubjects.find(gradeSubject =>
        gradeSubject.subject_id === subjectId
      )
    },

    gradeSave (event) {
      this.$emit('loading')

      const form = event.target

      const gradeSubjectInputs = form.querySelectorAll('[name="grade_subject[]"]:checked')
      const gradeSubjectIds = [].map.call(gradeSubjectInputs, input => input.value)

      const grade = {
        name: form.querySelector('[name=name]').value,
        level: form.querySelector('[name=level]').value,
        active: true
      }
      return this.$store.dispatch('grades/create', grade).then(grade => {
        const promises = []

        gradeSubjectIds.forEach(subjectId => {
          const gradeSubject = {
            subject_id: subjectId,
            grade_id: grade.id
          }
          const promise = this.$store.dispatch('grade_subjects/create', gradeSubject)

          promises.push(promise)
        })

        return Promise.all(promises)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', 'Turma criada com sucesso!', 'success')
        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=level]').value = ''
        gradeSubjectInputs.forEach(input => {
          input.checked = false
        })
        this.$refs.modalNew.close()
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível criar a turma.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    gradeUpdate (event) {
      this.$emit('loading')

      const form = event.target
      const grade = {
        id: this.current_grade_id,
        name: form.querySelector('[name=name]').value,
        level: form.querySelector('[name=level]').value,
        active: form.querySelector('[name=active]').checked
      }
      return this.$store.dispatch('grades/update', grade).then(() => {
        this.$emit('notify', 'Sucesso!', 'Turma editada com sucesso!', 'success')
        this.$refs.modalEdit.close()
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível editar a turma.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    gradeSubjectSave (event) {
      this.$emit('loading')

      const form = event.target

      const gradeSubject = {
        grade_id: this.current_grade_id,
        subject_id: form.querySelector('[name=subject_id]').value
      }
      this.$store.dispatch('grade_subjects/create', gradeSubject).then(() => {
        this.$emit('notify', 'Sucesso!', 'Disciplina cadastrada com sucesso!', 'success')
        form.querySelector('[name=subject_id]').value = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível cadastrar a disciplina.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    load () {
      const required = [
        'grades',
        'grade_subjects',
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
    this.current_grade_id = undefined

    this.load().then(() => {
      this.$emit('loaded')
    })
  }
}
</script>
