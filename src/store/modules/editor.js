const state = {
    isEditMode: true, // 默认编辑模式
    canvasItems: [],
    selectedItemId: null,
    currentTool: 'select',
    connections: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    history: [],
    historyIndex: -1,
    lastSaved: null,
    isSaving: false,
    availableImages: [] // 可用的图片列表
}

const mutations = {
    TOGGLE_EDIT_MODE(state) {
        state.isEditMode = !state.isEditMode
    },

    SAVE_CANVAS_STATE(state) {
        try {
            // 准备保存数据
            const saveData = {
                timestamp: new Date().toISOString(),
                version: '1.1',
                canvas: {
                    items: JSON.parse(JSON.stringify(state.canvasItems)),
                    connections: JSON.parse(JSON.stringify(state.connections)),
                    viewport: {
                        zoom: state.zoom,
                        pan: {...state.pan }
                    }
                },
                editorState: {
                    selectedItemId: state.selectedItemId,
                    currentTool: state.currentTool,
                    isEditMode: state.isEditMode
                }
            }

            // 保存到localStorage
            localStorage.setItem('scada-editor-state', JSON.stringify(saveData))

            // 更新最后保存时间
            state.lastSaved = new Date()

            console.log('画布状态已保存')
        } catch (error) {
            console.error('保存画布状态失败:', error)
        }
    },

    LOAD_CANVAS_STATE(state) {
        try {
            const savedData = localStorage.getItem('scada-editor-state')
            if (savedData) {
                const parsed = JSON.parse(savedData)

                // 验证数据格式
                if (parsed.version && parsed.canvas) {
                    state.canvasItems = parsed.canvas.items || []
                    state.connections = parsed.canvas.connections || []

                    // 恢复视口设置
                    if (parsed.canvas.viewport) {
                        state.zoom = parsed.canvas.viewport.zoom || 1
                        state.pan = parsed.canvas.viewport.pan || { x: 0, y: 0 }
                    }

                    // 恢复编辑器状态
                    if (parsed.editorState) {
                        state.selectedItemId = parsed.editorState.selectedItemId || null
                        state.currentTool = parsed.editorState.currentTool || 'select'
                        state.isEditMode = parsed.editorState.isEditMode !== false
                    }

                    // 重置历史记录
                    state.history = []
                    state.historyIndex = -1
                    this.commit('editor/SAVE_HISTORY')

                    console.log('画布状态已加载')
                }
            }
        } catch (error) {
            console.error('加载画布状态失败:', error)
        }
    },

    ADD_ITEM(state, item) {
        // 确保ID唯一
        const newItem = {
            ...item,
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        state.canvasItems.push(newItem)
        this.commit('editor/SAVE_HISTORY')
    },

    DELETE_ITEM(state, id) {
        // 删除相关连接
        state.connections = state.connections.filter(
            conn => conn.start.itemId !== id && conn.end.itemId !== id
        )

        // 删除项目
        state.canvasItems = state.canvasItems.filter(item => item.id !== id)

        // 如果删除的是选中项，清除选中状态
        if (state.selectedItemId === id) {
            state.selectedItemId = null
        }

        this.commit('editor/SAVE_HISTORY')
    },

    UPDATE_ITEM(state, payload) {
        const index = state.canvasItems.findIndex(item => item.id === payload.id)
        if (index !== -1) {
            state.canvasItems.splice(index, 1, {
                ...state.canvasItems[index],
                ...payload
            })
            this.commit('editor/SAVE_HISTORY')
        }
    },

    MOVE_ITEM(state, payload) {
        const index = state.canvasItems.findIndex(item => item.id === payload.id)
        if (index !== -1) {
            state.canvasItems.splice(index, 1, {
                ...state.canvasItems[index],
                x: payload.x,
                y: payload.y
            })
        }
    },

    SELECT_ITEM(state, id) {
        state.selectedItemId = id
    },

    SET_CURRENT_TOOL(state, tool) {
        state.currentTool = tool
    },

    ADD_CONNECTION(state, connection) {
        const newConn = {
            ...connection,
            id: connection.id || `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        state.connections.push(newConn)
        this.commit('editor/SAVE_HISTORY')
    },

    DELETE_CONNECTION(state, id) {
        state.connections = state.connections.filter(conn => conn.id !== id)
        this.commit('editor/SAVE_HISTORY')
    },

    SET_ZOOM(state, zoom) {
        state.zoom = Math.max(0.1, Math.min(zoom, 5)) // 限制缩放范围
    },

    SET_PAN(state, pan) {
        state.pan = {...pan }
    },

    SAVE_HISTORY(state) {
        // 限制历史记录数量
        if (state.history.length > 50) {
            state.history.shift()
            if (state.historyIndex > 0) state.historyIndex--
        }

        // 只保留当前位置之后的历史记录
        state.history = state.history.slice(0, state.historyIndex + 1)

        // 保存当前状态
        state.history.push({
            canvasItems: JSON.parse(JSON.stringify(state.canvasItems)),
            connections: JSON.parse(JSON.stringify(state.connections)),
            viewport: {
                zoom: state.zoom,
                pan: {...state.pan }
            }
        })

        state.historyIndex = state.history.length - 1
    },

    UNDO(state) {
        if (state.historyIndex > 0) {
            state.historyIndex--
                const history = state.history[state.historyIndex]
            this.commit('editor/RESTORE_FROM_HISTORY', history)
        }
    },

    REDO(state) {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++
                const history = state.history[state.historyIndex]
            this.commit('editor/RESTORE_FROM_HISTORY', history)
        }
    },

    RESTORE_FROM_HISTORY(state, history) {
        state.canvasItems = JSON.parse(JSON.stringify(history.canvasItems))
        state.connections = JSON.parse(JSON.stringify(history.connections))
        state.zoom = history.viewport ? history.viewport.zoom : 1
        state.pan = history.viewport ? history.viewport.pan : { x: 0, y: 0 }
    },
    SET_CANVAS_ITEMS(state, items) {
        state.canvasItems = items || []
    },

    SET_CONNECTIONS(state, connections) {
        state.connections = connections || []
    },

    SET_EDIT_MODE(state, isEditMode) {
        state.isEditMode = isEditMode !== false
    },
    RESET_HISTORY(state) {
        state.history = []
        state.historyIndex = -1
        this.commit('editor/SAVE_HISTORY')
    },
    ADD_IMAGE_ITEM(state, item) {
        const newItem = {
            ...item,
            type: 'ScadaImage',
            id: `img-${Date.now()}`,
            width: item.width || 100,
            height: item.height || 100,
            // src: item.src || '',
            keepAspectRatio: true
        }
        state.canvasItems.push(newItem)
        this.commit('editor/SAVE_HISTORY')
    },

    SET_AVAILABLE_IMAGES(state, images) {
        state.availableImages = images
    }
}

const actions = {
    toggleEditMode({ commit }) {
        commit('TOGGLE_EDIT_MODE')
    },

    saveCanvasState({ commit }) {
        commit('SAVE_CANVAS_STATE')
    },

    loadCanvasState({ commit }) {
        commit('LOAD_CANVAS_STATE')
    },

    autoSave({ commit, state }) {
        if (!state.isSaving) {
            state.isSaving = true
            commit('SAVE_CANVAS_STATE')
            setTimeout(() => {
                state.isSaving = false
            }, 1000)
        }
    },

    addItem({ commit }, item) {
        commit('ADD_ITEM', item)
    },

    updateItem({ commit }, payload) {
        commit('UPDATE_ITEM', payload)
    },

    moveItem({ commit }, payload) {
        commit('MOVE_ITEM', payload)
    },

    deleteItem({ commit, state }, id) {
        commit('DELETE_ITEM', id)
    },

    deleteSelectedItem({ commit, state }) {
        if (state.selectedItemId) {
            commit('DELETE_ITEM', state.selectedItemId)
        }
    },

    selectItem({ commit }, id) {
        commit('SELECT_ITEM', id)
    },

    setCurrentTool({ commit }, tool) {
        commit('SET_CURRENT_TOOL', tool)
    },

    addConnection({ commit }, connection) {
        commit('ADD_CONNECTION', connection)
    },

    deleteConnection({ commit }, id) {
        commit('DELETE_CONNECTION', id)
    },

    setZoom({ commit }, zoom) {
        commit('SET_ZOOM', zoom)
    },

    setPan({ commit }, pan) {
        commit('SET_PAN', pan)
    },

    undo({ commit }) {
        commit('UNDO')
    },

    redo({ commit }) {
        commit('REDO')
    },
    addImageItem({ commit }, payload) {
        commit('ADD_IMAGE_ITEM', payload)
    },

    loadAvailableImages({ commit }) {
        // 这里可以从API加载或使用本地图片
        const images = [
            { name: '设备1', src: '/images/pump.png' },
            { name: '设备2', src: '/images/tank.png' },
            { name: '阀门', src: '/images/valve.png' }
        ]
        commit('SET_AVAILABLE_IMAGES', images)
    }
}

const getters = {
    getSelectedItem: (state) => {
        return state.canvasItems.find(item => item.id === state.selectedItemId)
    },

    getConnectionsForItem: (state) => (itemId) => {
        return state.connections.filter(
            conn => conn.start.itemId === itemId || conn.end.itemId === itemId
        )
    },

    canUndo: (state) => {
        return state.historyIndex > 0
    },

    canRedo: (state) => {
        return state.historyIndex < state.history.length - 1
    },

    canvasState: (state) => {
        return {
            items: state.canvasItems,
            connections: state.connections,
            viewport: {
                zoom: state.zoom,
                pan: state.pan
            }
        }
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}