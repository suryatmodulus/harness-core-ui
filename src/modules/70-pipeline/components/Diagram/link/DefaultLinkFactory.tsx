/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AbstractReactFactory } from '@projectstorm/react-canvas-core'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import cx from 'classnames'
import { DefaultLinkModel } from './DefaultLinkModel'
import { DefaultLinkWidget } from './DefaultLinkWidget'
import { DiagramType } from '../Constants'
import css from './Default.module.scss'

export class DefaultLinkFactory<Link extends DefaultLinkModel = DefaultLinkModel> extends AbstractReactFactory<
  Link,
  DiagramEngine
> {
  constructor(type = DiagramType.Default) {
    super(type)
  }

  generateReactWidget(event: { model: DefaultLinkModel }): JSX.Element {
    return <DefaultLinkWidget link={event.model} diagramEngine={this.engine} />
  }

  generateModel(): Link {
    return new DefaultLinkModel() as Link
  }

  generateLinkSegment(model: Link, selected: boolean, path: string, allowAdd: boolean, prevColor: string): JSX.Element {
    const options = model.getOptions()
    return (
      <path
        stroke={selected ? options.selectedColor : options.color}
        className={cx({ [css.path]: options.color !== prevColor })}
        strokeWidth={options.width}
        strokeDasharray={options.strokeDasharray}
        d={path}
        fill="none"
        pointerEvents={allowAdd ? 'all' : 'none'}
        onAnimationEnd={e => {
          e.currentTarget.style.strokeDasharray = '0'
        }}
      ></path>
    )
  }
}
