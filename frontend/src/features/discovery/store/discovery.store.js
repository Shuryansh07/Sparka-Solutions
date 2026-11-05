import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { discoveryApi } from '../api/discovery.api';
import { visibleAnswers } from '../lib/flow';

const emptyContact = {
  name: '',
  company: '',
  email: '',
  phone: '',
  location: '',
  preferredContact: '',
  bestTime: '',
};

const initialData = () => ({
  answers: {},
  step: 0,
  extended: false,
  narrative: '',
  organized: null,
  describeStage: 'write',
  contact: { ...emptyContact },
  talk: { method: 'phone', topic: '' },
});

const draftPayload = (s, route) => ({
  route,
  step: s.step,
  extended: s.extended,
  answers: s.answers,
  narrative: s.narrative,
  organized: s.organized || {},
  contact: s.contact,
});

export const useDiscoveryStore = create(
  persist(
    (set, get) => ({
      ...initialData(),
      draftToken: null,
      receipt: null,
      library: null,
      libraryError: null,
      busy: false,
      error: null,
      fieldErrors: {},

      hasProgress: () => {
        const s = get();
        return Object.keys(s.answers).length > 0 || s.narrative.trim().length > 0;
      },

      loadLibrary: async () => {
        if (get().library) return;
        try {
          set({ library: await discoveryApi.getQuestions(), libraryError: null });
        } catch (err) {
          set({ libraryError: err.message });
        }
      },

      setAnswer: (id, value) =>
        set((s) => {
          const answers = { ...s.answers };
          const empty = value == null || value === '' || (Array.isArray(value) && value.length === 0);
          if (empty) delete answers[id];
          else answers[id] = { status: 'answered', value };
          return { answers };
        }),

      markAnswer: (id, status) => set((s) => ({ answers: { ...s.answers, [id]: { status, value: null } } })),
      setStep: (step) => set({ step: Math.max(0, step), error: null }),
      setExtended: (extended) => set({ extended }),
      setNarrative: (narrative) => set({ narrative }),
      setDescribeStage: (describeStage) => set({ describeStage, error: null }),
      setOrganized: (patch) => set((s) => ({ organized: { ...(s.organized || {}), ...patch } })),
      setContact: (patch) =>
        set((s) => ({
          contact: { ...s.contact, ...patch },
          fieldErrors: Object.fromEntries(Object.entries(s.fieldErrors).filter(([k]) => !(k in patch))),
        })),
      setTalk: (patch) => set((s) => ({ talk: { ...s.talk, ...patch } })),
      setFieldErrors: (fieldErrors) => set({ fieldErrors }),
      clearError: () => set({ error: null }),

      organizeNarrative: async () => {
        set({ busy: true, error: null });
        try {
          const organized = await discoveryApi.organize(get().narrative);
          set({ organized, describeStage: 'review', busy: false });
          return true;
        } catch (err) {
          set({ error: err.message, busy: false });
          return false;
        }
      },

      saveDraft: async (route) => {
        set({ busy: true, error: null });
        try {
          const s = get();
          const payload = draftPayload(s, route);
          const { token } = s.draftToken
            ? await discoveryApi.updateDraft(s.draftToken, payload).catch((err) =>
                // An expired/unknown token gets a fresh draft instead of failing the save.
                err.status === 404 ? discoveryApi.createDraft(payload) : Promise.reject(err)
              )
            : await discoveryApi.createDraft(payload);
          set({ draftToken: token, busy: false });
          return token;
        } catch (err) {
          set({ error: err.message, busy: false });
          return null;
        }
      },

      resumeDraft: async (token) => {
        const draft = await discoveryApi.getDraft(token);
        set({
          ...initialData(),
          answers: draft.answers || {},
          step: draft.step || 0,
          extended: !!draft.extended,
          narrative: draft.narrative || '',
          organized: draft.organized?.interests?.length || draft.organized?.fleetSize ? draft.organized : null,
          describeStage: draft.route === 'describe' && draft.narrative ? 'review' : 'write',
          contact: { ...emptyContact, ...draft.contact },
          draftToken: token,
        });
        return draft.route;
      },

      submit: async (route) => {
        const s = get();
        set({ busy: true, error: null, fieldErrors: {} });
        try {
          const receipt =
            route === 'talk'
              ? await discoveryApi.requestConsultation({ contact: s.contact, method: s.talk.method, topic: s.talk.topic })
              : await discoveryApi.submit({
                  route,
                  answers: route === 'guide' ? visibleAnswers(s.library, s.answers, s.extended) : undefined,
                  narrative: route === 'describe' ? s.narrative : undefined,
                  organized: route === 'describe' ? s.organized : undefined,
                  contact: s.contact,
                });
          set({ ...initialData(), receipt, draftToken: null, busy: false });
          return receipt;
        } catch (err) {
          set({ error: err.message, fieldErrors: err.details || {}, busy: false });
          return null;
        }
      },

      reset: () => set({ ...initialData(), draftToken: null, error: null, fieldErrors: {} }),
    }),
    {
      name: 'sparka-discovery',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        answers: s.answers,
        step: s.step,
        extended: s.extended,
        narrative: s.narrative,
        organized: s.organized,
        describeStage: s.describeStage,
        contact: s.contact,
        talk: s.talk,
        draftToken: s.draftToken,
        receipt: s.receipt,
      }),
    }
  )
);
