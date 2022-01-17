/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { DefaultNodeModel, DefaultNodeModelOptions } from '../DefaultNodeModel'
import { DiagramType, PortName } from '../../Constants'
import { DefaultPortModel } from '../../port/DefaultPortModel'

export interface IconNodeModelOptions extends Omit<DefaultNodeModelOptions, 'name'> {
  name?: string
  icon?: IconName
  iconSize?: number
}

export class IconNodeModel extends DefaultNodeModel {
  name: string

  constructor(options: IconNodeModelOptions = {}) {
    const name = options.name || ''
    super({
      ...options,
      type: DiagramType.IconNode,
      name
    })
    this.name = name
    this.addPort(
      new DefaultPortModel({
        in: true,
        name: PortName.In
      })
    )
    this.addPort(
      new DefaultPortModel({
        in: false,
        name: PortName.Out
      })
    )
  }

  serialize(): any {
    return {
      ...super.serialize(),
      text: this.name
    }
  }

  deserialize(event: any): void {
    super.deserialize(event)
    this.name = event.data.text
  }
}
