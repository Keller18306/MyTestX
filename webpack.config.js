const path = require('path');

module.exports = {
    // mode: 'development',
    // devtool: false,
    mode: 'production',
    target: 'node',
    entry: {
        index: {
            import: './src/server/index.ts',
            dependOn: 'config',
        },
        config: './src/server/config.ts'
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    },
    optimization: {
        minimize: false
    }
}