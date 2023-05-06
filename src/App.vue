<template>
  <button
    @click="
      Message({
        type: 'success',
        message: 'yly'
      })
    "
  >
    点我1
  </button>
  <button
    @click="
      Message.success({
        message: 'xxxxxxxxxx'
      })
    "
  >
    点我2
  </button>
</template>

<script setup lang="ts">
import Message from './message/index'
</script>

<style scoped></style>
