import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Modal, Portal, RadioButton, Text, useTheme } from 'react-native-paper';
import type { Country } from '@dibujando/shared';

interface CountryDropdownProps {
  countries: Country[] | undefined;
  isLoading: boolean;
  value: number | undefined;
  onChange: (countryId: number) => void;
  error?: { message?: string };
}

export default function CountryDropdown({
  countries,
  isLoading,
  value,
  onChange,
  error,
}: CountryDropdownProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const selectedCountry = useMemo(
    () => countries?.find((c) => c.countryId === value),
    [countries, value],
  );

  const handleSelect = (countryId: number) => {
    onChange(countryId);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Button
        mode="outlined"
        onPress={() => setVisible(true)}
        style={[styles.button, error && { borderColor: theme.colors.error }]}
      >
        {selectedCountry?.name ?? 'Selecciona un país'}
      </Button>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text
            variant="titleMedium"
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
          >
            Selecciona un país
          </Text>

          {isLoading ? (
            <HelperText type="info" visible>
              Cargando…
            </HelperText>
          ) : (
            <RadioButton.Group
              value={value?.toString() ?? ''}
              onValueChange={(selected) => handleSelect(Number(selected))}
            >
              {countries?.map((country) => (
                <RadioButton.Item
                  key={country.countryId}
                  label={country.name}
                  value={country.countryId.toString()}
                  position="leading"
                />
              ))}
            </RadioButton.Group>
          )}
        </Modal>
      </Portal>

      {error?.message && (
        <HelperText type="error" visible>
          {error.message}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  button: {
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
  },
  modal: {
    borderRadius: 8,
    margin: 24,
    padding: 16,
  },
  modalTitle: {
    marginBottom: 12,
  },
});
