<template>
  <div>
    <div class="modal" :id="anchor">
      <div class="modal-header">{{ title }}</div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
    <a class="modal-close" :href="'#'+$route.path" @click.prevent="close"></a>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: ['title', 'anchor'],
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
