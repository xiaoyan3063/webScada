/**
 * 绘图工具函数
 */

// 创建基本图形
export function createShape(type, x, y, defaultProps = {}) {
    const baseProps = {
        id: Date.now().toString(),
        type,
        x,
        y,
        width: 100,
        height: 60,
        rotation: 0,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
        zIndex: 0,
        visible: true
    };

    const shapeSpecificProps = {};

    switch (type) {
        case 'rectangle':
            break;

        case 'circle':
            shapeSpecificProps.width = 80;
            shapeSpecificProps.height = 80;
            break;

        case 'triangle':
            break;

        case 'line':
            shapeSpecificProps.width = 120;
            shapeSpecificProps.height = 2;
            break;

        case 'text':
            shapeSpecificProps.text = '文本';
            shapeSpecificProps.fontSize = 14;
            shapeSpecificProps.fontColor = '#000000';
            shapeSpecificProps.fill = 'transparent';
            shapeSpecificProps.stroke = 'transparent';
            break;

        case 'valve':
            shapeSpecificProps.width = 60;
            shapeSpecificProps.height = 60;
            break;

        case 'pump':
            shapeSpecificProps.width = 80;
            shapeSpecificProps.height = 60;
            break;

        case 'tank':
            shapeSpecificProps.width = 100;
            shapeSpecificProps.height = 150;
            break;

        default:
            break;
    }

    return {...baseProps, ...shapeSpecificProps, ...defaultProps };
}

// 检测点是否在图形内
export function isPointInItem(pos, item) {
    if (!item.visible) return false;

    // 简化的边界框检测
    const left = item.x;
    const right = item.x + item.width;
    const top = item.y;
    const bottom = item.y + item.height;

    return pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom;
}

// 检测点是否在连接点上
export function isPointInConnectionPoint(pos, item, pointIndex) {
    if (!item.hasConnectionPoints) return false;

    const points = getConnectionPoints(item);
    if (pointIndex >= 0 && pointIndex < points.length) {
        const point = points[pointIndex];
        const dx = pos.x - point.x;
        const dy = pos.y - point.y;
        return dx * dx + dy * dy <= 25; // 5px半径范围内
    }

    return false;
}

// 获取图形的连接点
export function getConnectionPoints(item) {
    const points = [];

    if (item.hasConnectionPoints) {
        // 默认连接点在四边中点
        points.push({ x: item.x, y: item.y + item.height / 2 }); // 左
        points.push({ x: item.x + item.width, y: item.y + item.height / 2 }); // 右
        points.push({ x: item.x + item.width / 2, y: item.y }); // 上
        points.push({ x: item.x + item.width / 2, y: item.y + item.height }); // 下
    }

    return points;
}

// 绘制SVG路径
export function drawPath(points, closed = false) {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
    }

    if (closed) {
        path += ' Z';
    }

    return path;
}

// 绘制曲线路径
export function drawCurvePath(points) {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        // 使用二次贝塞尔曲线平滑连接
        const cpx = (prev.x + curr.x) / 2;
        const cpy = (prev.y + curr.y) / 2;

        path += ` Q ${cpx} ${cpy}, ${curr.x} ${curr.y}`;
    }

    return path;
}

// 绘制工业阀门图形
export function drawValve(item) {
    const centerX = item.width / 2;
    const centerY = item.height / 2;
    const radius = Math.min(item.width, item.height) * 0.4;

    return `
      <rect 
        x="0" y="0" 
        width="${item.width}" height="${item.height}" 
        fill="${item.fill}" stroke="${item.stroke}" 
        stroke-width="${item.strokeWidth}"
      />
      <circle 
        cx="${centerX}" cy="${centerY}" 
        r="${radius}" 
        fill="#fff" stroke="#333" 
        stroke-width="2"
      />
      <line 
        x1="${centerX}" y1="0" 
        x2="${centerX}" y2="${item.height}" 
        stroke="#333" 
        stroke-width="2"
      />
      <line 
        x1="0" y1="${centerY}" 
        x2="${item.width}" y2="${centerY}" 
        stroke="#333" 
        stroke-width="2"
      />
    `;
}

// 绘制工业泵图形
export function drawPump(item) {
    const centerX = item.width / 2;
    const centerY = item.height / 2;
    const radius = Math.min(item.width, item.height) * 0.3;

    return `
      <rect 
        x="0" y="0" 
        width="${item.width}" height="${item.height}" 
        fill="${item.fill}" stroke="${item.stroke}" 
        stroke-width="${item.strokeWidth}"
      />
      <circle 
        cx="${centerX}" cy="${centerY}" 
        r="${radius}" 
        fill="#fff" stroke="#333" 
        stroke-width="2"
      />
      <path 
        d="M ${centerX - radius} ${centerY}
           A ${radius} ${radius} 0 1 0 ${centerX + radius} ${centerY}
           A ${radius} ${radius} 0 1 0 ${centerX - radius} ${centerY}"
        fill="none" stroke="#333" 
        stroke-width="2"
      />
    `;
}