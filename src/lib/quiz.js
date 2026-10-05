export function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,?!;:]/g,'').replace(/\s+/g,' ').trim();
}
export function createSession(questions) {
  return { queue: questions.map(q => q.id), mastered: [], attempts: 0, mistakes: 0, score: 0, feedback: null };
}
export function answerSession(session, question, answer) {
  if (session.feedback || session.queue[0] !== question.id) return session;
  const correct = question.answers.some(a => normalize(a) === normalize(answer));
  return { ...session, attempts: session.attempts + 1, mistakes: session.mistakes + (correct ? 0 : 1), score: session.score + (correct ? 10 : 0), mastered: correct ? [...session.mastered, question.id] : session.mastered, feedback: { correct, answer } };
}
export function advanceSession(session) {
  if (!session.feedback) return session;
  const [current, ...rest] = session.queue;
  return { ...session, queue: session.feedback.correct ? rest : [...rest, current], feedback: null };
}
export function loadProgress(storage, modules, version) {
  try {
    const data = JSON.parse(storage.getItem('learnloop-progress'));
    if (data?.version !== version || !data.sessions) return {};
    const result = {};
    for (const module of modules) {
      const s = data.sessions[module.id];
      const ids = module.questions.map(q=>q.id);
      if (!s || !Array.isArray(s.queue) || !Array.isArray(s.mastered)) continue;
      const all = [...s.queue, ...s.mastered.filter(id=>id !== (s.feedback?.correct ? s.queue[0] : null))];
      if (all.length !== ids.length || new Set(all).size !== ids.length || all.some(id=>!ids.includes(id))) continue;
      if (![s.attempts,s.mistakes,s.score].every(n=>Number.isInteger(n)&&n>=0) || s.score !== s.mastered.length*10) continue;
      if (s.feedback && (typeof s.feedback.correct !== 'boolean' || typeof s.feedback.answer !== 'string')) continue;
      result[module.id]=s;
    }
    return result;
  } catch { return {}; }
}
