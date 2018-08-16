<template>
  <div>
    <div class="modal" :id="anchor">
      <div class="modal-header">{{ title }}</div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
    <a class="modal-close" :href="'#'+$route.path"></a>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: ['title', 'anchor'],
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
