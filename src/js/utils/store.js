import constant from './constant'
import watcher from './watch'

let storeData = new watcher({
  data: {
    test: null,
  },
  watch: {
    test(newVal, oldVal) {
    }
  }
})

export { storeData }