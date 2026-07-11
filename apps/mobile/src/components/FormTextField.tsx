import { TextInput } from 'react-native-paper';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface FormTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'characters';
  autoComplete?: 'email' | 'password';
  textContentType?: 'emailAddress' | 'password';
  style?: object;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  style,
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          mode="outlined"
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          error={error}
          style={style}
        />
      )}
    />
  );
}
