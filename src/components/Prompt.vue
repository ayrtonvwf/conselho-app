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
    <a class="modal-close" :href="'#'+$route.path" @click.prevent="close"></a>
  </div>
</template>

<script>
export default {
  name: 'Prompt',
  props: ['title', 'anchor', 'type', 'accept'],
  methods: {
    open () {
      document.location.hash = this.anchor
      this.$emit('open')
    },

    close () {
      document.location.hash = this.$route.path
      this.$emit('close')
    },

    keyDown (event) {
      if (event.keyCode !== 27) {
        return
      }

      this.close()
    }
  },

  created () {
    window.addEventListener('keydown', this.keyDown)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.keyDown)
  }
}
</script>
