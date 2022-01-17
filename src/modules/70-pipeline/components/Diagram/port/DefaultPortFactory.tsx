/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AbstractModelFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { DefaultPortModel } from './DefaultPortModel'
import { DiagramType } from '../Constants'

export class DefaultPortFactory extends AbstractModelFactory<DefaultPortModel, DiagramEngine> {
  constructor() {
    super(DiagramType.Default)
  }

  generateModel(): DefaultPortModel {
    return new DefaultPortModel({
      name: ''
    })
  }
}
