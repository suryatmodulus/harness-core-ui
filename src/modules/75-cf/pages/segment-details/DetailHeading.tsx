import { Heading } from '@wings-software/uicore'
import React from 'react'

export const DetailHeading: React.FC<React.ComponentProps<typeof Heading>> = ({ children, style, ...props }) => (
  <Heading
    level={3}
    style={{ fontSize: '14px', color: '#22272D', fontWeight: 600, ...style }}
    padding="xxlarge"
    {...props}
  >
    {children}
  </Heading>
)
