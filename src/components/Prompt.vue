<template>
  <div>
    <div :class="'modal modal-xs modal-'+type" :id="anchor">
      <div class="modal-header">{{ title }}</div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <a class="btn-primary btn-sm" href="#">
          <div class="material-icons">close</div>
          Cancelar
        </a>
        <a v-if="accept" class="btn-success btn-sm pull-right" @click="$emit('accept')" href="#">
          <div class="material-icons">check</div>
          {{ accept }}
        </a>
      </div>
    </div>
    <a class="modal-close" :href="'#'+$route.path"></a>
  </div>
</template>

<script>
export default {
  name: 'Prompt',
  props: ['title', 'anchor', 'type', 'accept'],
  methods: {
    open () {
      document.location.hash = this.anchor
    },
    close () {
      document.location.hash = this.$route.path
    }
  }
}
</script>
