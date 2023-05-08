<template>
  <button
    @click="
      Message({
        type: 'erro',
        message: 'yly'
      })
    "
  >
    erro
  </button>
  <button
    @click="
      Message.message({
        message: 'xxxxxxxxxx'
      })
    "
  >
    message
  </button>
</template>

<script setup lang="ts">
import Message from './message/index'
</script>

<style scoped></style>
