// Utility function to calculate quiz score
export const calculateQuizScore = (questions, userAnswers) => {
    let correctCount = 0;

    questions.forEach((question, index) => {
        if (question.type === 'multiple-choice') {
            if (userAnswers[index] === question.correctAnswer) {
                correctCount++;
            }
        } else if (question.type === 'connect') {
            const userAnswer = userAnswers[index];
            const allCorrect = question.pairs.every(
                (pair) => userAnswer?.[pair.left] === pair.right
            );
            if (allCorrect) correctCount++;
        }
    });

    return correctCount;
};
