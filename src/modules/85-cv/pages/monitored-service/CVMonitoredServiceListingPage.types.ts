export interface FilterEnvInterface {
  searchTerm?: string
  environmentIdentifier?: string
}

export interface ContextMenuActionsProps {
  onEdit?(): void
  onDelete?(): void
  titleText: string
  contentText: string | JSX.Element
  confirmButtonText?: string
  deleteLabel?: string
  editLabel?: string
}
