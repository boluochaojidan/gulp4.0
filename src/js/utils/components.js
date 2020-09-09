
// 标识 toast 第几个元素
let toastTag = 0

/**
 * message: 显示消息
 * duration: 从显示到隐藏总时间，默认 2000，当为 0 时，表示永不隐藏
 * transition: 显示隐藏的动画时间，默认 300
 * top: 定义高度位置（如：50%或50px或50rem）
 * position: 固定位置（top、middle、bottom），若上面的 top 参数有值，该参数将失效
 * className: 给 toast 定义类名（如："class1 class2"）
 * callback: 隐藏动画完毕后立刻调用该回调方法
 * 
 * 示例
 * Toast({
 *  message: '顶部显示消息',
 *  position: 'top',
 *  duration: 3000
 * })
 * @param {*} param 
 */
let Toast = function (param, callback) {
  param.message = param.message.trim()
  if (!param.message) {
    return
  }
  if (!param.className) {
    param.className = ''
  }
  if (!param.duration && param.duration != 0) {
    param.duration = 2000
  }
  if (!param.transition) {
    param.transition = 300
  }
  param.cssTransition = param.transition / 1000
  if (!param.top) {
    if (param.position == 'top') {
      param.top = '20%'
    } else if (param.position == 'middle') {
      param.top = '50%'
    } else if (param.position == 'bottom') {
      param.top = '80%'
    } else {
      param.top = '80%'
    }
  }

  let toastHtml = `<div class="tClass${toastTag} ${param.className}"><span>` + param.message + `</span></div>`;
  let a = document.body.insertAdjacentHTML('beforeend', toastHtml);
  let tClass = document.querySelector(`.tClass${toastTag}`)
  tClass.style.cssText = `
    display: block;
    position: fixed;
    padding: 10px;
    top: ${param.top};
    left: 50%;
    transform: translateX(-50%);
    border-radius: 5px;
    background: rgba(0,0,0,.7);
    color: #fff;
    font-size: 14px;
    box-sizing: border-box;
    text-align: center;
    transition: opacity ${param.cssTransition}s linear;
    opacity: 0;
    z-index: 9999;
    `

  setTimeout(function () {
    tClass.style.opacity = 1
    if (param.duration == 0) {
      return
    }
    // 隐藏，触发事件 = 传入的时间参数 - transition 的过渡时间 x2
    setTimeout(function () {
      tClass.style.opacity = 0
      // 去除节点（需要等待过渡动画完毕后执行）
      setTimeout(function () {
        document.body.removeChild(tClass)
        if (callback) {
          callback()
        }
      }, param.transition + 1)
    }, param.duration - param.transition * 2)
  }, 1);

  toastTag++;
}

/**
 * param 参数：
 * actions：菜单项数（name: 显示名称；value: 值；method：回调方法）
 * cancelText: 取消按钮的文案，默认“取消”
 * closeOnClickModal: 是否点击 modal 隐藏 actionsheet，默认 true
 * @param {*} param 
 */
let Actionsheet = function (tag, param) {
  if (document.querySelector(`.com-actionsheet.${tag}`) != null) {
    document.querySelector(`.com-actionsheet.${tag}`).style.transform = 'translateY(0%)'
    document.querySelector('.com-actionsheet-modal').style.width = '100%'
    document.querySelector('.com-actionsheet-modal').style.height = '100%'
    return
  }
  if (!param.actions || param.actions.length == 0) {
    return
  }
  if (!param.cancelText) {
    param.cancelText = '取消'
  }
  if (param.closeOnClickModal == undefined) {
    param.closeOnClickModal = true
  }

  let str = `
  <div class="com-actionsheet ${tag}">
    <ul class="com-actionsheet-list">
    </ul>
    <div class="com-actionsheet-cancel">${param.cancelText}</div>
  </div>
  `
  document.body.insertAdjacentHTML('beforeend', str);

  let tag_actionsheet = document.querySelector(`.com-actionsheet.${tag}`)
  let list = tag_actionsheet.querySelector('.com-actionsheet-list')
  let cancel = tag_actionsheet.querySelector('.com-actionsheet-cancel')
  let items = tag_actionsheet.getElementsByClassName('com-actionsheet-item')

  str = ''
  param.actions.map(item => {
    str += `<li class="com-actionsheet-item" data-value=${item.value}>${item.name}</li>`
  })

  list.innerHTML = str

  tag_actionsheet.style.cssText = `
  position: fixed;
      width: 100%;
      text-align: center;
      font-size: 18px;
      left: 0;
      bottom: 0;
      z-index: 9999;
      transition: transform .3s ease-out;
      transform: translateY(100%);
  `

  list.style.cssText = `
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: 5px;
  `

  cancel.style.cssText = `
  width: 100%;
  height: 45px;
  line-height: 45px;
  background: #fff;;
  `

  for (let i = 0; i < items.length; i++) {
    items[i].style.cssText = `
  height: 45px;
  line-height: 45px;
  border-bottom: .01rem solid #e0e0e0;
  background-color: #fff;
  `
    // 点击 item，进行回调方法
    items[i].onclick = function () {
      param.actions[i].method(param.actions[i].value)

      // 隐藏
      tag_actionsheet.style.transform = 'translateY(100%)'
      setTimeout(() => {
        document.querySelector('.com-actionsheet-modal').style.width = 0
        document.querySelector('.com-actionsheet-modal').style.height = 0
      }, 300)
    }
  }

  items[items.length - 1].style.border = 'none'

  // 显示
  setTimeout(() => {
    tag_actionsheet.style.transform = 'translateY(0%)'
  }, 1)

  let modal = document.querySelector('.com-actionsheet-modal')
  // 判断如果存在 modal，则不需要再次添加
  if (!modal) {
    let actionsheet = document.querySelector(`.com-actionsheet`)
    document.body.insertAdjacentHTML('beforeend', `<div class="com-actionsheet-modal"></div>`)
    modal = document.querySelector('.com-actionsheet-modal')
    modal.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      opacity: 0.5;
      background: #000;
      z-index: 9998;
      `
    if (param.closeOnClickModal) {
      modal.onclick = function () {
        actionsheet.style.transform = 'translateY(100%)'
        setTimeout(() => {
          modal.style.width = 0
          modal.style.height = 0
        }, 300)
      }
    }
  }
  modal.style.width = '100%'
  modal.style.height = '100%'

}

export {
  Toast,
  Actionsheet
}