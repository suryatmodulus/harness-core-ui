import React from 'react'
import { Button } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './SaveAndDiscardButton.module.scss'

interface SaveAndDiscardButtonInterface {
  isUpdated: boolean
  onSave: (data: any) => void | Promise<void>
  onDiscard: () => void
  className?: string
}

export default function SaveAndDiscardButton({
  isUpdated,
  onSave,
  onDiscard,
  className
}: SaveAndDiscardButtonInterface): JSX.Element {
  const { getString } = useStrings()
  return (
    <>
      <div className={cx(css.saveHeader, className)}>
        {isUpdated && <div className={css.tagRender}>{getString('unsavedChanges')}</div>}
        <Button
          intent="primary"
          text={getString('save')}
          onClick={onSave}
          icon="send-data"
          className={css.saveButton}
        />
        <Button
          disabled={!isUpdated}
          onClick={onDiscard}
          className={css.discardBtn}
          text={getString('common.discard')}
        />
      </div>
    </>
  )
}
