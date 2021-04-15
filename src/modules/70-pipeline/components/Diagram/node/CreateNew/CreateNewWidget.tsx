import * as React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Icon } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Text } from '@wings-software/uicore'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import type { CreateNewModel, CreateNewModelOptions } from './CreateNewModel'
import type { DefaultNodeModel } from '../DefaultNodeModel'
import { Event, DiagramDrag } from '../../Constants'
import cssDefault from '../DefaultNode.module.scss'
import css from './CreateNew.module.scss'

export interface CreateNewWidgetProps {
  node: CreateNewModel
  engine: DiagramEngine
}
const generatePort = (port: DefaultPortModel, props: CreateNewWidgetProps): JSX.Element => {
  return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
}

const onClickNode = (e: React.MouseEvent<Element, MouseEvent>, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.ClickNode)
}

export const CreateNewWidget: React.FC<CreateNewWidgetProps> = (props): JSX.Element => {
  const options: CreateNewModelOptions = props.node.getOptions()
  const { disabled = false } = options
  const [dropable, setDropable] = React.useState(false)
  return (
    <div
      className={cx(cssDefault.defaultNode, css.createNode)}
      onClick={e => !disabled && onClickNode(e, props.node)}
      onMouseDown={e => {
        e.stopPropagation()
        !disabled && props.node.setSelected(true)
      }}
      onDragOver={event => {
        setDropable(true)
        event.preventDefault()
      }}
      onDragLeave={() => {
        setDropable(false)
      }}
      onDrop={event => {
        event.stopPropagation()
        setDropable(false)
        const dropData: { id: string; identifier: string } = JSON.parse(
          event.dataTransfer.getData(DiagramDrag.NodeDrag)
        )
        props.node.fireEvent({ node: dropData }, Event.DropLinkEvent)
      }}
    >
      <div
        className={cx(
          cssDefault.defaultCard,
          css.createNew,
          { [css.disabled]: disabled },
          { [cssDefault.selected]: props.node.isSelected() },
          { [cssDefault.selected]: dropable }
        )}
        style={{
          marginTop: 32 - (options.height || 64) / 2,
          width: options.width,
          height: options.height,
          ...options.customNodeStyle
        }}
      >
        <div>
          <Icon icon="plus" iconSize={20} color={'var(--diagram-grey)'} />

          <div>
            <div style={{ visibility: options.showPorts ? 'visible' : 'hidden' }}>
              {props.node.getInPorts().map(port => generatePort(port, props))}
            </div>
            <div style={{ visibility: options.showPorts ? 'visible' : 'hidden' }}>
              {props.node.getOutPorts().map(port => generatePort(port, props))}
            </div>
          </div>
        </div>
      </div>
      {!isEmpty(options.name) && (
        <Text
          font={{ align: 'center' }}
          padding="xsmall"
          lineClamp={2}
          style={{ marginLeft: '-30px', marginRight: '-30px' }}
        >
          {options.name}
        </Text>
      )}
    </div>
  )
}
