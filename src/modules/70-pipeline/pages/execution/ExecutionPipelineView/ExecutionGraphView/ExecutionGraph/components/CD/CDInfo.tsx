import React from 'react'
import { get } from 'lodash-es'
import classNames from 'classnames'
import { Icon } from '@wings-software/uicore'
import { String } from 'framework/exports'
import BarrierStageTooltip from './BarrierStageTooltip'
import css from '../components.module.scss'
export interface CDInfoProps {
  data?: any
  barrier?: {
    barrierInfoLoading?: boolean
    barrierData?: any
  }
}

export default function CDInfo(props: CDInfoProps): React.ReactElement {
  const { data, barrier } = props
  const artifacts = get(data, 'data.moduleInfo.cd.serviceInfo.artifacts.sidecars', []).map(
    (artifact: any) => artifact.imagePath
  )
  const primaryArtifact = get(data, 'data.moduleInfo.cd.serviceInfo.artifacts.primary.imagePath', '')
  if (primaryArtifact.length > 0) {
    artifacts.push(primaryArtifact)
  }
  const serviceName = get(data, 'data.moduleInfo.cd.serviceInfo.displayName', null)
  const environment = get(data, 'data.moduleInfo.cd.infraExecutionSummary.name', null)
  const whenCondition = get(data, 'data.whenCondition', null)

  return (
    <div>
      {barrier?.barrierData?.data && data.status === 'Running' && (
        <div className={classNames(css.section)}>
          <BarrierStageTooltip
            loading={!!barrier.barrierInfoLoading}
            stageName={data.name}
            data={barrier.barrierData?.data}
          />
        </div>
      )}
      {whenCondition && (
        <div className={classNames(css.section, css.sectionGrid, css.borderSectionEnd)}>
          <Icon name="conditional-when" size={24} />
          <div>
            <String stringID="whenCondition" className={css.sectionHeading} />
            <div className={css.sectionData} data-testid="hovercard-when-condition">
              {whenCondition}
            </div>
          </div>
        </div>
      )}
      {serviceName && (
        <div className={classNames(css.section, css.sectionGrid)}>
          <div></div>
          <div>
            <String stringID="serviceOrServices" className={css.sectionHeading} />
            <div className={css.sectionData} data-testid="hovercard-service">
              {serviceName}
            </div>
          </div>
        </div>
      )}
      {artifacts.length > 0 && (
        <div className={classNames(css.section, css.sectionGrid)}>
          <div></div>
          <div>
            <String stringID="artifactOrArtifacts" className={css.sectionHeading} />
            <div className={css.sectionData} data-testid="hovercard-artifact">
              {artifacts.map((imagePath: string, index: number) => (
                <div key={`${imagePath}+${index}`}>{imagePath}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      {environment && (
        <div className={classNames(css.section, css.sectionGrid)}>
          <div></div>
          <div>
            <String stringID="environmentOrEnvironments" className={css.sectionHeading} />
            <div className={css.sectionData} data-testid="hovercard-environment">
              {environment}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
