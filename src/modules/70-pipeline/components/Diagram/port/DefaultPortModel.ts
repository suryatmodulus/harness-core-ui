/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  LinkModel,
  PortModel,
  PortModelAlignment,
  PortModelGenerics,
  PortModelOptions
} from '@projectstorm/react-diagrams-core'
import type { AbstractModelFactory, DeserializeEvent } from '@projectstorm/react-canvas-core'
import { DefaultLinkModel } from '../link/DefaultLinkModel'
import { DiagramType } from '../Constants'

export interface DefaultPortModelOptions extends PortModelOptions {
  label?: string
  in?: boolean
}

export interface DefaultPortModelGenerics extends PortModelGenerics {
  OPTIONS: DefaultPortModelOptions
}

export class DefaultPortModel extends PortModel<DefaultPortModelGenerics> {
  constructor(isIn: boolean, name?: string, label?: string)
  constructor(options: DefaultPortModelOptions)
  constructor(options: DefaultPortModelOptions | boolean, name?: string, label?: string) {
    if (name) {
      options = {
        in: !!options,
        name: name,
        label: label
      }
    }
    options = options as DefaultPortModelOptions
    super({
      label: options.label || options.name,
      alignment: options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
      type: DiagramType.Default,
      ...options
    })
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event)
    this.options.in = event.data.in
    this.options.label = event.data.label
  }

  serialize(): any {
    return {
      ...super.serialize(),
      in: this.options.in,
      label: this.options.label
    }
  }

  link<T extends LinkModel>(port: PortModel, factory?: AbstractModelFactory<T>): T {
    const link = this.createLinkModel(factory)
    link.setSourcePort(this)
    link.setTargetPort(port)
    return link as T
  }

  canLinkToPort(port: PortModel): boolean {
    if (port instanceof DefaultPortModel) {
      return this.options.in !== port.getOptions().in
    }
    return true
  }

  createLinkModel(factory?: AbstractModelFactory<LinkModel>): LinkModel {
    const link = super.createLinkModel()
    if (!link && factory) {
      return factory.generateModel({})
    }
    return link || new DefaultLinkModel()
  }
}
