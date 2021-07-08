import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
// import { getLoginPageURL } from 'framework/utils/SessionUtils'
import { validateReturnUrl } from '@common/utils/routeUtils'
import { useQueryParams } from '@common/hooks'

interface RedirectQueryParams {
  returnUrl: string
}
export default function RedirectPage(): JSX.Element {
  const { returnUrl } = useQueryParams<RedirectQueryParams>()
  const history = useHistory()

  useEffect(() => {
    if (validateReturnUrl(returnUrl)) {
      window.location.href = returnUrl
    } else {
      history.push('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <div>Redirecting...</div>
}
