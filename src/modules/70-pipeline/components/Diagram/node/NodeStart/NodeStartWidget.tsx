/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import cx from 'classnames'
import { Icon } from '@wings-software/uicore'
import type { NodeStartModel } from './NodeStartModel'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import css from './NodeStart.module.scss'

export interface NodeStartWidgetProps {
  node: NodeStartModel
  engine: DiagramEngine
}

export const NodeStartWidget: React.FC<NodeStartWidgetProps> = (props): JSX.Element => {
  const generatePort = (port: DefaultPortModel): JSX.Element => {
    return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
  }
  const options = props.node.getOptions()
  return (
    <div className={css.defaultNode}>
      <div className={cx(css.nodeStart, { ['selected']: props.node.isSelected() })}>
        <div>
          <Icon name={options.icon || 'play'} style={{ color: props.node.color }} className={css.icon} />
          <div>
            <div style={{ visibility: props.node.isStart ? 'initial' : 'hidden' }}>
              {props.node.getOutPorts().map(generatePort)}
            </div>
            <div style={{ visibility: props.node.isStart ? 'hidden' : 'initial' }}>
              {props.node.getInPorts().map(generatePort)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
