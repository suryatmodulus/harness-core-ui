import React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Icon, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { DefaultNodeModel } from './DefaultNodeModel'
import { DefaultPortLabel } from '../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../port/DefaultPortModel'

import { Event, DiagramDrag } from '../Constants'
import css from './DefaultNode.module.scss'

export interface DefaultNodeProps {
  node: DefaultNodeModel
  engine: DiagramEngine
}

const generatePort = (port: DefaultPortModel, props: DefaultNodeProps): JSX.Element => {
  return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
}

const onAddNodeClick = (
  e: React.MouseEvent<Element, MouseEvent>,
  node: DefaultNodeModel,
  setAddClicked: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  e.stopPropagation()
  node.fireEvent(
    {
      callback: () => {
        setAddClicked(false)
      },
      target: e.target
    },
    Event.AddParallelNode
  )
}

const onRemoveClick = (e: React.MouseEvent<Element, MouseEvent>, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.RemoveNode)
}

const onClickNode = (e: React.MouseEvent<Element, MouseEvent>, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.ClickNode)
}

const onMouseOverNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseOverNode)
}

const onMouseEnterNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseEnterNode)
}

const onMouseLeaveNode = (e: MouseEvent, node: DefaultNodeModel): void => {
  e.stopPropagation()
  node.fireEvent({ target: e.target }, Event.MouseLeaveNode)
}

export const DefaultNodeWidget = (props: DefaultNodeProps): JSX.Element => {
  const { getString } = useStrings()
  const options = props.node.getOptions()
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const allowAdd = options.allowAdd ?? false
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [addClicked, setAddClicked] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    const currentNode = nodeRef.current

    const onMouseOver = (e: MouseEvent): void => {
      if (!addClicked && allowAdd) {
        setVisibilityOfAdd(true)
      }
      onMouseOverNode(e, props.node)
    }

    const onMouseEnter = (e: MouseEvent): void => {
      onMouseEnterNode(e, props.node)
    }

    const onMouseLeave = (e: MouseEvent): void => {
      if (!addClicked && allowAdd) {
        setVisibilityOfAdd(false)
      }
      onMouseLeaveNode(e, props.node)
    }

    if (currentNode) {
      currentNode.addEventListener('mouseenter', onMouseEnter)
      currentNode.addEventListener('mouseover', onMouseOver)
      currentNode.addEventListener('mouseleave', onMouseLeave)
    }
    return () => {
      if (currentNode) {
        currentNode.removeEventListener('mouseenter', onMouseEnter)
        currentNode.removeEventListener('mouseover', onMouseOver)
        currentNode.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [nodeRef, allowAdd, addClicked, props.node])

  React.useEffect(() => {
    if (!addClicked) {
      setVisibilityOfAdd(false)
    }
  }, [addClicked])

  React.useEffect(() => {
    if (options.selected !== props.node.isSelected()) {
      props.node.setSelected(options.selected)
    }
  }, [options.selected])

  return (
    <div
      className={css.defaultNode}
      ref={nodeRef}
      onClick={e => onClickNode(e, props.node)}
      onMouseDown={e => {
        e.stopPropagation()
        props.node.setSelected(true)
      }}
      onDragOver={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }
      }}
      onDragLeave={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }
      }}
      onDrop={event => {
        event.stopPropagation()
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          const dropData: { id: string; identifier: string } = JSON.parse(
            event.dataTransfer.getData(DiagramDrag.NodeDrag)
          )
          props.node.setSelected(false)
          props.node.fireEvent({ node: dropData }, Event.DropLinkEvent)
        }
      }}
    >
      <div
        className={cx(
          css.defaultCard,
          {
            [css.selected]:
              props.node.isSelected() &&
              !options.customNodeStyle?.background &&
              !options.customNodeStyle?.backgroundColor &&
              !(options.nodeClassName && options.nodeClassName.length > 0)
          },
          options.nodeClassName
        )}
        draggable={options.draggable}
        style={{
          width: options.width,
          height: options.height,
          marginTop: 32 - (options.height || 64) / 2,
          cursor: options.draggable ? 'move' : 'pointer',
          opacity: dragging ? 0.4 : 1,
          ...options.customNodeStyle
        }}
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
        {/* Only add the icon style if the stage is not skipped.
        Otherwise, the deploymet icon becomes transparent and we do not see it when the stage is skipped. */}
        {options.icon && <Icon size={28} name={options.icon} {...options.iconProps} style={options.iconStyle} />}
        <div style={{ visibility: options.showPorts ? 'visible' : 'hidden' }}>
          {props.node.getInPorts().map(port => generatePort(port, props))}
        </div>
        <div style={{ visibility: options.showPorts ? 'visible' : 'hidden' }}>
          {props.node.getOutPorts().map(port => generatePort(port, props))}
        </div>
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

        {options.isInComplete && <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />}
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
            className={css.closeNode}
            minimal
            icon="cross"
            iconProps={{ size: 10 }}
            onMouseDown={e => onRemoveClick(e, props.node)}
          />
        )}
      </div>
      <Text
        font={{ size: 'normal', align: 'center' }}
        style={{ cursor: 'pointer', lineHeight: '1.6', overflowWrap: 'break-word' }}
        padding="xsmall"
        width={125}
        lineClamp={2}
        tooltipProps={{ position: Position.RIGHT, portalClassName: css.hoverName }}
      >
        {options.name}
      </Text>
      {allowAdd && (
        <div
          onClick={e => {
            setAddClicked(true)
            setVisibilityOfAdd(true)
            onAddNodeClick(e, props.node, setAddClicked)
          }}
          className={css.addNode}
          data-nodeid="add-parallel"
          style={{
            width: options.width,
            height: options.height,
            display: showAdd ? 'flex' : 'none',
            marginLeft: (126 - (options.width || 64)) / 2
          }}
        >
          <Icon name="plus" style={{ color: 'var(--diagram-add-node-color)' }} />
        </div>
      )}
    </div>
  )
}
