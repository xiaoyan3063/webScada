export function serialize(items, variables) {
    return {
        items: items.map(item => {
            // 创建浅拷贝，排除一些不需要保存的属性
            const { id, type, ...rest } = item
            return { id, type, ...rest }
        }),
        variables: variables.map(variable => {
            const { id, ...rest } = variable
            return { id, ...rest }
        })
    }
}

export function deserialize(data) {
    return {
        items: data.items || [],
        variables: data.variables || []
    }
}