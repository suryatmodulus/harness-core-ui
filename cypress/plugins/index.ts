/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// ***********************************************************
/* eslint-disable @typescript-eslint/no-var-requires, no-console  */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor')
module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  if (process.env.CYPRESS_COVERAGE) {
    require('@cypress/code-coverage/task')(on, config)
  }
  on('file:preprocessor', cypressTypeScriptPreprocessor)
  return config
}
