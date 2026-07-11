import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="question" />
      <Stack.Screen name="question-fail" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="forgot-password-confirmation" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="reset-password-confirmation" />
      <Stack.Screen name="invalid-reset-password" />
    </Stack>
  );
}
