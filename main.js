const myPromise=require('./myPromise')
let p=myPromise.resolve('111')
// console.log(p);
let p2=myPromise.resolve(p)
console.log(p2);
let p3=p2.then(res=>{
    console.log(res);
}).then(res=>{
    console.log(res);
}).then(res=>{
    console.log(res);
})