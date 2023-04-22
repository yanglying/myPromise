//三种状态
const RESOLVE = "resolved";
const REJECT = "rejected";
const PENDING = "pending";

//实现链式调用
const handlePromise = (res, newPromise, resolve, reject) => {
  //不能循环调用，会进入死循环,此时需要抛出错误
  if (res === newPromise) {
    throw new Error("can not return oneself");
  }
  if(res instanceof myPromise){
    try {
         //加个锁，实现当运行成功之后的回调后，不会再执行失败的了
         let lock = false;
         //当前res.then返回的是promise对象再去递归调用
         res.then.call(
           res,
           (result) => {
             if (lock) return;
             //递归去调用,就是因为如果then的 res 又是一个promise怎么办，
             //递归的话就又判断如果是promise的话就继续then下去
             //直到then后面的res不是promise为止
             handlePromise(result, newPromise, resolve, reject);
             lock = true;
           },
           (err) => {
             if (lock) return;
             reject(err);
             lock = true;
           }
         );
    } catch (error) {
        reject(error)
    }
  }else{
    //若res不是一个promise对象，则then 中返回一个成功状态的promise，并且值为res
    resolve(res)
  }
  if(res===undefined){
    //没有返回任何值，那么 then 返回的 Promise 将会成为接受状态，并且该接受状态的回调函数的参数值为 undefined
    resolve(undefined)
  }
};
class myPromise {
  //初始化
  //当result/reason没有进行赋值时，默认是undefined
  result = undefined;
  reason = undefined;
  status = PENDING;
  //数组用来存放异步成功之后待执行的回调函数的任务队列
  onResolvedArr = [];
  onRejectedArr = [];
  //传入执行函数excution,excution方法又接收两个参数方法
  constructor(excution) {
    const resolve = (result) => {
      if (this.status === PENDING) {
        this.status = RESOLVE;
        this.result = result;
        //订阅完成后，执行所有回调,即只有在状态改变之后才会去执行回调
        this.onResolvedArr.forEach((fn) => {
          fn();
        });
      }
    };
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECT;
        this.reason = reason;
        this.onRejectedArr.forEach((fn) => {
          fn();
        });
      }
    };
    //因为有可能输入的代码有误，所以要try/catch
    try {
      excution(resolve, reject);
    } catch (error) {
       reject(error);
    }
  }

  then(onResolved, onRejected) {
    //判断传入的onResolved、onRejected的类型，如果不是个方法的话，就自己写一个
    //在promise源码中，如果传入的不是一个函数，就会跳过当前的then,这里默认传入的是函数形式
    onResolved = typeof onResolved === "function" ? onResolved : (data) => data;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (error) => {
            throw new Error(error);
          };
    const newPromise = new myPromise((resolve, reject) => {
      if (this.status === RESOLVE) {
        try {
          //使用setTimeout只是模拟then中回调是在异步的，原生Promise并非是这样实现的。
          setTimeout(() => {
            //拿到then中函数返回的结果值res，进行判断,若返回值还是一个promise，则可以链式调用
            const res = onResolved(this.result);
            handlePromise(res, newPromise, resolve, reject);
          }, 0);
        } catch (error) {
          reject(error);
        }
      }
      if (this.status === REJECT) {
        try {
          setTimeout(() => {
            const res = onRejected(this.reason);
            handlePromise(res, newPromise, resolve, reject);
          }, 0);
        } catch (error) {
          reject(error);
        }
      }

      //采用发布者订阅模式,若状态没有改变，则保存回调函数到对应数组中，之后等待状态变化之后再执行
      if (this.status === PENDING) {
        //先订阅
        this.onResolvedArr.push(() => {
          try {
            const res = onResolved(this.result);
            handlePromise(res, newPromise, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
        this.onRejectedArr.push(() => {
          try {
            const res = onRejected(this.reason);
            handlePromise(res, newPromise, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
    });
    //then的返回值是个promise对象
    return newPromise;
  }
  //catch的返回值是个promise对象
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  //finally方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果
  finally(onFinally) {
    //传入的onFinally回调函数 没有传入的参数，无论成功还是失败finally都会去执行
    return this.then(onFinally, onFinally);
  }
  static resolve = (value) => {
    if (value instanceof myPromise) {
      //如果传入的参数为Promise对象，则返回的结果由该传入的Promise对象的值决定
      return value
    } 
    return new myPromise((resolve, reject) => {
       if(value&&typeof value ==='object'&&typeof value.then==='function')
        {
          setTimeout(()=>{
            value.then(resolve,reject)
          })
        }else{
          resolve(value)
        }
      });
  };
  static reject = (reason) => {
    return new myPromise((resolve, reject) => {
      reject(reason);
    });
  };
  //all方法类似于Array的every方法，any类似于Array的some方法
  static all = (promises) => {
    let resultArr = [];
    // 用来保存成功的 promise 的数量
    let resolvedCount = 0;
    return new myPromise((resolve, reject) => {
      promises.forEach((p, index) => {
        myPromise.resolve(p).then(
          (value) => {
            resolvedCount++;
            // resultArr.push(value) // 不行,成功的 promise 的顺序也必须是一一对应的
            resultArr[index] = value;
            if (resolvedCount === promises.length) resolve(resultArr);
          },
          (err) => {
            // 只要一个失败了，return 的 promise 就会失败
            reject(err);
          }
        );
      });
    });
  };
  //只要参数实例有一个成功，则直接返回resolve
  //如果所有参数实例都变成rejected状态，
  //返回的promise对象就会变成rejected状态,并且拿到的是全部失败的结果数组
  static any = (promises) => {
    let resultArr = [];
    // 用来保存失败的 promise 的数量
    let rejectCount = 0;
    return new myPromise((resolve, reject) => {
      promises.forEach((p, index) => {
        myPromise.resolve(p).then(
          (value) => {
            resolve(value);
          },
          (err) => {
            rejectCount++;
            resultArr[index] = err;
            if (rejectCount === promises.length) {
              reject(resultArr);
            }
          }
        );
      });
    });
  };
  static race = (promises) => {
    return new Promise((resolve, reject) => {
      // 遍历 promises 获取每个 promise 的结果
      promises.forEach((p, index) => {
        Promise.resolve(p).then(
          // 一旦有成功或者失败的，任意一个执行完毕，就直接返回
          (value) => {
            resolve(value);
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  };
  //该方法返回的新的 Promise 实例，一旦结束，状态总是fulfilled，不会变成rejected
  //无论失败还是成功的值都会保存
  static allSettled = (promises) => {
    let Arr = [];
    // 用来保存失败的 promise 的数量
    let total = 0;
    return new myPromise((resolve, reject) => {
      promises.forEach((p, index) => {
        myPromise.resolve(p).then(
          (res) => {
            total++;
            Arr[index] = res;
            if (total === promises.length) {
              resolve(Arr);
            }
          },
          (err) => {
            Arr[index] = err;
            total++;
            if (total === promises.length) {
              resolve(Arr);
            }
          }
        );
      });
    });
  };
}
module.exports = myPromise;
