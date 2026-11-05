import { Info } from 'lucide-react';
import Field from '@/shared/components/Field';
import OptionGroup from '@/shared/components/OptionGroup';
import { useDiscoveryStore } from '../store/discovery.store';

export default function QuestionStep({ question }) {
  const answer = useDiscoveryStore((s) => s.answers[question.id]);
  const setAnswer = useDiscoveryStore((s) => s.setAnswer);
  const value = answer?.status === 'answered' ? answer.value : question.type === 'multi' ? [] : '';
  const onChange = (v) => setAnswer(question.id, v);

  return (
    <div className="grid gap-6">
      <div>
        <h2 id={`q-${question.id}`} className="type-wide text-[clamp(22px,2.6vw,30px)] leading-tight font-bold">
          {question.prompt}
        </h2>
        {question.help && <p className="mt-2 text-muted-foreground">{question.help}</p>}      </div>

      {answer && answer.status !== 'answered' && (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          Marked as {answer.status === 'unsure' ? '“Not sure yet”' : 'skipped'}. Choose an answer to change it.
        </p>
      )}

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
  );
}
