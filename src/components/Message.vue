<template>
  <transition name="jspp-message">
    <div :class="styleClass">
       <span> {{ message }}</span>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { defineProps ,computed} from "vue";
import types from "../message/type";
const props = defineProps({
  type: {
    type: String,
    default: types.MESSAGE,
    Validator(value: string) {
      return Object.values(types).includes(value);
    },
  },
  message: {
    type: String,
    default: types.MESSAGE,
  },
});
const styleClass=computed(()=>['jspp-message',props.type])
</script>

<style lang="less" scoped>
.jspp-message {
   width:340px;
   height: 40px;
   display: flex;
   border-radius: 10px;
  justify-content: center;
  align-items: center;
  //并列选择器，根据传入的type类型来决定采用哪种样式
  &.erro {
    background-color: rgb(246, 215, 215);
    color: rgb(228, 20, 20);
  }
  &.success {
    background-color: rgb(208, 230, 208);
    color: rgb(51, 220, 25);
  }
  &.warning {
    background-color: rgb(221, 209, 153);
    color: rgb(121, 112, 16);
  }
  &.message {
    background-color: rgb(184, 187, 184);
    color: rgb(15, 15, 15);
  }
}
</style>
