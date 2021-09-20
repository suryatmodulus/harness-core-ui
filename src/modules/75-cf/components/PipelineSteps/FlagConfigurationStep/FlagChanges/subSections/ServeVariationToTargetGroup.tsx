import React, { FC } from 'react'
import SubSection, { SubSectionProps } from '../SubSection'

const ServeVariationToTargetGroup: FC<SubSectionProps> = props => (
  <SubSection data-testid="flagChanges-serveVariationToTargetGroup" {...props}>
    <p>Serve Variation To Target Group</p>
  </SubSection>
)

export default ServeVariationToTargetGroup
