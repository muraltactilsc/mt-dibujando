import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, RadioButton, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import type { Question } from '@dibujando/shared';
import { useQuestionsQuery, useValidateAnswersMutation } from '../../api/registration.queries';
import { useRegistrationStore } from '../../state/useRegistrationStore';
import { FormErrorBanner } from '../../components/FormErrorBanner';

const TOKEN_TTL_MS = 5 * 60 * 1000;

function QuestionBlock({
  question,
  selectedAnswerId,
  onSelectAnswer,
}: {
  question: Question;
  selectedAnswerId: number | null;
  onSelectAnswer: (answerId: number) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.questionBlock}>
      <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
        <Text style={{ color: theme.colors.error }}>*</Text> {question.question}
      </Text>
      <RadioButton.Group
        value={selectedAnswerId?.toString() ?? ''}
        onValueChange={(value) => onSelectAnswer(Number(value))}
      >
        {question.answers.map((answer) => (
          <RadioButton.Item
            key={answer.answerId}
            label={answer.answer}
            value={answer.answerId.toString()}
            position="leading"
          />
        ))}
      </RadioButton.Group>
    </View>
  );
}

export default function QuestionScreen() {
  const theme = useTheme();
  const { data: questions, isLoading, error } = useQuestionsQuery();
  const validateMutation = useValidateAnswersMutation();
  const setToken = useRegistrationStore((state) => state.setToken);

  const [selections, setSelections] = useState<Record<number, number | null>>({});

  const allAnswered = useMemo(() => {
    if (!questions || questions.length === 0) {
      return false;
    }
    return questions.every((q) => selections[q.questionId] != null);
  }, [questions, selections]);

  const handleSelect = (questionId: number, answerId: number) => {
    setSelections((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = () => {
    if (!questions) {
      return;
    }

    const answerIds = questions.map((q) => selections[q.questionId] ?? 0);
    validateMutation.mutate(answerIds, {
      onSuccess: (data) => {
        if (data.passed) {
          setToken(data.registrationToken, Date.now() + TOKEN_TTL_MS);
          router.replace('/(auth)/register');
        } else {
          router.replace('/(auth)/question-fail');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.formWrapper}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Pre-Registro
        </Text>

        <FormErrorBanner message={error?.message ?? validateMutation.error?.message} />

        {questions?.map((question) => (
          <QuestionBlock
            key={question.questionId}
            question={question}
            selectedAnswerId={selections[question.questionId] ?? null}
            onSelectAnswer={(answerId) => handleSelect(question.questionId, answerId)}
          />
        ))}

        <Button
          mode="contained"
          onPress={() => {
            void handleSubmit();
          }}
          disabled={!allAnswered || validateMutation.isPending}
          loading={validateMutation.isPending}
          style={styles.submitButton}
        >
          Aceptar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
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
  questionBlock: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
