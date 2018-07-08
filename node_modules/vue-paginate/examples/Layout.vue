<template>
  <div class="layout">
    <foo></foo>
    <slot name="foo"></slot>
    <slot/>
  </div>
</template>

<script>
import Foo from './Foo'
export default {
  name: 'layout',
  components: { Foo }
}
</script>
