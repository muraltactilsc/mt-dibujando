import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useResetPasswordValidateQuery } from '../../api/password-reset.queries';
import InvalidResetPasswordScreen from './InvalidResetPasswordScreen';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const resetCode = code?.trim();
  const { data, isLoading, isError } = useResetPasswordValidateQuery(resetCode);

  if (!resetCode || isError || data?.valid === false) {
    return <InvalidResetPasswordScreen />;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <ResetPasswordForm resetCode={resetCode} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
});
