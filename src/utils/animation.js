/**
 * 动画工具函数
 */

// 颜色插值函数
export function interpolateColor(color1, color2, factor) {
    if (factor <= 0) return color1;
    if (factor >= 1) return color2;

    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// 处理数值动画
export function interpolateNumber(from, to, factor) {
    return from + (to - from) * factor;
}

// 处理位置动画
export function interpolatePosition(from, to, factor) {
    return {
        x: interpolateNumber(from.x, to.x, factor),
        y: interpolateNumber(from.y, to.y, factor)
    };
}

// 检查条件是否满足
export function checkCondition(value, condition, conditionValue) {
    switch (condition) {
        case 'eq':
            return value === conditionValue;
        case 'gt':
            return value > conditionValue;
        case 'lt':
            return value < conditionValue;
        case 'gte':
            return value >= conditionValue;
        case 'lte':
            return value <= conditionValue;
        default:
            return false;
    }
}

// 执行动画更新
export function executeAnimation(animation, value, updateItemCallback) {
    const { type, itemId, trigger, dataRange, condition, conditionValue } = animation;

    if (trigger === 'data') {
        if (type === 'visibility') {
            let visible = true;
            if (condition) {
                visible = checkCondition(value, condition, conditionValue);
            } else {
                // 默认行为：值不为0时显示
                visible = value !== 0;
            }

            updateItemCallback(itemId, {
                visible: animation.value === 'toggle' ? !this.visible : visible
            });
        } else if (type === 'text') {
            updateItemCallback(itemId, {
                text: value.toString()
            });
        } else {
            // 计算动画进度
            let progress = 0;
            if (dataRange) {
                const range = dataRange.max - dataRange.min;
                progress = range !== 0 ? (value - dataRange.min) / range : 0;
                progress = Math.min(1, Math.max(0, progress));
            }

            // 根据类型应用动画
            switch (type) {
                case 'fill':
                case 'stroke':
                    const color = interpolateColor(
                        animation.value.from,
                        animation.value.to,
                        progress
                    );
                    updateItemCallback(itemId, {
                        [type]: color
                    });
                    break;

                case 'position':
                    const pos = interpolatePosition(
                        animation.value.from,
                        animation.value.to,
                        progress
                    );
                    updateItemCallback(itemId, pos);
                    break;

                case 'rotation':
                    const rotation = interpolateNumber(
                        animation.value.from,
                        animation.value.to,
                        progress
                    );
                    updateItemCallback(itemId, { rotation });
                    break;
            }
        }
    }
}

// 处理定时动画
export function handleTimerAnimation(animation, updateItemCallback) {
    if (animation.trigger === 'time' && animation.interval > 0) {
        const now = Date.now();
        const progress = (now % animation.interval) / animation.interval;

        switch (animation.type) {
            case 'visibility':
                updateItemCallback(animation.itemId, {
                    visible: progress < 0.5 // 闪烁效果
                });
                break;

            case 'fill':
            case 'stroke':
                const color = interpolateColor(
                    animation.value.from,
                    animation.value.to,
                    Math.sin(progress * Math.PI * 2) * 0.5 + 0.5
                );
                updateItemCallback(animation.itemId, {
                    [animation.type]: color
                });
                break;

            case 'rotation':
                updateItemCallback(animation.itemId, {
                    rotation: progress * 360
                });
                break;
        }
    }
}

// 初始化动画系统
export function initAnimationSystem(store) {
    // 定时检查动画
    setInterval(() => {
        store.dispatch('animation/checkAnimations');
    }, 100);

    // 处理定时动画
    setInterval(() => {
        const timerAnimations = store.state.animation.animations.filter(
            a => a.trigger === 'time'
        );

        timerAnimations.forEach(anim => {
            handleTimerAnimation(anim, (id, updates) => {
                store.commit('editor/UPDATE_ITEM', { id, ...updates });
            });
        });
    }, 50);
}