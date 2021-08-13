import React from 'react'
import { String } from 'framework/strings'
import type { ServiceExecutionSummary } from 'services/cd-ng'
import css from '@cd/components/ServicePopoverCard/ServicePopoverCard.module.scss'

export interface ServicePopoveCardProps {
  service: ServiceExecutionSummary
}

export function ServicePopoverCard(props: ServicePopoveCardProps): React.ReactElement {
  const { service } = props

  return (
    <div className={css.main}>
      <String tagName="div" className={css.title} stringID="primaryArtifactText" />
      {service?.artifacts?.primary ? (
        <String
          tagName="div"
          stringID="artifactDisplay"
          useRichText
          vars={{
            image: (service.artifacts.primary as unknown as any).imagePath,
            tag: (service.artifacts.primary as unknown as any).tag
          }}
        />
      ) : (
        <String tagName="div" stringID="noArtifact" />
      )}
      {service?.artifacts?.sidecars && service.artifacts.sidecars.length > 0 ? (
        <>
          <String tagName="div" className={css.title} stringID="sidecarsText" />
          {service.artifacts.sidecars.map((artifact, index) => (
            <String
              tagName="div"
              key={index}
              stringID="artifactDisplay"
              useRichText
              vars={{
                image: (artifact as unknown as any).imagePath,
                tag: (artifact as unknown as any).tag
              }}
            />
          ))}
        </>
      ) : null}
    </div>
  )
}
