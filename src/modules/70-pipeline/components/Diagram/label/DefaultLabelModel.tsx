/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { LabelModel, LabelModelGenerics, LabelModelOptions } from '@projectstorm/react-diagrams-core'
import type { DeserializeEvent } from '@projectstorm/react-canvas-core'
import { DiagramType } from '../Constants'

export interface DefaultLabelModelOptions extends LabelModelOptions {
  label?: string
}

export interface DefaultLabelModelGenerics extends LabelModelGenerics {
  OPTIONS: DefaultLabelModelOptions
}

export class DefaultLabelModel extends LabelModel<DefaultLabelModelGenerics> {
  constructor(options: DefaultLabelModelOptions = {}) {
    super({
      offsetY: options.offsetY == null ? -23 : options.offsetY,
      type: DiagramType.Default,
      ...options
    })
  }

  setLabel(label: string): void {
    this.options.label = label
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event)
    this.options.label = event.data.label
  }

  serialize(): any {
    return {
      ...super.serialize(),
      label: this.options.label
    }
  }
}
