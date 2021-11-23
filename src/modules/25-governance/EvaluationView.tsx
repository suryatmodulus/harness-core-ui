import React from 'react'
import { RemoteEvaluationView, GovernanceRemoteComponentMounter } from './GovernanceApp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EvaluationView: React.FC<Record<string, any>> = props => (
  <GovernanceRemoteComponentMounter component={<RemoteEvaluationView {...props} />} />
)
