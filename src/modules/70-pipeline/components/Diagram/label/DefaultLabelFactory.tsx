/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { DefaultLabelModel } from './DefaultLabelModel'
import { DefaultLabelWidget } from './DefaultLabelWidget'
import { DiagramType } from '../Constants'

/**
 * @author Dylan Vorster
 */
export class DefaultLabelFactory extends AbstractReactFactory<DefaultLabelModel, DiagramEngine> {
  constructor() {
    super(DiagramType.Default)
  }

  generateReactWidget(event: { model: DefaultLabelModel }): JSX.Element {
    return <DefaultLabelWidget model={event.model} />
  }

  generateModel(): DefaultLabelModel {
    return new DefaultLabelModel()
  }
}
