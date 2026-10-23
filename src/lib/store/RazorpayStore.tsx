import { create } from "zustand";

interface RazorpayStore {
  amount: number;
  loading: boolean;
  message: string;

  setAmount: (value: number) => void;
  resetMessage: () => void;
  startPayment: () => Promise<void>;
}

export const useRazorpayStore = create<RazorpayStore>((set) => ({
  amount: 500,
  loading: false,
  message: "",

  setAmount: (value) => set({ amount: value }),

  resetMessage: () => set({ message: "" }),

  startPayment: async () => {
    set({ loading: false, message: "Payments are temporarily unavailable. No charge has been made." });
  },
}));
