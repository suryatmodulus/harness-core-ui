/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { NodeStartModel } from './NodeStartModel'
import { NodeStartWidget } from './NodeStartWidget'
import { DiagramType } from '../../Constants'

export class NodeStartFactory extends AbstractReactFactory<NodeStartModel, DiagramEngine> {
  constructor() {
    super(DiagramType.StartNode)
  }

  generateModel(): NodeStartModel {
    return new NodeStartModel()
  }

  generateReactWidget(event: any): JSX.Element {
    return <NodeStartWidget engine={this.engine} node={event.model} />
  }
}
