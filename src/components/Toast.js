import { useFeedback } from '@/context/FeedbackContext';

export default function Toast() {
  const { message } = useFeedback();

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
    </div>
  );
}