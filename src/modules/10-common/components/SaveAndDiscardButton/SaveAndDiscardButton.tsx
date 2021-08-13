import React from 'react'
import { Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './SaveAndDiscardButton.module.scss'

interface SaveAndDiscardButtonInterface {
  isUpdated: boolean
  onSave: (data: any) => void | Promise<void>
  onDiscard: () => void
}

export default function SaveAndDiscardButton({
  isUpdated,
  onSave,
  onDiscard
}: SaveAndDiscardButtonInterface): JSX.Element {
  const { getString } = useStrings()
  return (
    <>
      <div className={css.saveHeader}>
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
