import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { streamChat } from '../api/chat.api';

export const MAX_MESSAGE_CHARS = 1000;

let controller = null;

// sessionStorage, not localStorage: chats may include contact details and shouldn't outlive the tab.
export const useChatStore = create(
  persist(
    (set, get) => {
      const updateLast = (patch) =>
        set((s) => {
          const messages = [...s.messages];
          const last = messages.at(-1);
          messages[messages.length - 1] = { ...last, ...(typeof patch === 'function' ? patch(last) : patch) };
          return { messages };
        });

      return {
        messages: [],
        status: 'idle', // idle | streaming | error
        error: null,

        send: async (text) => {
          const content = text.trim().slice(0, MAX_MESSAGE_CHARS);
          if (!content || get().status === 'streaming') return;

          const history = [...get().messages, { role: 'user', content }];
          set({ messages: [...history, { role: 'assistant', content: '' }], status: 'streaming', error: null });
          controller = new AbortController();

          await streamChat(
            history.map(({ role, content: c }) => ({ role, content: c })),
            {
              onText: (delta) => updateLast((m) => ({ content: m.content + delta })),
              onProducts: (items) => updateLast((m) => ({ products: [...(m.products || []), ...items].slice(0, 3) })),
              onLead: (reference) => updateLast({ lead: reference }),
              onError: (message) => set({ status: 'error', error: message }),
              onDone: () => {},
            },
            controller.signal
          );

          controller = null;
          set((s) => ({
            status: s.status === 'error' ? 'error' : 'idle',
            // Drop an assistant bubble that never received any content (error or stop before first word).
            messages: s.messages.filter((m, i) => !(i === s.messages.length - 1 && m.role === 'assistant' && !m.content && !m.lead)),
          }));
        },

        stop: () => {
          controller?.abort();
        },

        reset: () => {
          controller?.abort();
          set({ messages: [], status: 'idle', error: null });
        },
      };
    },
    {
      name: 'sparka-chat',
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ messages: s.messages }),
    }
  )
);
