const state = {
    animations: [],
    dataTags: {} // 存储实时数据
}

const mutations = {
    ADD_ANIMATION(state, animation) {
        state.animations.push(animation)
    },

    UPDATE_ANIMATION(state, animation) {
        const index = state.animations.findIndex(a => a.id === animation.id)
        if (index !== -1) {
            state.animations.splice(index, 1, animation)
        }
    },

    REMOVE_ANIMATION(state, id) {
        state.animations = state.animations.filter(a => a.id !== id)
    },

    UPDATE_DATA_TAG(state, { tag, value }) {
        state.dataTags[tag] = value
    },
    SET_ANIMATIONS(state, animations) {
        state.animations = animations || []
    },
}

const actions = {
    addAnimation({ commit }, animation) {
        commit('ADD_ANIMATION', animation)
    },

    updateAnimation({ commit }, animation) {
        commit('UPDATE_ANIMATION', animation)
    },

    removeAnimation({ commit }, id) {
        commit('REMOVE_ANIMATION', id)
    },

    updateDataTag({ commit }, payload) {
        commit('UPDATE_DATA_TAG', payload)
            // 触发动画检查
        commit('CHECK_ANIMATIONS')
    },

    checkAnimations({ state, commit, rootState }) {
        state.animations.forEach(anim => {
            if (anim.trigger === 'data') {
                const value = state.dataTags[anim.dataTag] || 0

                if (anim.type === 'visibility') {
                    let visible = true
                    if (anim.condition === 'eq') {
                        visible = value === anim.conditionValue
                    } else if (anim.condition === 'gt') {
                        visible = value > anim.conditionValue
                    } else if (anim.condition === 'lt') {
                        visible = value < anim.conditionValue
                    }

                    const item = rootState.editor.canvasItems.find(i => i.id === anim.itemId)
                    if (item) {
                        commit('editor/UPDATE_ITEM', {
                            id: anim.itemId,
                            visible: anim.value === 'toggle' ? !item.visible : visible
                        })
                    }
                } else {
                    // 其他类型的动画处理
                    // 根据数据值在min-max范围内计算动画进度
                    const progress = Math.min(1, Math.max(0,
                        (value - anim.dataRange.min) / (anim.dataRange.max - anim.dataRange.min)
                    ))

                    // 应用动画效果
                    if (anim.type === 'fill' || anim.type === 'stroke') {
                        const color = interpolateColor(anim.value.from, anim.value.to, progress)
                        commit('editor/UPDATE_ITEM', {
                            id: anim.itemId,
                            [anim.type]: color
                        })
                    } else if (anim.type === 'position') {
                        const x = anim.value.from.x + (anim.value.to.x - anim.value.from.x) * progress
                        const y = anim.value.from.y + (anim.value.to.y - anim.value.from.y) * progress
                        commit('editor/MOVE_ITEM', { id: anim.itemId, x, y })
                    } else if (anim.type === 'rotation') {
                        const rotation = anim.value.from + (anim.value.to - anim.value.from) * progress
                        commit('editor/UPDATE_ITEM', {
                            id: anim.itemId,
                            rotation
                        })
                    }
                }
            }
        })
    }
}

// 辅助函数：颜色插值
function interpolateColor(color1, color2, factor) {
    if (factor <= 0) return color1
    if (factor >= 1) return color2

    const r1 = parseInt(color1.substring(1, 3), 16)
    const g1 = parseInt(color1.substring(3, 5), 16)
    const b1 = parseInt(color1.substring(5, 7), 16)

    const r2 = parseInt(color2.substring(1, 3), 16)
    const g2 = parseInt(color2.substring(3, 5), 16)
    const b2 = parseInt(color2.substring(5, 7), 16)

    const r = Math.round(r1 + factor * (r2 - r1))
    const g = Math.round(g1 + factor * (g2 - g1))
    const b = Math.round(b1 + factor * (b2 - b1))

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}