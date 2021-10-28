import React from 'react'
import { PageError } from '@wings-software/uicore'

const devErrorMsg = 'This app is rendered as a microfrontend. It looks like it is not reachable.'

export default function ChildAppError(): React.ReactElement {
  return <PageError message={__DEV__ ? devErrorMsg : ''} />
}
