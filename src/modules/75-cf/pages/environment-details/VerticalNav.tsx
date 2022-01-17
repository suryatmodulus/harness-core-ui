/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Container, Layout } from '@wings-software/uicore'
interface VerticalNavSubComponents {
  Option: React.FC<{ id: any; name: string; component: React.FC<any> }>
}

const Option: React.FC<{ id: any; name: string; component: React.FC<any> }> = () => <></>
const VerticalNav: React.FC<{ initialTab: string; sharedProps?: any }> & VerticalNavSubComponents = ({
  initialTab,
  children: rawChildren,
  sharedProps = {}
}) => {
  const [selected, setSelected] = useState<string>(initialTab)
  const children = React.Children.toArray(rawChildren)

  const selectedChild = children.find((c: any) => c.props.id === selected) as JSX.Element
  const Comp = selectedChild.props.component

  return (
    <Layout.Horizontal height="100%" width="100%">
      <Layout.Vertical
        height="100%"
        spacing="medium"
        padding={{ top: 'xxxlarge', bottom: 'xxxlarge', left: 'xlarge', right: 'xlarge' }}
        style={{ backgroundColor: 'rgba(196,196,196,0.1)' }}
      >
        {children.map((child: any) => {
          const { id, name } = child.props
          return (
            <Button
              large
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                color: `var(--${selected === id ? 'white' : 'black'})`,
                backgroundColor: `var(--${selected === id ? 'black-100' : 'transparent'})`,
                border: 'none'
              }}
              key={id}
              onClick={() => setSelected(id)}
              text={name}
            />
          )
        })}
      </Layout.Vertical>
      <Container width="100%">
        <Comp {...sharedProps} />
      </Container>
    </Layout.Horizontal>
  )
}

VerticalNav.Option = Option

export default VerticalNav
