const LIBRARY_NAME = "App";

// SFDX Paths
const path = require('path')
const SFDX_PATH = "sfdx/DX";
const SFDX_RESOURCE_PATH = "sfdx/DX/force-app/main/default/staticresources/poncho";

// Plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const exec = require("child_process").exec;
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const entry = {
    "index": ["./src/index.scss"]
}

// Optimise?
const minifyForProd = true;

module.exports = {
	resolve: {
	  modules: [path.resolve(__dirname, './src'), 'node_modules'],
	  extensions: ['.js', '.jsx', '.json'],
	  alias: {
	    reducers: path.resolve(__dirname, './src/reducers')
	  }
	},
	entry: [
			"@babel/polyfill", // Load this first
		  // 'react-hot-loader/patch', // This package already requires/loads react (but not react-dom). It must be loaded after babel-polyfill to ensure both react and react-dom use the same Symbol.
		  "react", // Include this to enforce order
		  "react-dom", // Include this to enforce order
		  "./src/index.js" // Path to your app's entry file
	],
	mode: "development",
	output: {
		path: __dirname + "/" + SFDX_RESOURCE_PATH,
		filename: "bundle.js",
		library: LIBRARY_NAME
	},
	devtool: "eval",
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			},
			{
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
              MiniCssExtractPlugin.loader,
              "css-loader",
              "postcss-loader",
              "sass-loader"
          ]
      }
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'bundle.css',
			minimize: true
		}),
		new webpack.LoaderOptionsPlugin({
	    options: {
	      postcss: [
	        autoprefixer(),
	      ]
	     }
	  }),
		{
			apply: (compiler) => {
				compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
					exec("cd " + SFDX_PATH + " && sfdx force:source:push -f", (err, stdout, stderr) => { // shell command to navigate to the DX folder and push to scratch org
						if (stdout) process.stdout.write(stdout);
						if (stderr) process.stderr.write(stderr);
					});
				});
			}
		}
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: false,
			}),
			new OptimizeCSSAssetsPlugin({})
		],
		minimize: minifyForProd
	}
};
