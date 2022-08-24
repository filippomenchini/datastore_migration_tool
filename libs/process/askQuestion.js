import promptSync from "prompt-sync";

const prompt = promptSync({sigint: true});

function askQuestion(question, defaultValue) {
    const answer = prompt(question, defaultValue);
    return answer.toLowerCase();
}

export { askQuestion };