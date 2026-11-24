import { useCheckAuth } from '@/features/auth/hooks/useAuth'
import { AppRouter } from '@/routes/AppRouter'

function App() {
  // Confirma contra el backend si la cookie de sesión sigue siendo válida
  // (ver store/authStore.ts: la sesión real vive en la cookie, no en el store).
  useCheckAuth()
  return <AppRouter />
}

export default App
