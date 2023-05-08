<template>
  <transition name="msg">
    <div :class="styleClass" v-if="isVisable" :style="{
      top:top+'px',
      
    }">
      {{ message }}
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { defineProps, computed, ref, defineExpose } from 'vue'
import types from '../message/type'

const props = defineProps({
  type: {
    type: String,
    default: types.MESSAGE,
    Validator(value: string) {
      return Object.values(types).includes(value)
    }
  },
  message: {
    type: String,
    default: types.MESSAGE
  }
})

//绑定样式class
const styleClass = computed(() => ['msg', props.type])

//isVisable用于实现动画效果的变量
let isVisable = ref(false)
let top = ref<number>(0)
function changeVisable(Visable: boolean) {
  return new Promise<void>((resolve) => {
    isVisable.value = Visable
    console.log(isVisable.value);
    
    //等待动画加载完之后
    setTimeout(() => {
      resolve('')
    },300);
  })
}


function setTop(topValue:number) {
  top.value=topValue
  return topValue
}

//将修改变量isVisable的方法暴露出去，实现外面点击才出现动画
defineExpose({
  changeVisable,
  height:40,
  margin:10,
  top,
  setTop
})
</script>

<style lang="less" scoped>
.msg {
  width: 300px;
  height: 40px;
  display: flex;
  position:fixed;
  left:50%;
  z-index: 999;
  margin-left: -150px;
  
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  transition: top 1s ease-out;
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

.msg-leave-to{
  opacity: 0;
}
.msg-leave-from{
  transform: translateY(20px);
}

.msg-enter-to,
.msg-enter-from{
  transform: translateY(20px);
}

.msg-leave-active {
  transition: all .3s ease-out;
}
</style>
