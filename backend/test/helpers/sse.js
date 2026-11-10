// Parses a text/event-stream body into [{ event, data }].
export function parseSse(text) {
  return text
    .split('\n\n')
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.split('\n');
      const event = lines.find((l) => l.startsWith('event: '))?.slice(7);
      const data = lines.find((l) => l.startsWith('data: '))?.slice(6);
      return { event, data: data ? JSON.parse(data) : null };
    });
}

// Fake OpenAI client: each responses.create call plays the next script (an array of events).
export function fakeOpenAI(scripts) {
  const calls = [];
  return {
    calls,
    responses: {
      create: async (params) => {
        calls.push(structuredClone(params));
        const script = typeof scripts === 'function' ? scripts(calls.length) : scripts[calls.length - 1];
        if (script instanceof Error) throw script;
        return (async function* play() {
          for (const event of script) yield event;
        })();
      },
    },
  };
}

export const textEvents = (...parts) => [
  ...parts.map((delta) => ({ type: 'response.output_text.delta', delta })),
  {
    type: 'response.completed',
    response: { output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: parts.join('') }] }] },
  },
];

export const toolCallEvents = (name, args, callId = 'call_1') => [
  {
    type: 'response.completed',
    response: { output: [{ type: 'function_call', id: `fc_${callId}`, call_id: callId, name, arguments: JSON.stringify(args) }] },
  },
];
