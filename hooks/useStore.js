import { generateRandomNickname } from '@/util/generateRandomNickname';
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create()(
  persist(
    (set, get) => ({

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },

      nickname: generateRandomNickname(),
      setNickname: (newValue) => {
        set((prev) => ({
          nickname: newValue
        }))
      },
      randomNickname: () => {

        const newNickname = generateRandomNickname();

        set((prev) => ({
          nickname: newNickname
        }))
      },

      darkMode: null,
      setDarkMode: (value) => set({ darkMode: value }),
      toggleDarkMode: () => set({ darkMode: !get().darkMode }),

      showInfoModal: false,
      setShowInfoModal: (value) => set({ showInfoModal: value }),

      showSettingsModal: false,
      setShowSettingsModal: (value) => set({ showSettingsModal: value }),

      showCreditsModal: false,
      setShowCreditsModal: (value) => set({ showCreditsModal: value }),

      lobbyDetails: {
        games: [],
        players: [],
      },
      setLobbyDetails: (value) => set({ lobbyDetails: value })

    }),
    {
      name: 'eight-ball-pool-storage',
      version: 1,
      partialize: (state) => ({
        nickname: state.nickname,
        character: state.character,
        darkMode: state.darkMode,
        graphicsQuality: state.graphicsQuality,
        landingAnimation: state.landingAnimation,
        sidebar: state.sidebar,
        graphicsQuality: state.graphicsQuality,
        debug: state.debug
      }),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    },
  ),
)