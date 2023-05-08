import types from './type'
import { createApp, ref ,watch} from 'vue'
import type { App } from 'vue'
import MessageComponent from '../components/Message.vue'

interface IMessage {
  [index: string]: (obj: any) => void
}

const Message = (obj: any) => {
  //第二个参数可选，它是要传递给根组件的 props
  const messageApp = createApp(MessageComponent, obj)
  showMessage(messageApp)
}

Object.values(types).forEach((item: string) => {
  Message[item] = (obj: { message: string }): void => {
    return Message({ type: item, ...obj })
  }
})

function showMessage(app: App) {
  //创建一个容器用来显示组件,并挂载到app上
  const el = document.createDocumentFragment()
  const vm = app.mount(el)
  messageArr.value.push(vm)
  
  document.body.appendChild(el)
  setTop(vm)
   //获取到vm,实例，从而拿到组件中暴露出来的方法并调用，启动动画
  vm.changeVisable(true)
  watch(messageArr,()=>{
    setTop(vm)
  })
  //启动完毕之后，则需要将该div从页面中去除
  hideMessage(app,vm)
}



function hideMessage(app: App,vm : App) {
  //延时卸载，不然动画消除效果就看不见了
  //结束动画，就将其调用为false
   setTimeout(async () => {
    await vm.changeVisable(false)
    //过度动画做完了再unmount
    app.unmount()
    //messageArr中去除已经消失的组件
    messageArr.value=messageArr.value.filter((item)=>item!==vm)
  },1000);
}



const messageArr=ref([])

function setTop(vm) {
  const {setTop,height,margin}=vm
  //获取每个组件出现的下标,来设置高度
  const index=messageArr.value.findIndex((item)=> item===vm)
  setTop(margin*(index+1)+height*index)
  
}
export default Message
