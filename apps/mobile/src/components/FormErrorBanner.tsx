import { HelperText } from 'react-native-paper';

interface FormErrorBannerProps {
  message: string | null | undefined;
}

export function FormErrorBanner({ message }: FormErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <HelperText type="error" visible style={{ alignSelf: 'stretch', marginBottom: 16 }}>
      {message}
    </HelperText>
  );
}
