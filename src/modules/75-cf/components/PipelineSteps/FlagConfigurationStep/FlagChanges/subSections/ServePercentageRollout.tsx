import React, { FC } from 'react'
import SubSection, { SubSectionProps } from '../SubSection'

const ServePercentageRollout: FC<SubSectionProps> = props => (
  <SubSection data-testid="flagChanges-servePercentageRollout" {...props}>
    <p>Serve Percentage Rollout</p>
  </SubSection>
)

export default ServePercentageRollout
