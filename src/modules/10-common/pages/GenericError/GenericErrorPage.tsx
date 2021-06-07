import React from 'react'
import { Container, Text, Icon, Layout } from '@wings-software/uicore'
import { useParams, Link } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface GenericErrorPageQueryParams {
  code: string
  message?: string
}

type ErrorProps = GenericErrorPageQueryParams

const Error: React.FC<ErrorProps> = ({ code, message }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  switch (code) {
    case 'INVITE_EXPIRED':
      return (
        <>
          <Text>{getString('generic_errors.INVITE_EXPIRED')}</Text>
          <Link to={routes.toHome({ accountId })}>{getString('goToHome')}</Link>
          <Icon name="harness-logo-black" size={200} />
        </>
      )
    default:
      return <Container>{message}</Container>
  }
}

const GenericErrorPage: React.FC = () => {
  const { code, message } = useQueryParams<GenericErrorPageQueryParams>()

  return (
    <Container height="100%" flex={{ align: 'center-center' }}>
      <Layout.Vertical spacing="large" flex={{ align: 'center-center' }}>
        <Error code={code} message={message} />
      </Layout.Vertical>
    </Container>
  )
}

export default GenericErrorPage
