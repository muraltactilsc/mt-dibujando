import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function QuestionFailScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.formWrapper}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Estimado participante:
        </Text>

        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onBackground }]}>
          Agradecemos su tiempo e interés en nuestra organización. Fundación Dibujando un Mañana,
          A.C. tiene como propósito contribuir a que las niñas, niños, adolescentes y jóvenes en
          situación vulnerable ejerzan sus derechos para mejorar su calidad de vida. Esto lo hacemos
          a través de la profesionalización continua de organizaciones de la sociedad civil, para
          que estas sean más eficaces y sostenibles en el tiempo. Detectamos en su registro que no
          cuenta con los requisitos mínimos necesarios que Fundación Dibujando un Mañana solicita a
          las organizaciones para poder desarrollar una alianza entre nuestras organizaciones.
        </Text>

        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onBackground }]}>
          Para mayor información consulte nuestras{' '}
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={() => {
              void Linking.openURL('https://dibujando.org.mx/osc/');
            }}
          >
            Preguntas Frecuentes
          </Text>
          .
        </Text>

        <Button
          mode="contained"
          onPress={() => router.replace('/login')}
          style={styles.submitButton}
        >
          Iniciar Sesión
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formWrapper: {
    alignSelf: 'center',
    maxWidth: 480,
    width: '100%',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  paragraph: {
    marginBottom: 16,
    textAlign: 'justify',
  },
  link: {
    textDecorationLine: 'underline',
  },
  submitButton: {
    marginTop: 8,
  },
});
