/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const PipelineResponse = {
  status: 'SUCCESS',
  data: {
    ngPipeline: {
      pipeline: {
        name: 'test-p1',
        identifier: 'editPipeline',
        description: 'my pipeline',
        tags: null,
        variables: null,
        metadata: null
      }
    },
    executionsPlaceHolder: [],
    yamlPipeline:
      'pipeline:\n  name: test-p1\n  identifier: test-p1\n  description: ""\n  tags: ""\n  stages:\n    - stage:\n        name: ci stage\n        identifier: ci_stage\n        description: ""\n        type: CI\n        spec:\n          execution:\n            steps:\n              - step:\n                  type: run\n                  name: runstep\n                  identifier: runstep\n                  spec:\n                    image: runimage\n                    connectorRef: <+input>\n                    command:\n                      - runcommand\n          dependencies:\n            - identifier: depname\n              name: depname\n              type: dependency\n              spec:\n                image: depimage\n                connectorRef: <+input>\n          cloneCodebase: true\n'
  },
  metaData: null,
  correlationId: 'd9df6311-b6a4-44de-a6b4-504bf0036ba2'
}
