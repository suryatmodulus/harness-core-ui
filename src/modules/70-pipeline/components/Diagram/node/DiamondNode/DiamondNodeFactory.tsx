/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { DiamondNodeModel } from './DiamondNodeModel'
import { DiamondNodeWidget } from './DiamondNodeWidget'
import { DiagramType } from '../../Constants'

export class DiamondNodeFactory extends AbstractReactFactory<DiamondNodeModel, DiagramEngine> {
  constructor() {
    super(DiagramType.DiamondNode)
  }

  generateReactWidget(event: { model: DiamondNodeModel }): JSX.Element {
    return <DiamondNodeWidget engine={this.engine} node={event.model} />
  }

  generateModel(): DiamondNodeModel {
    return new DiamondNodeModel()
  }
}
