import * as glob from 'glob';
import { safeLoad } from 'js-yaml';
import { writeFileSync, readFileSync } from 'fs';
import { parse } from 'path';
import { getGeneratedGrammar } from '../client/src/grammar';

glob('syntaxes/**/*.yaml', { nocase: true }, (_, files) => {
  for (const file of files) {
    const pathData = parse(file);
    writeFileSync(
      pathData.dir + '/' + pathData.name + '.tmLanguage.json',
      JSON.stringify(safeLoad(readFileSync(file).toString()), null, 2)
    );
  }

  console.log('Built files:\n', JSON.stringify(files));

  // get default custom blocks from package json
  const pJson = JSON.parse(readFileSync('package.json').toString());
  const defaultCustomBlocks = pJson.contributes.configuration.properties['ddx.grammar.customBlocks'].default;
  const generatedGrammar = getGeneratedGrammar('syntaxes/ddx.tmLanguage.json', defaultCustomBlocks);
  writeFileSync('syntaxes/ddx-generated.json', generatedGrammar);
  console.log('Generated ddx-generated.json');
});
