import { configureStore, type UnknownAction } from "@reduxjs/toolkit"
import { baseApi } from "@/store/api/base-api"

type RootReducerState = {
  [baseApi.reducerPath]: ReturnType<typeof baseApi.reducer>
}

function rootReducer(
  state: RootReducerState | undefined,
  action: UnknownAction
): RootReducerState {
  return {
    [baseApi.reducerPath]: baseApi.reducer(
      state?.[baseApi.reducerPath],
      action
    ),
  }
}

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]