export interface HealthSourceDropDownProps {
  onChange: (selectedHealthSource: string) => void
  serviceIdentifier: string
  environmentIdentifier: string
  className?: string
  verificationType?: string
}
