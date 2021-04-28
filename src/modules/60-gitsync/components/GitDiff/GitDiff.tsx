import React, { useEffect, useRef, useState } from 'react'
import { MonacoDiffEditor } from 'react-monaco-editor'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'

import { Button, Container, Intent, Layout, Text } from '@wings-software/uicore'
import { VersionSelector } from '@common/components/VersionSelector/VersionSelector'
import { BranchSelector, Branch } from '@common/components/BranchSelector/BranchSelector'
import { useConfirmationDialog } from '@common/exports'
import { useStrings } from 'framework/strings'
import { versions as mockVersions, branches as mockBranches, originalContent, modifiedContent } from './mocks/gitdata'

import css from './GitDiff.module.scss'

interface GitDiffInterface {
  repository: string
  filePath: string
  branch: Branch
  isEditMode?: boolean
  height?: React.CSSProperties['height']
  width?: React.CSSProperties['width']
  onSave: (updatedContent: string) => void
  onCancel: () => void
}

const getNewLineCount = (linesChanged: editor.ILineChange[]): number => {
  return linesChanged.filter((line: editor.ILineChange) => !line.originalEndLineNumber)?.length
}

export const GitDiff = ({
  height,
  width,
  branch,
  onSave,
  onCancel,
  isEditMode = false
}: GitDiffInterface): JSX.Element => {
  const { getString } = useStrings()
  const editorRef = useRef<MonacoDiffEditor>(null)
  const [currentContent, setCurrentContent] = useState<string>(modifiedContent)
  const [linesChangedInModifiedContent, setLinesChangedInModifiedContent] = useState<editor.ILineChange[]>([])
  const [totalLinesInModifiedContent, setTotalLinesInModifiedContent] = useState<number>(0)

  useEffect(() => {
    setTotalLinesInModifiedContent(editorRef.current?.editor?.getModifiedEditor()?.getModel()?.getLineCount() || 0)
  }, [])

  const { openDialog } = useConfirmationDialog({
    contentText: getString('gitsync.unsavedChanges'),
    titleText: getString('common.authSettings.confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: (isConfirmed: boolean) => {
      if (isConfirmed) {
        onCancel()
      }
    }
  })

  return (
    <Layout.Vertical>
      <>
        <Layout.Horizontal className={css.header}>
          <Layout.Horizontal width="50%" className={css.panel}>
            <Container padding={{ right: 'large' }}>
              <BranchSelector branches={mockBranches} currentBranch={branch} isReadOnlyMode />
            </Container>
            <VersionSelector versions={mockVersions} isReadOnlyMode />
          </Layout.Horizontal>
          <Layout.Horizontal width="50%" className={css.panel} flex>
            <Layout.Horizontal flex>
              <Container padding={{ right: 'large' }}>
                <BranchSelector branches={mockBranches} currentBranch={branch} />
              </Container>
              <VersionSelector versions={mockVersions} isEditMode={isEditMode} />
            </Layout.Horizontal>
            <Container>
              <Button minimal text={getString('cancel')} onClick={openDialog} />
              <Button intent="primary" text={getString('save')} onClick={() => onSave(currentContent)} />
            </Container>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <MonacoDiffEditor
          width={width ?? '100%'}
          height={height ?? 'calc(100% - 100px)'}
          language="javascript"
          original={originalContent}
          value={currentContent}
          options={{
            ignoreTrimWhitespace: true,
            minimap: { enabled: true },
            codeLens: true,
            renderSideBySide: true,
            lineNumbers: 'on',
            inDiffEditor: true,
            scrollBeyondLastLine: false,
            enableSplitViewResizing: false
          }}
          ref={editorRef}
          onChange={(value: string, _event: editor.IModelContentChangedEvent) => {
            setCurrentContent(value)
            const diffEditor = editorRef.current?.editor
            const linesChanged = diffEditor?.getLineChanges?.() || []
            setLinesChangedInModifiedContent(linesChanged)
            setTotalLinesInModifiedContent(diffEditor?.getModifiedEditor()?.getModel()?.getLineCount?.() || 0)
          }}
        />
      </>
      <Container className={css.footer}>
        <Text padding={{ right: 'small' }} font={{ size: 'small', mono: true }}>
          {getString('gitsync.totalLines')} {totalLinesInModifiedContent}
        </Text>
        <Text padding={{ right: 'medium' }} font={{ size: 'small', mono: true }}>
          {getString('gitsync.newLines')} {getNewLineCount(linesChangedInModifiedContent)}
        </Text>
      </Container>
    </Layout.Vertical>
  )
}
