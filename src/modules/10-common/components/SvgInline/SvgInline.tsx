import React, { useEffect, useState } from 'react'
import { Color, Text, Icon, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

interface SvgInlineProps {
  url: string
  className?: string
}

const SvgInline: React.FC<SvgInlineProps> = ({ url, className }) => {
  const [svg, setSvg] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(undefined)

  const { getString } = useStrings()

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    fetch(url)
      .then(res => res.text())
      .then(setSvg)
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))
    return () => {
      isMounted = false
    }
  }, [url])

  if (loading) {
    return <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
  }

  if (error) {
    return (
      <Layout.Horizontal spacing={'small'}>
        <Icon name="error" size={32} color={Color.RED_500} />
        <Text font={{ align: 'center' }} color={Color.RED_500}>
          {error.message || getString('somethingWentWrong')}
        </Text>
      </Layout.Horizontal>
    )
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}

export default SvgInline
