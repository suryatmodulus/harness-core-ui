import * as React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import type { EmptyNodeModel } from './EmptyNodeModel'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import css from './EmptyNode.module.scss'

export interface EmptyNodeWidgetProps {
  node: EmptyNodeModel
  engine: DiagramEngine
}

export const EmptyNodeWidget: React.FC<EmptyNodeWidgetProps> = (props): JSX.Element => {
  const options = props.node.getOptions()
  const generatePort = (port: DefaultPortModel): JSX.Element => {
    return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
  }
  return (
    <div className={css.emptyNode}>
      {options.showPorts && (
        <div style={{ visibility: !options.hideInPort ? 'visible' : 'hidden' }} className={css.port}>
          {props.node.getInPorts().map(port => generatePort(port))}
        </div>
      )}
      {options.showPorts && (
        <div style={{ visibility: !options.hideOutPort ? 'visible' : 'hidden' }} className={css.port}>
          {props.node.getOutPorts().map(port => generatePort(port))}
        </div>
      )}
    </div>
  )
}
