import React, { useState } from 'react'
import { get } from 'lodash-es'
import { useToaster } from '@common/exports'
import { CreateTargetQueryParams, useCreateTarget } from 'services/cf'
import CreateTargetModal, { TargetData } from './CreateTargetModal'

export interface NewTargetsProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier?: string
  onCreated: () => void
}

type SettledTarget = {
  status: 'fulffiled' | 'rejected'
  data: TargetData
}

export const NewTargets: React.FC<NewTargetsProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  environmentIdentifier,
  onCreated
}) => {
  const { showError, clear } = useToaster()
  const [loadingBulk, setLoadingBulk] = useState<boolean>(false)
  const { mutate: createTarget, loading: loadingCreateTarget } = useCreateTarget({
    queryParams: { account: accountId, accountIdentifier: accountId, org: orgIdentifier } as CreateTargetQueryParams
  })

  const bulkTargetCreation = (ts: TargetData[]): Promise<SettledTarget[]> => {
    return Promise.all(
      ts.map((t: TargetData) => {
        return createTarget({
          identifier: t.identifier,
          name: t.name,
          anonymous: false,
          attributes: {},
          environment: environmentIdentifier as string,
          project: projectIdentifier,
          account: accountId,
          org: orgIdentifier
        })
          .then(() => ({
            status: 'fulfilled',
            data: t
          }))
          .catch(error => ({
            status: 'rejected',
            data: t,
            error
          })) as Promise<SettledTarget>
      })
    )
  }

  const handleTargetCreation = (ts: TargetData[], hideModal: () => void): void => {
    setLoadingBulk(true)
    bulkTargetCreation(ts)
      .then(results => {
        if (results.every(res => res.status === 'rejected')) {
          return Promise.reject(results)
        }
        results
          .filter(res => res.status === 'rejected')
          .forEach((res: SettledTarget) => {
            clear()
            showError(get(res, 'error.data.message', get(res, 'error.message')), 0)
          })
      })
      .then(() => {
        hideModal()
        onCreated()
      })
      .catch(results => {
        results.forEach((res: SettledTarget) => {
          clear()
          showError(get(res, 'error.data.message', get(res, 'error.message')), 0)
        })
      })
      .finally(() => setLoadingBulk(false))
  }

  const handleTargetUpload = (file: File, hideModal: () => void): void => {
    file
      .text()
      .then((str: string) => {
        return str
          .split(/\r?\n/)
          .map(row => row.split(',').map(x => x.trim()))
          .map(([name, identifier]) => ({ name, identifier } as TargetData))
      })
      .then((ts: TargetData[]) => handleTargetCreation(ts, hideModal))
  }

  return (
    <CreateTargetModal
      loading={loadingCreateTarget || loadingBulk}
      onSubmitTargets={handleTargetCreation}
      onSubmitUpload={handleTargetUpload}
    />
  )
}
