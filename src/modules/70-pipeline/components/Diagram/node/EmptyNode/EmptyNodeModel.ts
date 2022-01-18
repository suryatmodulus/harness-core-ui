/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DefaultNodeModel, DefaultNodeModelOptions } from '../DefaultNodeModel'
import { DefaultPortModel } from '../../port/DefaultPortModel'
import { DiagramType, PortName } from '../../Constants'

export class EmptyNodeModel extends DefaultNodeModel {
  constructor(option: DefaultNodeModelOptions = { name: 'Empty' }) {
    super({ type: DiagramType.EmptyNode, ...option })
    this.addPort(
      new DefaultPortModel({
        in: false,
        name: PortName.Out
      })
    )
    this.addPort(
      new DefaultPortModel({
        in: true,
        name: PortName.In
      })
    )
  }

  setOptions(options: DefaultNodeModelOptions): void {
    this.options = { ...this.getOptions(), ...options }
  }

  serialize(): any {
    return {
      ...super.serialize()
    }
  }

  deserialize(event: any): void {
    super.deserialize(event)
  }
}
