import React from 'react'
import { Icon, Layout, Text, Utils } from '@wings-software/uicore'
import { Intent, PopoverPosition } from '@blueprintjs/core'
import type { FormikErrors } from 'formik'
import cx from 'classnames'
import { getErrorsList } from '@pipeline/components/PipelineStudio/StepUtil'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import css from './ErrorsStrip.module.scss'

interface ErrorStripProps {
  formErrors: FormikErrors<unknown>
}

export function ErrorsStrip(props: ErrorStripProps): React.ReactElement {
  const { errorStrings, errorCount } = getErrorsList(props.formErrors)
  const { getString } = useStrings()

  const tabList = document.getElementsByClassName('bp3-tab-list')
  const [stickyErrors, setStickyErrors] = React.useState(false)

  function handleIntersection(entries: IntersectionObserverEntry[]): void {
    const [entry] = entries
    setStickyErrors(!entry.isIntersecting)
  }

  React.useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    }

    const observer = new IntersectionObserver(handleIntersection, options)
    if (tabList[0]) observer.observe(tabList[0])

    return () => {
      if (tabList[0]) observer.unobserve(tabList[0])
    }
  }, [tabList])

  if (!errorCount) {
    return <></>
  }

  return (
    <Layout.Horizontal className={cx(css.errorHeader, { [css.sticky]: stickyErrors })}>
      <Icon name="warning-sign" intent={Intent.DANGER} margin={{ right: 'small' }} />
      <Text intent="danger">{getString('common.errorCount' as keyof StringsMap, { count: errorCount })}</Text>
      <Utils.WrapOptionalTooltip
        tooltip={
          <div className={css.runPipelineErrorDesc}>
            {errorStrings.map((errorMessage, index) => (
              <Text intent="danger" key={index} font={{ weight: 'semi-bold' }} className={css.runPipelineErrorLine}>
                {errorMessage}
              </Text>
            ))}
          </div>
        }
        tooltipProps={{
          position: PopoverPosition.BOTTOM,
          inheritDarkTheme: true,
          popoverClassName: css.runPipelineErrorPopover
        }}
      >
        <Text font={{ size: 'small' }} margin={{ left: 'small' }}>
          {getString('common.seeDetails')}
        </Text>
      </Utils.WrapOptionalTooltip>
    </Layout.Horizontal>
  )
}
