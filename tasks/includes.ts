import os = require('os');
import fs = require('fs');
import path = require('path');

type Options = {
  packages: string[]
  dest: string
  force: string[]
  headersOnly: boolean
} 

/**
 * Generates JVMTypes.d.ts in the includes/ directory.
 */
function includes(grunt: IGrunt) {
  grunt.registerMultiTask('includes', 'Generates JVMTypes.d.ts.', function() {
    const doppiohPath: string = 'build/dev-cli/console/doppioh.js';
    const options = this.options<Options>(null);
    const done: (status?: boolean) => void = this.async();
    const standardArgPrefix = [doppiohPath, '-d', options.dest, '-ts', '-dpath', './src/doppiojvm'];

    if (options.force != null && options.force.length > 0) {
      standardArgPrefix.push('-f', options.force.join(":"));
    }

    if (options.headersOnly) {
      standardArgPrefix.push('-headers_only');
    }

    grunt.util.spawn({
      cmd: 'node',
      args: standardArgPrefix.concat(options.packages)
    }, function(error: Error, result: grunt.util.ISpawnResult, code: number) {
      if (code !== 0 || error) {
        grunt.fail.fatal(`Could not run doppioh (exit code ${code}): ${error ? `${error}\n` : ''}${result.stdout}\n${result.stderr}`);
      } else {
        done();
      }
    });
  });
}

export = includes;
