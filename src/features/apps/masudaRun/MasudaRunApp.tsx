import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import DrawerLauncher from '../components/DrawerLauncher'
import MasudaRunGame from './components/MasudaRunGame'

export default function MasudaRunApp() {
  return (
    <DrawerLauncher title="増田ラン" buttonAriaLabel="増田RUNを開く" buttonIcon={<DirectionsRunIcon />}>
      <MasudaRunGame />
    </DrawerLauncher>
  )
}
