const myPromise=require('./myPromise')
const p = myPromise.resolve('xxxx');
const p1 = myPromise.reject('出错啦p1');
const p2 = myPromise.reject('出错啦p2');
// p1.then(res=>{
//     console.log(res)
// }).finally(()=>{
//     console.log('finally');
// })

const p3 = myPromise.resolve('11111111');
const any = myPromise.all([p1,p2]);
const allSettled = myPromise.allSettled([p2,p3,'333']);
allSettled.then(res=>{
    console.log(res)
    console.log(allSettled);
    
},(err)=>{
    console.log(err);
}).finally(()=>{
    console.log('finally');
})

// let pT=new myPromise((resolve,reject)=>{
//    setTimeout(()=>{
//        resolve('123--timeout')
//    },0)
// })
// pT.then(res=>{
//     console.log(333);
//     return new myPromise((resolve, reject) => {
//         resolve('出错啦')
//     })
// }).then(err=>{
//     console.log(222);
// })
// console.log('111');