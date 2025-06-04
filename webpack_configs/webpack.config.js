import os from "os";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";

function getLocalExternalIP(defaultAddr) {
    let cand = Object.values(os.networkInterfaces())
        .flat()
        .filter(a => a.family === "IPv4" && !a.internal);
    if (cand.length > 1) {
        cand = cand.filter(a => a.netmask === "255.255.255.0")
    }
    if (cand.length === 0) {
        return defaultAddr;
    }
    cand = cand.map(a => a.address);
    console.log(cand);
    return cand.slice(-1)[0];
}

const devConfig = () => {
    const addr = "0.0.0.0" || getLocalExternalIP("0.0.0.0");
    console.log(addr);
    return {
        entry: {main: ["./src/index.js", "./src/css/style.css"]},
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [{
                        loader: MiniCssExtractPlugin.loader
                    }, "css-loader"],
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: false,
            }),
            new MiniCssExtractPlugin({
                filename: "[name].css"
            }),
            new webpack.DefinePlugin({
                __USE_SERVICE_WORKERS__: false,
                __USE_DEBUG_ASSERT__: true
            }),
            new CopyPlugin({
                patterns: [
                    { from: "./src/images", to: "./images" },
                    { from: "./src/manifest.json", to: "./" },
                    { from: "./.well-known", to: "./.well-known" }
                ],
            })
        ],
        devServer: {
            compress: true,
            port: 8080,
            hot: true,
            open: true,
            host: 'local-ip'
        }
    };
};

export default devConfig;
