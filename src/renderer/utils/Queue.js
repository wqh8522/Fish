export default class Queue {
    constructor() {
        // 队列长度, 类数组 length
        this.count = 0
        // 队列中所有项
        this.items = {}
        // 记录对列头, 类数组 index
        this.lowestCount = 0
    }

    enqueue(ele) {
        this.items[this.count++] = ele
    }

    dequeue() {
        if (this.isEmpty()) {
            return undefined
        }
        const ele = this.items[this.lowestCount]
        delete this.items[this.lowestCount]
        this.lowestCount++
        return ele
    }

    peek() {
        if (this.isEnpty()) {
            return
        }
        return this.items[this.lowestCount]
    }

    size() {
        /**
         * 当队列为非空时:
         * 1. count 是长度
         * 2. lowestCount 是下标
         * 两者关系应该 lowestCount = count - 1
         */
        return this.count - this.lowestCount
    }

    isEmpty() {
        return this.size() == 0
    }

    clear() {
        this.items = {}
        this.lowestCount = 0
        this.count = 0
    }

    toString() {
        if (this.isEmpty()) {
            return ''
        }
        let objString = `${this.items[this.lowestCount]}`
        for (let i = this.lowestCount + 1; i < this.count; i++) {
            objString = `${objString}, ${this.items[i]}`
        }
        return objString
    }
}
