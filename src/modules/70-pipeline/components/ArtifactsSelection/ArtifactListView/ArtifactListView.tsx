import React from 'react'
import { Layout, Text, Icon, Color, getMultiTypeFromValue, MultiTypeInputType, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { SidecarArtifactWrapper } from 'services/cd-ng'
import { ArtifactIconByType } from '../ArtifactHelper'
import type { ArtifactListViewProps, ArtifactType } from '../ArtifactInterface'
import css from '../ArtifactsSelection.module.scss'

export enum ModalViewFor {
  PRIMARY = 1,
  SIDECAR = 2
}

const ArtifactListView: React.FC<ArtifactListViewProps> = ({
  accountId,
  fetchedConnectorResponse,
  primaryArtifact,
  sideCarArtifact,
  isReadonly,
  editArtifact,
  overrideSetIdentifier,
  removePrimary,
  removeSidecar,
  addNewArtifact
}) => {
  const { getString } = useStrings()
  const { color: primaryConnectorColor } = getStatus(
    primaryArtifact?.spec?.connectorRef,
    fetchedConnectorResponse,
    accountId
  )
  const primaryConnectorName = getConnectorNameFromValue(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse)
  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }}>
        {!!(sideCarArtifact?.length || primaryArtifact?.type) && (
          <div className={cx(css.artifactList, css.listHeader)}>
            <span className={css.tableHeader}></span>
            <span className={css.tableHeader}>{getString('artifactRepository')}</span>
            <span className={css.tableHeader}> {getString('location')}</span>
            <span className={css.tableHeader}></span>
            <span className={css.tableHeader}></span>
          </div>
        )}

        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>
            {primaryArtifact && (
              <section className={cx(css.artifactList, css.rowItem)} key={'Dockerhub'}>
                <div>
                  <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                    {getString('primary')}
                  </Text>
                </div>
                <div className={css.connectorNameField}>
                  <Icon padding={{ right: 'small' }} name={ArtifactIconByType[primaryArtifact.type]} size={18} />
                  <Text className={css.connectorName} lineClamp={1}>
                    {primaryConnectorName ?? primaryArtifact.spec?.connectorRef}
                  </Text>
                  {getMultiTypeFromValue(primaryArtifact.spec?.connectorRef) === MultiTypeInputType.FIXED && (
                    <Icon name="full-circle" size={12} color={primaryConnectorColor} />
                  )}
                </div>
                <div>
                  <Text width={340} lineClamp={1} style={{ color: Color.GREY_500 }}>
                    <span className={css.noWrap}>{primaryArtifact?.spec?.imagePath}</span>
                  </Text>
                </div>
                {overrideSetIdentifier?.length === 0 && !isReadonly && (
                  <Layout.Horizontal>
                    <Button
                      icon="edit"
                      minimal
                      onClick={() => editArtifact(ModalViewFor.PRIMARY, primaryArtifact.type)}
                    />
                    <Button minimal icon="main-trash" onClick={removePrimary} />
                  </Layout.Horizontal>
                )}
              </section>
            )}
          </section>
          {sideCarArtifact && sideCarArtifact?.length > 0 && (
            <section>
              {sideCarArtifact?.map((data: SidecarArtifactWrapper, index: number) => {
                const { sidecar } = data
                const { color: sideCarConnectionColor } = getStatus(
                  sidecar?.spec?.connectorRef,
                  fetchedConnectorResponse,
                  accountId
                )
                const sidecarConnectorName = getConnectorNameFromValue(
                  sidecar?.spec?.connectorRef,
                  fetchedConnectorResponse
                )

                return (
                  <section className={cx(css.artifactList, css.rowItem)} key={`${sidecar?.identifier}-${index}`}>
                    <div>
                      <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                        {getString('sidecar')}
                        <Text lineClamp={1} className={css.artifactId}>
                          ({getString('common.ID')}: {sidecar?.identifier})
                        </Text>
                      </Text>
                    </div>

                    <div className={css.connectorNameField}>
                      <Icon
                        padding={{ right: 'small' }}
                        name={ArtifactIconByType[sidecar?.type as ArtifactType]}
                        size={18}
                      />
                      <Text className={css.connectorName} lineClamp={1}>
                        {sidecarConnectorName ?? sidecar?.spec?.connectorRef}
                      </Text>
                      {getMultiTypeFromValue(sidecar?.spec?.connectorRef) === MultiTypeInputType.FIXED && (
                        <Icon name="full-circle" size={12} color={sideCarConnectionColor} />
                      )}
                    </div>
                    <div className={css.locationField}>
                      <Text width={340} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        <span className={css.noWrap}>{sidecar?.spec?.imagePath}</span>
                      </Text>
                    </div>
                    {overrideSetIdentifier?.length === 0 && !isReadonly && (
                      <span>
                        <Layout.Horizontal>
                          <Button
                            icon="edit"
                            minimal
                            onClick={() => {
                              editArtifact(ModalViewFor.SIDECAR, sidecar?.type as ArtifactType, index)
                            }}
                          />
                          <Button icon="main-trash" minimal onClick={() => removeSidecar(index)} />
                        </Layout.Horizontal>
                      </span>
                    )}
                  </section>
                )
              })}
            </section>
          )}
        </Layout.Vertical>
      </Layout.Vertical>

      <div>
        {!primaryArtifact && overrideSetIdentifier?.length === 0 && !isReadonly && (
          <div className={css.addArtifact}>
            <Text intent="primary" onClick={() => addNewArtifact(ModalViewFor.PRIMARY)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addPrimary" />
            </Text>
          </div>
        )}
        {!overrideSetIdentifier?.length && !isReadonly && (
          <div className={css.addArtifact}>
            <Text intent="primary" onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
            </Text>
          </div>
        )}
      </div>
    </Layout.Vertical>
  )
}

export default ArtifactListView
