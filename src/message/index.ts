import types from './type'
import { createApp, ref } from 'vue'
import type { App } from 'vue'
import MessageComponent from '../components/Message.vue'

const msg = ref(null)
console.log(msg)

interface IMessage {
  [index: string]: (obj: any) => void
}

const Message = (obj: any) => {
  //obj中存放 第二个参数可选，它是要传递给根组件的 props
  const messageApp = createApp(MessageComponent, obj)
  showMessage(messageApp)
}

Object.values(types).forEach((item: string) => {
  Message[item] = (obj: { message: string }): void => {
    return Message({ type: item, ...obj })
  }
})

function showMessage(app: App) {
  const el: HTMLDivElement = document.createElement('div')
  app.mount(el)
  document.body.appendChild(el)
  //   msg.value.changeVisable()
  //   hideMessage(app)
}

function hideMessage(app: App) {
  setTimeout(() => {
    app.unmount()
  }, 2000)
}
export default Message
