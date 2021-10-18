import React from 'react'
import { PageError } from '@common/components/Page/PageError'

const devErrorMsg = 'This app is rendered as a microfrontends. It looks like it is not reachable.'

export default function ChildAppError(): React.ReactElement {
  return <PageError message={__DEV__ ? devErrorMsg : ''} />
}
