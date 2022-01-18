/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { EmptyNodeModel } from './EmptyNodeModel'
import { EmptyNodeWidget } from './EmptyNodeWidget'
import { DiagramType } from '../../Constants'

export class EmptyNodeFactory extends AbstractReactFactory<EmptyNodeModel, DiagramEngine> {
  constructor() {
    super(DiagramType.EmptyNode)
  }

  generateModel(): EmptyNodeModel {
    return new EmptyNodeModel()
  }

  generateReactWidget(event: any): JSX.Element {
    return <EmptyNodeWidget engine={this.engine} node={event.model} />
  }
}
