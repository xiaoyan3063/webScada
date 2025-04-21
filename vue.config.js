const path = require('path');

module.exports = {
    chainWebpack: config => {
        // GLB/GLTF 文件处理规则
        config.module
            .rule('glb')
            .test(/\.(glb|gltf)$/)
            .use('file-loader')
            .loader('file-loader')
            .options({
                name: 'assets/models/[name].[hash:8].[ext]',
                esModule: false
            })
            .end();

        // 图片处理优化配置（新增）
        config.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
            .use('url-loader')
            .loader('url-loader')
            .tap(options => {
                options.limit = 0; // 禁用 base64 内联
                return options;
            })
            .end();
    },

    configureWebpack: {
        resolve: {
            alias: {
                joint: path.resolve(__dirname, 'node_modules/jointjs/dist/joint.js'),
                '@': path.resolve(__dirname, 'src'),
                // 新增图片路径别名（可选）
                '@images': path.resolve(__dirname, 'public/images')
            }
        },
        // 其他 webpack 配置...
    },

    // 开发服务器配置（可选）
    devServer: {
        static: {
            directory: path.join(__dirname, 'public')
        },
        compress: true,
        port: 8080,
        hot: true
    }
};