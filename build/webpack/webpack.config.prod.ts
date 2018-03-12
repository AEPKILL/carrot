import * as cleanPlugin from 'clean-webpack-plugin';
import { resolve } from 'path';
import { Configuration } from 'webpack';
import * as merge from 'webpack-merge';

import project from '../project';
import webpackBaseConfig from './webpack.config.base';

const webpackDevConfig: Configuration = {
  plugins: [
    new cleanPlugin(['prod/**/*'], { root: project.distPath })
  ],
  output: {
    path: resolve(project.distPath, 'prod')
  }
};

export default merge(webpackBaseConfig, webpackDevConfig);
