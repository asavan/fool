import path from "path";
import { fileURLToPath } from "url";

import HtmlWebpackPlugin from "html-webpack-plugin";
import HTMLInlineCSSWebpackPlugin from "html-inline-css-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserJSPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import {InjectManifest} from "workbox-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";

const prodConfig = () => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    return {

        entry: {main: ["./src/index.js", "./src/css/style.css"]},
        output: {
            path: path.resolve(dirname, "../docs"),
            filename: "[name].[contenthash].js",
            clean: true
        },
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
        optimization: {
            minimizer: [new TerserJSPlugin({
                terserOptions: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    }
                }
            }), new CssMinimizerPlugin()],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].[contenthash].css"
            }),
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: false
            }),
            new HTMLInlineCSSWebpackPlugin.default(),
            new InjectManifest({
                swDest: "sw.js",
                swSrc: "./src/sw.js",
                exclude: [
                    /index\.html$/,
                    /CNAME$/,
                    /\.nojekyll$/,
                    /_config\.yml$/,
                    /^.*well-known\/.*$/,
                ]
            }),
            new webpack.DefinePlugin({
                __USE_SERVICE_WORKERS__: true
            }),
            new CopyPlugin({
                patterns: [
                    { from: "./src/images", to: "./images" },
                    { from: "./github", to: "./" },
                    { from: "./src/manifest.json", to: "./" },
                    { from: "./.well-known", to: "./.well-known" }
                ],
            })
        ]
    };
};

export default prodConfig;
