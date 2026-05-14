import { LazyMotion, domAnimation } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LazyMotion features={domAnimation}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className:
                '!bg-wg-surface-elevated !text-wg-text !text-sm !font-medium !shadow-wg-card !border !border-wg-border !rounded-xl !px-4 !py-3',
            }}
          />
          <AppRoutes />
        </LazyMotion>
      </AuthProvider>
    </ThemeProvider>
  );
}
