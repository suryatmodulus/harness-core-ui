const { exit } = require('process')
const fs = require('fs')
const buildVersion = JSON.stringify(require('../package.json').version)
const packageJSON = {
  name: '@wings-software/nextgenui-types',
  description: 'Harness Inc',
  version: buildVersion.replace(/"/g, ''),
  author: 'Harness Inc',
  license: 'Harness Inc',
  types: './microfrontends/microFrontEndTypes.d.ts',
  homepage: 'http://app.harness.io/',
  repository: {
    type: 'git',
    url: 'https://github.com/wings-software/nextgenui.git'
  },
  bugs: {
    url: 'https://github.com/wings-software/nextgenui/issues'
  },
  publishConfig: {
    registry: 'https://npm.pkg.github.com/'
  }
}
fs.writeFileSync('./declarations/package.json', JSON.stringify(packageJSON))
exit(0)
