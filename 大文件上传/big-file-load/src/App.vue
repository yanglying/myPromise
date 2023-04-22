<template>
  <div id="app">
    <el-upload
      class="upload-demo"
      drag
      :on-change="changeFile"
      action="https://jsonplaceholder.typicode.com/posts/"
      multiple>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    <button @click="handleBtn">暂停</button>
  </div>
</template>

<script>

import axios from 'axios'
import utils from './utils/utils'
import SparkMd5 from 'spark-md5'
export default {
  name: 'App',
  data(){
    return{
      chunksList:[],
      hash:'',
      total:0,
      btn:false,
      abort:false
    }
  },
  methods:{
    changeFile(file){
       if(!file) return
       file=file.row
       utils.fileParse(file,'buffer').then(buffer=>{
        console.log(buffer);
        //设置每一个切片都有自己的部分数据和自己的名字
        //hash-1、hash-2
         //创建一个SparkMd5实例
        let spark=SparkMd5.ArrayBuffer(),hash,suffix;
        //根据文件内容生成hash值
        spark.append(buffer)
        //通过end拿到hash值
        hash=spark.end()
        //拿到文件后缀
        suffix=/\.([0-9a-zA-Z]+)$/i.exec(file.name)[1]
        
        //生成切片信息,创建了100个切片
        let chunkSize=file.size/100
        let cur=0
        for(let i=0;i<100;i++){
          //以下内容根据后台具体格式决定
          let item={
            //chunk传给服务器的切片内容
            chunk:file.slice(cur,cur+chunkSize),
            filename:`${hash}_${i}.${suffix}`
          }
          cur+=chunkSize
          this.chunksList.push(item)
        }
        this.hash=hash
        //切片创建完毕之后，将每个切片传给服务器,发请求
       })
    },
    sendReauest(){
       //根据100个切片创造100个请求
      let requestList=[]
      this.chunksList.forEach((item,index)=>{
        let fn=()=>{
        let formData=new FormData()
        formData.append('chunk',item.chunk)
        formData.append('filename',item.filename)
        return axios.post('xxxx',formData,{
          headers:{
            "Content-Type":'multipart/form-data'
          }
        }).then(res=>{
          if(res.code===200){
            //total记录上传成功的切片数量
            this.total++
            //并将其在切片数组中移除
            this.chunksList.splice(index,1)
          }
        })
       }
       requestList.push(fn)
      })

      //传递方式：并行/串行
      //若并行方式想要终止请求，只能使用abort
      //这里采用串行发送
      //若已经成功上传的切片，服务器会做记录，再次传的时候会实现秒传的效果
      let i=0
      let send=async ()=>{
        //已经中断则不再请求
        if(this.abort) return 
        if(i>=requestList.length){
          this.$message('所有切片发送完毕')
          //切片发送完毕，则通知服务器去合并分片，在服务器生成整合为一个总的文件
          let res=await axios.get('merge',{
            //根据该文件的hash 在服务器保存的来进行合并，同一个文件的hash是一致的
            params:{
              hash:this.hash
            }
          })
          if(res.code===200){
            //xxxx
            //合并成功之后去执行一系列操作
          }
          return 
        }
        //上传单个切片
        await requestList[i]()
        //上传成功之后i++,表示传下一个
        i++
        send()
      }

      //第一次发送
      send()
    },
    handleBtn(){
      if(this.btn){
        //断点续传
        this.btn=false
        this.abort=false
        this.sendReauest()
        return
      }
      //暂停上传
      this.btn=true
      this.abort=true
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
