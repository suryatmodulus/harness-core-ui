/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { AbstractReactFactory, GenerateWidgetEvent } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { StepGroupNodeLayerModel } from './StepGroupNodeLayerModel'
import { StepGroupNodeLayerWidget } from './StepGroupNodeLayerWidget'

export class StepGroupNodeLayerFactory extends AbstractReactFactory<StepGroupNodeLayerModel, DiagramEngine> {
  constructor() {
    super('step-group-nodes')
  }

  generateModel(): StepGroupNodeLayerModel {
    return new StepGroupNodeLayerModel()
  }

  generateReactWidget(event: GenerateWidgetEvent<StepGroupNodeLayerModel>): JSX.Element {
    return <StepGroupNodeLayerWidget layer={event.model} engine={this.engine} />
  }
}
