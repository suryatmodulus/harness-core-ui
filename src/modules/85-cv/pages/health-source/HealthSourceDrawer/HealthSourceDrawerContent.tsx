import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '@wings-software/uicore'
import { Drawer, Intent, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useConfirmationDialog } from '@common/exports'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DefineHealthSource from './component/defineHealthSource/DefineHealthSource'
import CustomiseHealthSource from './component/customiseHealthSource/CustomiseHealthSource'
import { createHealthSourceDrawerFormData } from './HealthSourceDrawerContent.utils'
import type { HealthSourceDrawerInterface } from './HealthSourceDrawerContent.types'
import { GCOProduct } from '../connectors/GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'
import { SelectGCODashboards } from '../connectors/GCOMetricsHealthSource/components/SelectGCODashboards/SelectGCODashboards'
import css from './HealthSourceDrawerContent.module.scss'

function HealthSourceDrawerContent({
  serviceRef,
  environmentRef,
  monitoredServiceRef,
  onSuccess,
  modalOpen,
  createHeader,
  onClose,
  isEdit,
  rowData,
  tableData,
  shouldRenderAtVerifyStep
}: HealthSourceDrawerInterface): JSX.Element {
  const { getString } = useStrings()

  const sourceData = useMemo(
    () =>
      createHealthSourceDrawerFormData({ isEdit, monitoredServiceRef, serviceRef, environmentRef, tableData, rowData }),
    [rowData, tableData, monitoredServiceRef, serviceRef, environmentRef, isEdit]
  )

  const [selectedProduct, setSelectedProduct] = useState<string | undefined>((sourceData as any).product?.value)
  const [tabTitles, ...tabs] = useMemo(() => {
    if (selectedProduct === GCOProduct.CLOUD_METRICS) {
      return [
        [
          getString('cv.healthSource.defineHealthSource'),
          getString('cv.healthSource.connectors.gco.selectDashboardTab'),
          getString('cv.healthSource.customizeHealthSource')
        ],
        <DefineHealthSource
          key="defineHealthSource"
          onSubmit={values => {
            setSelectedProduct(values.product?.value)
          }}
        />,
        <SelectGCODashboards key="selectGCODashboards" />,
        <CustomiseHealthSource
          key="customiseHealthSource"
          onSuccess={onSuccess}
          shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
        />
      ]
    }
    return [
      [getString('cv.healthSource.defineHealthSource'), getString('cv.healthSource.customizeHealthSource')],
      <DefineHealthSource key="defineHealthSource" onSubmit={values => setSelectedProduct(values.product?.value)} />,
      <CustomiseHealthSource
        key="customiseHealthSource"
        onSuccess={onSuccess}
        shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
      />
    ]
  }, [selectedProduct])

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
        isCloseButtonShown={false}
        portalClassName={'health-source-right-drawer'}
      >
        <SetupSourceTabs data={sourceData} determineMaxTab={determineMaxTabBySourceType} tabTitles={tabTitles}>
          {tabs}
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
