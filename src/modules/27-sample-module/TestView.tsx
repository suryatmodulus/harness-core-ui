import React from 'react'
import { RemoteTestView, SampleModuleRemoteComponentMounter } from './SampleModuleApp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TestView: React.FC<Record<string, any>> = props => (
  <SampleModuleRemoteComponentMounter component={<RemoteTestView {...props} />} />
)
