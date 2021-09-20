import React, { FC } from 'react'
import SubSection, { SubSectionProps } from '../SubSection'

const ServeVariationToIndividualTarget: FC<SubSectionProps> = props => (
  <SubSection data-testid="flagChanges-serveVariationToIndividualTarget" {...props}>
    <p>Serve Variation To Individual Target</p>
  </SubSection>
)

export default ServeVariationToIndividualTarget
