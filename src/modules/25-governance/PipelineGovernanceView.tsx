import React from 'react'
import { RemotePipelineGovernanceView, GovernanceRemoteComponentMounter } from './GovernanceApp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PipelineGovernanceView: React.FC<Record<string, any>> = props => (
  <GovernanceRemoteComponentMounter component={<RemotePipelineGovernanceView {...props} />} />
)
