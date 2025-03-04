import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedDate: null
  },
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    }
  }
});

export const { setSelectedDate } = uiSlice.actions;
export default uiSlice.reducer;
