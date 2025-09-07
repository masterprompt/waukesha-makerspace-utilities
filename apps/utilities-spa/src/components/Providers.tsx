import { composeProvider } from 'react-compose-provider';
import { ReactQueryProvider } from './ReactQueryProvider';
import MuiThemeProvider from './MuiThemeProvider';

export const Providers = composeProvider(
  ReactQueryProvider,
  MuiThemeProvider

);