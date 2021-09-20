import React, { FC } from 'react'
import SubSection, { SubSectionProps } from '../SubSection'

const DefaultRules: FC<SubSectionProps> = props => (
  <SubSection data-testid="flagChanges-defaultRules" {...props}>
    <p>Default Rules</p>
  </SubSection>
)

export default DefaultRules
