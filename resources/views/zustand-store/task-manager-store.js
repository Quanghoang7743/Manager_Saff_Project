import { create } from "zustand";

export const TASK_ACTIONS = {
  SELECT_TASK: "SELECT_TASK",
};

const useAttachSelectedStore = create((set, get) => ({
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),

  selected: null,
  setSelected: (value) => set({ selected: value }),

  action: null,
  setAction: (value) => set({ action: value }),

  anchorEl: null,
  setAnchorEl: (value) => set({ anchorEl: value }),

  openAttachMenu: (anchorEl) => {
    set({ action: TASK_ACTIONS.SELECT_TASK, anchorEl });
  },

  closeAttachMenu: () => {
    set({ action: null, anchorEl: null });
  },

  selectAttachType: (attachType) => {
    set({ selected: attachType, action: TASK_ACTIONS.SELECT_TASK });
  },

  requestAction: (action, attach) => {
    set({ selected: attach, action: action });
  },

  clear: () => {
    set({ selected: null, action: null, anchorEl: null });
  },
}));

export default useAttachSelectedStore;
