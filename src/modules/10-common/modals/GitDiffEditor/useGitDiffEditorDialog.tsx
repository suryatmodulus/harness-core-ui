import React, { useState } from 'react'
import { useParams } from 'react-router'
import { omit } from 'lodash-es'
import { parse } from 'yaml'
import {
  useModalHook,
  Button,
  Layout,
  Icon,
  Text,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import { GitDiffEditor } from '@common/components/GitDiffEditor/GitDiffEditor'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { EntityGitDetails, useGetFileContent } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { sanitize } from '@common/utils/JSONUtils'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import css from './useGitDiffEditorDialog.module.scss'

export interface UseGitDiffEditorDialogProps<T> {
  onSuccess: (payload: T, objectId: EntityGitDetails['objectId'], gitDetails?: SaveToGitFormInterface) => void
  onClose: () => void
}

export interface UseGitDiffEditorDialogReturn<T> {
  openGitDiffDialog: (entity: T, gitDetails?: SaveToGitFormInterface, _modalProps?: IDialogProps) => void
  hideGitDiffDialog: () => void
}

const FORMATTING_OPTIONS = {
  indent: 4,
  sortMapEntries: (a: any, b: any) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0)
}

export function useGitDiffEditorDialog<T>(props: UseGitDiffEditorDialogProps<T>): UseGitDiffEditorDialogReturn<T> {
  const { onSuccess, onClose } = props
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const [entityAsYaml, setEntityAsYaml] = useState<string>()
  const [gitDetails, setGitDetails] = useState<SaveToGitFormInterface>()
  const [showGitDiff, setShowGitDiff] = useState<boolean>(false)
  const [remoteVersion, setRemoteVersion] = useState<string>('')
  const defaultModalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      minWidth: 500,
      minHeight: 170,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  }
  const [modalProps, setModalProps] = useState<IDialogProps>(defaultModalProps)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
  const {
    data,
    loading,
    refetch: fetchRemoteFileContent,
    error
  } = useGetFileContent({
    queryParams: {
      ...commonParams,
      yamlGitConfigIdentifier: '',
      filePath: '',
      branch: ''
    },
    lazy: true
  })

  React.useEffect(() => {
    try {
      if (data?.data?.content) {
        setRemoteVersion(yamlStringify(sanitize(parse(data.data.content)), FORMATTING_OPTIONS))
      }
    } catch (e) {
      //ignore error
    }
  }, [data?.data?.content])

  React.useEffect(() => {
    if (showGitDiff) {
      const { isOpen, style } = defaultModalProps
      const expandedModalProps: IDialogProps = {
        isOpen,
        enforceFocus: false,
        style: Object.assign(omit(style, 'minHeight'), { width: 'calc(100vw - 100px)', height: 'calc(100vh - 100px)' })
      }
      setModalProps(expandedModalProps)
      if (error?.message) {
        modalErrorHandler?.showDanger(error.message || '')
      }
    }
  }, [showGitDiff, error?.message])

  const [showModal, hideModal] = useModalHook(() => {
    const closeHandler = (): void => {
      onClose()
      hideModal()
      setShowGitDiff(false)
      setModalProps(defaultModalProps)
    }
    return (
      <Dialog {...modalProps}>
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} className={css.crossIcon} onClick={closeHandler} />
        {!error && loading ? (
          <PageSpinner />
        ) : showGitDiff ? (
          <GitDiffEditor
            remote={{ branch: gitDetails?.branch || '', content: remoteVersion }}
            local={{ branch: getString('common.local'), content: entityAsYaml || '' }}
            onSave={_data => {
              try {
                onSuccess(parse(_data) as T, data?.data?.objectId, gitDetails)
                hideModal()
              } catch (e) {
                //ignore e
              }
            }}
            onCancel={closeHandler}
            width={'calc(100vw - 100px)'}
            height={error ? 'calc(100vh - 265px)' : 'calc(100vh - 210px)'}
          />
        ) : (
          <Layout.Horizontal padding={{ top: 'xlarge', left: 'xxlarge' }} spacing="large">
            <Layout.Vertical>
              <Icon name="cross" size={25} className={css.error} padding="medium" />
            </Layout.Vertical>
            <Layout.Vertical padding={{ left: 'medium' }}>
              <Text style={{ fontWeight: 'bold' }} padding={{ bottom: 'medium' }}>
                {getString('common.newVersion')}
              </Text>
              <Text>{getString('common.confictOccured', { name: 'Someone' })}</Text>
              <Text padding={{ bottom: 'large' }}>{getString('common.resolveConflict')}</Text>
              <Button
                intent="primary"
                text={getString('common.seeWhatChanged')}
                onClick={() => setShowGitDiff(true)}
                width="fit-content"
                padding={{ left: 'small' }}
              />
            </Layout.Vertical>
          </Layout.Horizontal>
        )}
      </Dialog>
    )
  }, [showGitDiff, modalProps, remoteVersion])
  return {
    openGitDiffDialog: (_entity: T, _gitDetails?: SaveToGitFormInterface, _modalProps?: IDialogProps) => {
      const { repoIdentifier = '', filePath = '', rootFolder = '', branch = '' } = _gitDetails || {}
      fetchRemoteFileContent({
        queryParams: {
          ...commonParams,
          yamlGitConfigIdentifier: repoIdentifier,
          filePath: rootFolder?.concat(filePath) || '',
          branch
        }
      })
      try {
        setEntityAsYaml(yamlStringify(sanitize(_entity), FORMATTING_OPTIONS))
      } catch (e) {
        //ignore error
      }
      setGitDetails(_gitDetails)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideGitDiffDialog: () => {
      hideModal()
      setShowGitDiff(false)
      setModalProps(defaultModalProps)
    }
  }
}
