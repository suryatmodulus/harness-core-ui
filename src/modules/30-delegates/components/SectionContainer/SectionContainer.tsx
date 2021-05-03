import React, { ReactNode } from 'react'
import cx from 'classnames'
import { Container, Text, TextProps } from '@wings-software/uicore'
import type { ContainerProps } from '@wings-software/uicore/dist/components/Container/Container'
import css from './SectionContainer.module.scss'

export const SectionContainer: React.FC<ContainerProps> = ({ children, style, ...props }) => {
  return (
    <Container
      padding="xlarge"
      style={{
        background: 'var(--white)',
        boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.08), 0px 0.5px 2px rgba(96, 97, 112, 0.16)',
        borderRadius: '4px',
        ...style
      }}
      {...props}
    >
      {children}
    </Container>
  )
}

export const SectionContainerTitle: React.FC<TextProps> = ({ children, style, ...props }) => {
  return (
    <Text
      font={{ size: 'medium', weight: 'bold' }}
      style={{ color: '#22272D', paddingBottom: 'var(--spacing-medium)', ...style }}
      {...props}
    >
      {children}
    </Text>
  )
}

interface SectionLabelValuePairProps {
  label: string
  value: string | ReactNode
  ignoreLastElementStyling?: boolean
}

export const SectionLabelValuePair: React.FC<SectionLabelValuePairProps & ContainerProps> = ({
  label,
  value,
  className,
  ignoreLastElementStyling,
  ...props
}) => {
  return (
    <Container className={cx(css.entry, className, ignoreLastElementStyling && css.ignoreLast)} {...props}>
      <Text
        style={{
          fontSize: '12px',
          lineHeight: '16px',
          color: 'var(--grey-450)',
          letterSpacing: '0.2px',
          paddingBottom: 'var(--spacing-xsmall)'
        }}
      >
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text style={{ fontSize: '14px', lineHeight: '24px', color: '#22272D', letterSpacing: '-0.01px' }}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Container>
  )
}
