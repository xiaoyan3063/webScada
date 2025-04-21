export function createConnectionPath(startItem, endItem) {
    // 简化版连接线计算，实际项目中需要更复杂的路径计算
    const startX = startItem.x + startItem.width
    const startY = startItem.y + startItem.height / 2
    const endX = endItem.x
    const endY = endItem.y + endItem.height / 2

    const midX = (startX + endX) / 2

    return `M ${startX} ${startY} 
            C ${midX} ${startY}, 
              ${midX} ${endY}, 
              ${endX} ${endY}`
}

export function findClosestConnectionPoint(item, pos) {
    // 在实际项目中，这里应该计算item的连接点中最接近pos的点
    const points = []

    if (item.hasConnectionPoints) {
        // 添加连接点坐标
        points.push({ x: item.x, y: item.y + item.height / 2 }) // 左侧中点
        points.push({ x: item.x + item.width, y: item.y + item.height / 2 }) // 右侧中点
            // 可以根据需要添加更多连接点
    }

    if (points.length === 0) return null

    // 找到最近的点
    let closest = 0
    let minDist = Infinity

    points.forEach((point, index) => {
        const dx = point.x - pos.x
        const dy = point.y - pos.y
        const dist = dx * dx + dy * dy

        if (dist < minDist) {
            minDist = dist
            closest = index
        }
    })

    return closest
}