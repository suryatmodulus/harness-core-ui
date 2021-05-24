import React from 'react'
import { Container, Color, Text, Icon } from '@wings-software/uicore'
import copy from 'copy-to-clipboard'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import css from './BuildTests.module.scss'

interface TestsCoverageItemProps {
  data: any
}

export const TestsCoverageItem: React.FC<TestsCoverageItemProps> = ({ data }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()

  const copy2Clipboard = (text: string): void => {
    copy(`${text}`) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
  }

  return (
    <Container className={css.coverageItem} flex padding="medium">
      <Text className={css.name} font={{ weight: 'semi-bold' }} lineClamp={1} color={Color.GREY_800}>
        {data.name}
      </Text>
      <Container flex>
        {data.coverage === 'passed' ? (
          <Icon name="command-artifact-check" color={Color.GREEN_600} margin={{ right: 'large' }} />
        ) : (
          <Icon name="main-delete" color={Color.GREY_400} margin={{ right: 'large' }} />
        )}
        <Container
          className={css.commitHash}
          flex={{ justifyContent: 'flex-start' }}
          onClick={() => copy2Clipboard(data.commitId)}
        >
          <Icon size={12} name="clipboard" color={Color.GREY_500} />
          <Text inline>{data.commitId}</Text>
        </Container>
      </Container>
    </Container>
  )
}
