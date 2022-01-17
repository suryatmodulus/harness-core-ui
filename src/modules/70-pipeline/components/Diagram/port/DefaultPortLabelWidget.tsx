/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core'
import { Button } from '@wings-software/uicore'
import cx from 'classnames'
import type { DefaultPortModel } from './DefaultPortModel'
import css from './DefaultPort.module.scss'

export interface DefaultPortLabelProps {
  port: DefaultPortModel
  engine: DiagramEngine
  className?: string
}

export const DefaultPortLabel = (props: DefaultPortLabelProps): JSX.Element => {
  const { port, engine, className = '' } = props
  return (
    <div
      className={cx(
        css.port,
        { [css.portIn]: port.getOptions().in },
        { [css.portOut]: !port.getOptions().in },
        className
      )}
    >
      <PortWidget engine={engine} port={port}>
        <Button intent="primary" className={css.portBtn} minimal icon="circle" iconProps={{ size: 8 }} />
      </PortWidget>
    </div>
  )
}
