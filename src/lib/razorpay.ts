declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | undefined;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay checkout can only load in the browser."));
  if (window.Razorpay) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export type RazorpaySuccessPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function openRazorpayCheckout(options: {
  amountPaise: number;
  currency: string;
  orderId: string;
  name: string;
  description?: string;
  prefill: { name: string; email: string; contact: string };
}): Promise<RazorpaySuccessPayload> {
  await loadRazorpayScript();

  return new Promise<RazorpaySuccessPayload>((resolve, reject) => {
    const instance = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: options.amountPaise,
      currency: options.currency,
      order_id: options.orderId,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      theme: { color: "#16A34A" },
      handler: (response: RazorpaySuccessPayload) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });
    instance.open();
  });
}
