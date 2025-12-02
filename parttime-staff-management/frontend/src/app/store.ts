import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import storeReducer from '../features/stores/storeSlice';
import shiftReducer from '../features/shifts/shiftSlice';
import requestReducer from '../features/requests/requestSlice';
import payrollReducer from '../features/payroll/payrollSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import marketplaceReducer from '../features/marketplace/marketplaceSlice';
import taskReducer from '../features/tasks/taskSlice';
import complaintReducer from '../features/complaints/complaintSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    stores: storeReducer,
    shifts: shiftReducer,
    requests: requestReducer,
    payroll: payrollReducer,
    notifications: notificationReducer,
    marketplace: marketplaceReducer,
    tasks: taskReducer,
    complaints: complaintReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;





