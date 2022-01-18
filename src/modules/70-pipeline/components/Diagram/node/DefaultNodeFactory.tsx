/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { DefaultNodeModel } from './DefaultNodeModel'
import { DefaultNodeWidget } from './DefaultNodeWidget'
import { DiagramType } from '../Constants'

export class DefaultNodeFactory extends AbstractReactFactory<DefaultNodeModel, DiagramEngine> {
  constructor() {
    super(DiagramType.Default)
  }

  generateReactWidget(event: { model: DefaultNodeModel }): JSX.Element {
    return <DefaultNodeWidget engine={this.engine} node={event.model} />
  }

  generateModel(): DefaultNodeModel {
    return new DefaultNodeModel()
  }
}
