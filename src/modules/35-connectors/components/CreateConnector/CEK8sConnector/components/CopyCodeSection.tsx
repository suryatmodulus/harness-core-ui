import React from 'react'
import copy from 'copy-to-clipboard'
import { Container, Icon, Text } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import css from '../CEK8sConnector.module.scss'

interface CopyCodeSectionProps {
  snippet: string
}

const CopyCodeSection: React.FC<CopyCodeSectionProps> = ({ snippet }) => {
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const copyCommandToClipboard = () => {
    copy(snippet) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
  }
  return (
    <Container flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }} className={css.copyCommand}>
      <Text>{snippet}</Text>
      <Icon name="step-group" title={'copy'} onClick={copyCommandToClipboard} />
    </Container>
  )
}

export default CopyCodeSection
