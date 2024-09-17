export type ToastType = "error" | "info";

export interface Toast {
  message: string;
  type: ToastType;
}
