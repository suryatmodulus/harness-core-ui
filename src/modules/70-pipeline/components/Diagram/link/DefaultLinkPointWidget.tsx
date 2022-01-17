/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { PointModel } from '@projectstorm/react-diagrams-core'

export interface DefaultLinkPointWidgetProps {
  point: PointModel
  color?: string
  colorSelected: string
}

export interface DefaultLinkPointWidgetState {
  selected: boolean
}

export class DefaultLinkPointWidget extends React.Component<DefaultLinkPointWidgetProps, DefaultLinkPointWidgetState> {
  constructor(props: DefaultLinkPointWidgetProps) {
    super(props)
    this.state = {
      selected: false
    }
  }

  onMouseLeave(): void {
    this.setState({ selected: false })
  }

  onMouseEnter(): void {
    this.setState({ selected: true })
  }

  render(): JSX.Element {
    const { point } = this.props
    return (
      <g>
        <circle
          cx={point.getPosition().x}
          cy={point.getPosition().y}
          r={5}
          fill={this.state.selected || this.props.point.isSelected() ? this.props.colorSelected : this.props.color}
        />
        <circle
          onMouseLeave={this.onMouseLeave}
          onMouseEnter={this.onMouseEnter}
          data-id={point.getID()}
          data-linkid={point.getLink().getID()}
          cx={point.getPosition().x}
          cy={point.getPosition().y}
          r={15}
          opacity={0.0}
        />
      </g>
    )
  }
}
