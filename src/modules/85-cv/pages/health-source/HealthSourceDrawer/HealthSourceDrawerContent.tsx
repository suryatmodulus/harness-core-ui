import React, { useCallback, useMemo } from 'react'
import { SelectOption, Button } from '@wings-software/uicore'
import { Drawer, Intent, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useConfirmationDialog } from '@common/exports'
import type { AppDynamicsHealthSourceSpec, HealthSource, MonitoredServiceResponse } from 'services/cv'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DefineHealthSource from './component/defineHealthSource/DefineHealthSource'
import CustomiseHealthSource from './component/customiseHealthSource/CustomiseHealthSource'
import { createHealthSourceDrawerFormData } from './HealthSourceDrawerContent.utils'
import type { GCOLogsHealthSourceSpec } from '../connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/types'
import type { HealthSourceTypes } from '../types'
import css from './HealthSourceDrawerContent.module.scss'

export interface updatedHealthSource extends HealthSource {
  identifier: string
  name: string
  spec: AppDynamicsHealthSourceSpec | GCOLogsHealthSourceSpec
  type?: 'AppDynamics' | HealthSourceTypes.StackdriverLog
  service?: string
  environment?: string
  serviceRef?: string
  environmentRef?: string
}
export interface HealthSourceDrawerInterface {
  rowData: updatedHealthSource | null
  tableData: Array<updatedHealthSource>
  serviceRef: SelectOption | undefined
  environmentRef: SelectOption | undefined
  monitoringSourcRef: { monitoredServiceIdentifier: string; monitoredServiceName: string }
  onSuccess: (data: MonitoredServiceResponse) => void
  modalOpen: boolean
  createHeader: () => JSX.Element
  onClose: (val: any) => void
  isEdit: boolean
}

function HealthSourceDrawerContent({
  serviceRef,
  environmentRef,
  monitoringSourcRef,
  onSuccess,
  modalOpen,
  createHeader,
  onClose,
  isEdit,
  rowData,
  tableData
}: HealthSourceDrawerInterface): JSX.Element {
  const { getString } = useStrings()

  const sourceData = useMemo(
    () => createHealthSourceDrawerFormData(rowData, isEdit, monitoringSourcRef, serviceRef, environmentRef, tableData),
    [rowData, tableData, monitoringSourcRef, serviceRef, environmentRef]
  )

  const determineMaxTabBySourceType = useCallback(() => {
    return isEdit ? 1 : 0
  }, [isEdit])

  const { openDialog: showWarning } = useConfirmationDialog({
    intent: Intent.WARNING,
    contentText: getString('common.unsavedChanges'),
    titleText: getString('common.confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: (isConfirmed: boolean) => isConfirmed && onClose(null)
  })

  return (
    <>
      <Drawer
        onClose={showWarning}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        hasBackdrop={true}
        size={'calc(100% - 270px - 60px)'}
        isOpen={modalOpen}
        position={Position.RIGHT}
        title={createHeader()}
        data-type={'new'}
        isCloseButtonShown={false}
        portalClassName={'health-source-right-drawer'}
      >
        <SetupSourceTabs
          data={sourceData}
          determineMaxTab={determineMaxTabBySourceType}
          tabTitles={[
            getString('cv.healthSource.defineHealthSource'),
            getString('cv.healthSource.customizeHealthSource')
          ]}
        >
          <DefineHealthSource />
          <CustomiseHealthSource onSuccess={onSuccess} />
        </SetupSourceTabs>
      </Drawer>
      {modalOpen && (
        <Button
          minimal
          className={css.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            onClose(null)
          }}
        />
      )}
    </>
  )
}

export default HealthSourceDrawerContent
