export interface UseDrawerInterface {
  showDrawer: () => void
  hideDrawer: () => void
  setDrawerContentProps: React.Dispatch<React.SetStateAction<any>>
}

export interface UseDrawerPropsInterface {
  createHeader: () => JSX.Element
  createDrawerContent: (props: any) => JSX.Element
}
