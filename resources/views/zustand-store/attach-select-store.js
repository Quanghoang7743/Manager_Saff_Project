import { create } from "zustand";

export const ATTACH_ACTIONS = {
  SELECT_ATTACH: "SELECT_ATTACH",
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
    set({ action: ATTACH_ACTIONS.SELECT_ATTACH, anchorEl });
  },

  closeAttachMenu: () => {
    set({ action: null, anchorEl: null });
  },

  selectAttachType: (attachType) => {
    set({ selected: attachType, action: ATTACH_ACTIONS.SELECT_ATTACH });
  },

  requestAction: (action, attach) => {
    set({ selected: attach, action: action });
  },

  clear: () => {
    set({ selected: null, action: null, anchorEl: null });
  },
}));

export default useAttachSelectedStore;
