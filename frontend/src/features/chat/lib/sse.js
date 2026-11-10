// Incremental parser for the chat endpoint's text/event-stream. Feed it each decoded chunk;
// it returns the events completed so far and keeps any partial event for the next chunk.
export function createSseParser() {
  let buffer = '';
  return (chunk) => {
    buffer += chunk.replace(/\r\n/g, '\n');
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop();
    const events = [];
    for (const block of blocks) {
      const lines = block.split('\n');
      const event = lines.find((l) => l.startsWith('event: '))?.slice(7);
      const data = lines.find((l) => l.startsWith('data: '))?.slice(6);
      if (!event || data === undefined) continue;
      try {
        events.push({ event, data: JSON.parse(data) });
      } catch {
        // A malformed block is dropped; the stream carries on.
      }
    }
    return events;
  };
}
