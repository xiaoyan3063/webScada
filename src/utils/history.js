export default class History {
    constructor() {
        this.stack = []
        this.position = -1
    }

    push(state) {
        // 如果当前位置不在栈的末尾，截断后面的历史
        if (this.position < this.stack.length - 1) {
            this.stack = this.stack.slice(0, this.position + 1)
        }

        // 添加新状态
        this.stack.push(JSON.parse(JSON.stringify(state)))
        this.position++

            // 限制历史记录数量
            if (this.stack.length > 50) {
                this.stack.shift()
                this.position--
            }
    }

    undo() {
        if (this.position > 0) {
            this.position--
                return this.stack[this.position]
        }
        return null
    }

    redo() {
        if (this.position < this.stack.length - 1) {
            this.position++
                return this.stack[this.position]
        }
        return null
    }

    canUndo() {
        return this.position > 0
    }

    canRedo() {
        return this.position < this.stack.length - 1
    }
}