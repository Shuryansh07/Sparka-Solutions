import Field from '../../../shared/components/Field';
import OptionGroup from '../../../shared/components/OptionGroup';
import { useDiscoveryStore } from '../store/discovery.store';

export default function QuestionStep({ question }) {
  const answer = useDiscoveryStore((s) => s.answers[question.id]);
  const setAnswer = useDiscoveryStore((s) => s.setAnswer);
  const value = answer?.status === 'answered' ? answer.value : question.type === 'multi' ? [] : '';
  const onChange = (v) => setAnswer(question.id, v);

  return (
    <div className="question">
      <h2 className="question__prompt" id={`q-${question.id}`}>
        {question.prompt}
      </h2>
      {question.help && <p className="question__help">{question.help}</p>}

      {answer && answer.status !== 'answered' && (
        <p className="question__status">
          Marked as {answer.status === 'unsure' ? '“Not sure yet”' : 'skipped'} - choose an answer to change it.
        </p>
      )}

      <div className="question__input">
        {(question.type === 'single' || question.type === 'multi') && (
          <OptionGroup
            label={question.prompt}
            options={question.options}
            multiple={question.type === 'multi'}
            value={value}
            onChange={onChange}
          />
        )}
        {(question.type === 'text' || question.type === 'textarea') && (
          <Field
            as={question.type === 'textarea' ? 'textarea' : 'input'}
            label="Your answer"
            placeholder={question.placeholder}
            value={value}
            maxLength={4000}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
