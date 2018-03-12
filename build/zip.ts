import archiver = require('archiver');
import { green, red } from 'cli-color';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

import project from './project';
import config from './webpack/webpack.config.prod';

// tslint:disable-next-line:no-string-literal
const version = process.env['npm_package_version']!;
// tslint:disable-next-line:no-string-literal
const name = process.env['npm_package_name']!;
const zipFilename = `${name}_${version}.zip`;
const zipFilePath = resolve(project.distPath, zipFilename);
const productionAssetsPath = config.output!.path!;
const output = createWriteStream(zipFilePath);
const archive = archiver('zip');

archive.pipe(output);
archive.directory(productionAssetsPath, false);
archive.finalize();

archive.on('error', showErrorMessage);
output.on('error', showErrorMessage);
output.on('close', showSuccessMessage);

function showErrorMessage(error: Error) {
  console.log(`${red('build error')}: ${error.message}`);
  throw error;
}

function showSuccessMessage() {
  console.log(`${green('build success')}: ${zipFilePath}`);
}
