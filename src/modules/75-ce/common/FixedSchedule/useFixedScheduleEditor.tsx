import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import type { FixedScheduleClient } from '@ce/components/COCreateGateway/models'
import FixedScheduleDialog from './FixedScheduleDialog'
import FixedScheduleForm from './FixedScheduleForm'

interface UseFixedScheduleEditorProps {
  schedule?: FixedScheduleClient
  addSchedule: (schedule: FixedScheduleClient) => void
  isEdit?: boolean
  allCreatedSchedules: FixedScheduleClient[]
}

const useFixedScheduleEditor = (props: UseFixedScheduleEditorProps) => {
  const onAddition = (schedule: FixedScheduleClient) => {
    props.addSchedule(schedule)
    closeModal()
  }

  const [openModal, closeModal] = useModalHook(
    () => (
      <FixedScheduleDialog onClose={closeModal}>
        <FixedScheduleForm
          schedule={props.schedule}
          closeDialog={closeModal}
          addSchedule={onAddition}
          isEdit={props.isEdit}
          allSchedules={props.allCreatedSchedules}
        />
      </FixedScheduleDialog>
    ),
    [props.schedule, props.addSchedule]
  )

  return {
    openEditor: openModal
  }
}

export default useFixedScheduleEditor
