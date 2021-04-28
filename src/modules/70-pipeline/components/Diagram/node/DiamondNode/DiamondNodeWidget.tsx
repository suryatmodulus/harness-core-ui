import React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Icon, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { DefaultPortLabel } from '@pipeline/components/Diagram/port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '@pipeline/components/Diagram/port/DefaultPortModel'
import { useStrings } from 'framework/strings'
import type { DiamondNodeModel } from './DiamondNodeModel'
import { DiagramDrag, Event } from '../../Constants'
import type { DefaultNodeModel } from '../DefaultNodeModel'
import css from './DiamondNode.module.scss'
import cssDefault from '../DefaultNode.module.scss'

export interface DiamondNodeProps {
  node: DiamondNodeModel
  engine: DiagramEngine
}

const generatePort = (port: DefaultPortModel, props: DiamondNodeProps): JSX.Element => {
  return (
    <DefaultPortLabel
      engine={props.engine}
      port={port}
      key={port.getID()}
      className={cx({ [css.diamondPortIn]: port.getOptions().in }, { [css.diamondPortOut]: !port.getOptions().in })}
    />
  )
}
const onClick = (e: React.MouseEvent<Element, MouseEvent>, node: DiamondNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.RemoveNode)
}
const onClickNode = (e: React.MouseEvent<Element, MouseEvent>, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({}, Event.ClickNode)
}

const onMouseEnterNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseEnterNode)
}

const onMouseLeaveNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseLeaveNode)
}

export const DiamondNodeWidget = (props: DiamondNodeProps): JSX.Element => {
  const options = props.node.getOptions()
  const [dragging, setDragging] = React.useState(false)
  const { getString } = useStrings()
  return (
    <div
      className={cssDefault.defaultNode}
      onClick={e => onClickNode(e, props.node)}
      onMouseEnter={event => onMouseEnterNode((event as unknown) as MouseEvent, props.node)}
      onMouseLeave={event => onMouseLeaveNode((event as unknown) as MouseEvent, props.node)}
    >
      <div
        draggable={options.draggable}
        onDragStart={event => {
          setDragging(true)
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props.node.serialize()))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          if (options.allowDropOnLink) event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          if (options.allowDropOnNode) event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          setDragging(false)
        }}
      >
        <div
          className={cx(cssDefault.defaultCard, css.diamond, { [cssDefault.selected]: props.node.isSelected() })}
          style={{
            width: options.width,
            height: options.height,
            opacity: dragging ? 0.4 : 1,
            ...options.customNodeStyle
          }}
        >
          {options.icon && <Icon size={28} name={options.icon} style={options.iconStyle} />}
          {options.isInComplete && (
            <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />
          )}
          {props.node.getInPorts().map(port => generatePort(port, props))}
          {props.node.getOutPorts().map(port => generatePort(port, props))}
          {options?.tertiaryIcon && (
            <Icon
              className={css.tertiaryIcon}
              size={15}
              name={options?.tertiaryIcon}
              style={options?.tertiaryIconStyle}
              {...options.tertiaryIconProps}
            />
          )}
          {options.secondaryIcon && (
            <Icon
              className={css.secondaryIcon}
              size={8}
              name={options.secondaryIcon}
              style={options.secondaryIconStyle}
              {...options.secondaryIconProps}
            />
          )}
          {options.skipCondition && (
            <div className={css.сonditional}>
              <Text
                tooltip={`Skip condition:\n${options.skipCondition}`}
                tooltipProps={{
                  isDark: true
                }}
              >
                <Icon size={26} name={'conditional-skip-new'} color="white" />
              </Text>
            </div>
          )}
          {options.conditionalExecutionEnabled && (
            <div className={css.сonditional}>
              <Text
                tooltip={getString('pipeline.conditionalExecution.title')}
                tooltipProps={{
                  isDark: true
                }}
              >
                <Icon size={26} name={'conditional-skip-new'} color="white" />
              </Text>
            </div>
          )}
          {options.canDelete && (
            <Button
              className={cx(cssDefault.closeNode, css.diamondClose)}
              minimal
              icon="cross"
              iconProps={{ size: 10 }}
              onMouseDown={e => onClick(e, props.node)}
            />
          )}
        </div>
        <Text
          font={{ size: 'normal', align: 'center' }}
          style={{ cursor: 'pointer' }}
          padding="small"
          width={125}
          lineClamp={2}
        >
          {options.name}
        </Text>
      </div>
    </div>
  )
}
