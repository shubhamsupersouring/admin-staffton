import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';

import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </BrowserRouter>
    </Provider>
  );
}
