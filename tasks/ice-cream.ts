import os = require('os');
import fs = require('fs');
import path = require('path');
import esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

type Options = {
  remove: string[]
}

function iceCream(grunt: IGrunt) {
  grunt.registerMultiTask('ice-cream', 'Removes debug statements from code.', function() {
    const remove: string[] = this.options<Options>(null).remove;

    this.files.forEach((file: {src: string[]; dest: string}) => {
      const jsFileContent = fs.readFileSync(file.src[0]).toString();
      const ast = esprima.parse(jsFileContent, {loc: true, range: true});
      // Ensure destination folder exists
      if (!fs.existsSync(path.dirname(file.dest))) {
        grunt.file.mkdir(path.dirname(file.dest));
      }
      const processedAst = estraverse.replace(ast, {
        enter: function(node: any) {
            if (node.type === 'ExpressionStatement' &&
                node.expression.type === 'CallExpression' &&
                remove.indexOf(node.expression.callee.name) > -1) {
                return {type:'EmptyStatement'};
            }
        }
      });
      const output = escodegen.generate(processedAst, {
        sourceMap: path.relative(path.dirname(file.dest), file.src[0]),
        sourceMapWithCode: true
      });

      const mapDest = file.dest + '.map';
      fs.writeFileSync(mapDest, JSON.stringify(output.map));
      fs.writeFileSync(file.dest, `${output.code}\n//# sourceMappingURL=${path.basename(file.dest)}.map`);
    });
  });
}

export = iceCream;
