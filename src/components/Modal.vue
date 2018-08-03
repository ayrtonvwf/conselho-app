<template>
  <div>
    <div class="modal" :id="anchor">
      <div class="modal-header">{{ title }}</div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
    <a class="modal-close" href="#"></a>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: ['title', 'anchor']
}
</script>
