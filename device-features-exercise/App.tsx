import { StatusBar } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './context/Navigation';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar />
      <AppNavigator />
    </ThemeProvider>
  );
}