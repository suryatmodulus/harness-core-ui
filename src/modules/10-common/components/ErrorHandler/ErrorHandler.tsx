/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { Color, Layout, Text, Icon, IconName, Container } from '@wings-software/uicore'
import type { ResponseMessage } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { LinkifyText } from '@common/components/LinkifyText/LinkifyText'
import css from '@common/components/ErrorHandler/ErrorHandler.module.scss'

export interface ErrorHandlerProps {
  responseMessages: ResponseMessage[]
  width?: number | string
  height?: number | string
  skipUrlsInErrorHeader?: boolean
  className?: string
}

const extractInfo = (
  responseMessages: ErrorHandlerProps['responseMessages']
): {
  error?: ResponseMessage
  explanations?: ResponseMessage[]
  hints?: ResponseMessage[]
}[] => {
  const errorObjects = []
  let explanations: ResponseMessage[] = []
  let hints: ResponseMessage[] = []
  for (const message of responseMessages) {
    if (message.level === 'ERROR') {
      errorObjects.push({
        error: message,
        explanations,
        hints
      })
      explanations = []
      hints = []
    } else if (message.code === 'HINT') {
      hints.push(message)
    } else if (message.code === 'EXPLANATION') {
      explanations.push(message)
    }
  }
  return errorObjects
}

const ErrorList: React.FC<{
  items: ResponseMessage[]
  header: string
  icon: IconName
}> = props => {
  if (!props.items.length) {
    return null
  }
  return (
    <Layout.Horizontal margin={{ bottom: 'xlarge' }}>
      <Icon name={props.icon} margin={{ right: 'small' }} />
      <Layout.Vertical className={cx(css.errorListTextContainer, css.shrink)}>
        <Text font={{ weight: 'semi-bold', size: 'small' }} color={Color.BLACK} margin={{ bottom: 'xsmall' }}>
          {props.header}
        </Text>
        {props.items.map((item, index) => (
          <Container margin={{ bottom: 'xsmall' }} key={index}>
            <LinkifyText
              content={`- ${item.message}`}
              textProps={{ color: Color.BLACK, font: { size: 'small' }, className: css.text }}
              linkStyles={cx(css.link, css.linkSmall)}
            />
          </Container>
        ))}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = props => {
  const { responseMessages, width, height, skipUrlsInErrorHeader = false, className = '' } = props
  const errorObjects = useMemo(() => extractInfo(responseMessages), [responseMessages])
  const { getString } = useStrings()
  return (
    <Layout.Vertical
      background={Color.RED_100}
      padding={{ top: 'medium', bottom: 'medium', left: 'medium', right: 'medium' }}
      className={cx(css.container, css.shrink, className)}
      width={width}
      height={height}
    >
      <Container className={css.scroll}>
        {errorObjects.map((errorObject, index) => {
          const { error = {}, explanations = [], hints = [] } = errorObject
          return (
            <Layout.Vertical key={index} className={css.shrink}>
              <Container margin={{ bottom: 'medium' }}>
                {skipUrlsInErrorHeader ? (
                  <Text font={{ weight: 'bold' }} color={Color.RED_700} className={css.text}>
                    {error.message}
                  </Text>
                ) : (
                  <LinkifyText
                    content={error.message}
                    textProps={{ font: { weight: 'bold' }, color: Color.RED_700, className: css.text }}
                    linkStyles={css.link}
                  />
                )}
              </Container>
              {<ErrorList items={explanations} header={getString('common.errorHandler.issueCouldBe')} icon={'info'} />}
              {
                <ErrorList
                  items={hints}
                  header={getString('common.errorHandler.tryTheseSuggestions')}
                  icon={'lightbulb'}
                />
              }
            </Layout.Vertical>
          )
        })}
      </Container>
    </Layout.Vertical>
  )
}
