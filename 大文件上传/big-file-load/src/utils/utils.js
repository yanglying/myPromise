export default{
    fileParse:(file,type)=>{
        return new Promise((resolve) => {
            let fileRead=new FileReader()
            //将file文件转换为base64格式的文件
            if(type==='base64'){
              fileRead.readAsDataURL(file)
            }else if(type==='buffer'){
              fileRead.readAsBinaryString(file)
            }
             //解析完毕后会执行拿到解析后的文件并传给promise
             fileRead.onload=(e)=>{
                resolve(e.target.result)
            }  
        })
      }
}