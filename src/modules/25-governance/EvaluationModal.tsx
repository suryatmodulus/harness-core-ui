import React from 'react'
import { RemoteEvaluationModal, GovernanceRemoteComponentMounter } from './GovernanceApp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EvaluationModal: React.FC<Record<string, any>> = props => (
  <GovernanceRemoteComponentMounter component={<RemoteEvaluationModal {...props} />} />
)
