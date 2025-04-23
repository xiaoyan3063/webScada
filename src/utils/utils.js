export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// 计算两点之间的距离
export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// 检查点是否在矩形内
export function isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight
}