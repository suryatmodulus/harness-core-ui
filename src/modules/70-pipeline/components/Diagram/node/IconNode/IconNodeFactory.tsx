import * as React from 'react'
import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { IconNodeModel } from './IconNodeModel'
import { IconNodeWidget } from './IconNodeWidget'
import { DiagramType } from '../../Constants'

export class IconNodeFactory extends AbstractReactFactory<IconNodeModel, DiagramEngine> {
  constructor() {
    super(DiagramType.IconNode)
  }

  generateModel(): IconNodeModel {
    return new IconNodeModel()
  }

  generateReactWidget(event: any): JSX.Element {
    return <IconNodeWidget engine={this.engine} node={event.model} />
  }
}
