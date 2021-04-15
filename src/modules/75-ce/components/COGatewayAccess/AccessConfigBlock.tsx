import React from 'react'
import { Container, Icon, Text } from '@wings-software/uicore'

interface AccessConfigBlockProps {
  title: string
}
const AccessConfigBlock: React.FC<AccessConfigBlockProps> = props => {
  return (
    <Container style={{ width: '706px', backgroundColor: '#FBFBFB', height: '42px', padding: '15px', margin: '15px' }}>
      <span>
        <Text>
          {props.title}
          <Icon name="plus" style={{ float: 'right', color: ' var(--color-blue)' }}></Icon>
        </Text>
      </span>
    </Container>
  )
}

export default AccessConfigBlock
