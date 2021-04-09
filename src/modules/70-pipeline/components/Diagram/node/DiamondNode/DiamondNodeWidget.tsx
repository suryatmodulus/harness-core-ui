import React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Icon, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import type { DiamondNodeModel } from './DiamondNodeModel'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import { Event } from '../../Constants'
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

export const DiamondNodeWidget = (props: DiamondNodeProps): JSX.Element => {
  const options = props.node.getOptions()
  return (
    <div className={cssDefault.defaultNode} onClick={e => onClickNode(e, props.node)}>
      <div
        className={cx(cssDefault.defaultCard, css.diamond, { [cssDefault.selected]: props.node.isSelected() })}
        style={{ width: options.width, height: options.height, ...options.customNodeStyle }}
      >
        {options.icon && <Icon size={28} name={options.icon} />}
        {options.isInComplete && <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />}
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
  )
}
