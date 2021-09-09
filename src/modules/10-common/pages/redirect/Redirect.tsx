import React, { useEffect } from 'react'
import { identity } from 'lodash-es'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import { validateReturnUrl } from '@common/utils/routeUtils'
import { useQueryParams } from '@common/hooks'

interface RedirectQueryParams {
  returnUrl?: string
}
export default function RedirectPage(): JSX.Element {
  const { returnUrl } = useQueryParams<RedirectQueryParams>({ decoder: identity })

  useEffect(() => {
    if (!returnUrl) {
      return
    }

    if (validateReturnUrl(returnUrl)) {
      window.location.href = returnUrl
      return
    }

    window.location.href = getLoginPageURL(false)
  }, [returnUrl])

  return <div>Redirecting...</div>
}
