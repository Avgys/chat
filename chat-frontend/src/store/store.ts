import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slice';

const store = configureStore({
    reducer: {
        chatState: chatReducer
    }
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;