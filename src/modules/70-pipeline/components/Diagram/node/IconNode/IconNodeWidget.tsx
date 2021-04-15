import * as React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Text, IconName, Icon, Button } from '@wings-software/uicore'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import type { IconNodeModel } from './IconNodeModel'
import type { DefaultNodeModel } from '../DefaultNodeModel'
import { Event, DiagramDrag } from '../../Constants'
import cssDefault from '../DefaultNode.module.scss'
import css from './IconNode.module.scss'

export interface IconNodeWidgetProps {
  node: IconNodeModel
  engine: DiagramEngine
}

const generatePort = (port: DefaultPortModel, props: IconNodeWidgetProps): JSX.Element => {
  return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
}

const onClickNode = (e: React.MouseEvent<Element, MouseEvent>, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.ClickNode)
}

const onClick = (e: React.MouseEvent<Element, MouseEvent>, node: IconNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.RemoveNode)
}
const onMouseEnterNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseEnterNode)
}

const onMouseLeaveNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseLeaveNode)
}
export const IconNodeWidget: React.FC<IconNodeWidgetProps> = (props): JSX.Element => {
  const options = props.node.getOptions()
  const [dropable, setDropable] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  return (
    <div
      className={cx(cssDefault.defaultNode, css.iconNodeContainer)}
      onClick={e => onClickNode(e, props.node)}
      onMouseDown={e => {
        e.stopPropagation()
        props.node.setSelected(true)
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
      onMouseEnter={event => onMouseEnterNode((event as any) as MouseEvent, props.node)}
      onMouseLeave={event => onMouseLeaveNode((event as any) as MouseEvent, props.node)}
    >
      <div
        className={cx(
          cssDefault.defaultCard,
          css.iconNode,
          { [cssDefault.selected]: props.node.isSelected() },
          { [cssDefault.selected]: dropable }
        )}
        draggable={options.draggable}
        style={{
          marginTop: 32 - (options.height || 64) / 2,
          width: options.width,
          height: options.height,
          opacity: dragging ? 0.4 : 1,
          ...options.customNodeStyle
        }}
        onDragStart={event => {
          setDragging(true)
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props.node.serialize()))
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          setDragging(false)
        }}
      >
        <div>
          {options.isInComplete && (
            <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />
          )}
          {options.canDelete && (
            <Button
              className={cx(cssDefault.closeNode)}
              minimal
              icon="cross"
              iconProps={{ size: 10 }}
              onMouseDown={e => onClick(e, props.node)}
            />
          )}
          <Icon name={options.icon as IconName} size={options.iconSize} style={options.iconStyle} />
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
