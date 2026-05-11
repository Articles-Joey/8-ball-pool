// import { generateRandomNickname } from '@/util/generateRandomNickname';
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import typicalZustandStoreExcludes from '@articles-media/articles-dev-box/typicalZustandStoreExcludes';
import typicalZustandStoreStateSlice from '@articles-media/articles-dev-box/typicalZustandStoreStateSlice';

import randomNicknameConfig from '@/util/randomNicknameConfig';

export const useStore = create()(
  persist(
    (set, get) => ({

      ...typicalZustandStoreStateSlice(
        set,
        get,
        randomNicknameConfig,
      ),

    }),
    {
      name: 'eight-ball-pool-storage',
      version: 2,
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true)
      },
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ![
            ...typicalZustandStoreExcludes,
          ].includes(key))
        ),
    },
  ),
)