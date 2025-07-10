import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FeedbackProvider } from '@/context/FeedbackContext';
import Toast from '@/components/Toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <FeedbackProvider>
        <Component {...pageProps} />
        <Toast />
      </FeedbackProvider>
    </AuthProvider>
  );
}
