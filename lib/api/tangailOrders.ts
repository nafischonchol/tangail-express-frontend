export interface TangailOrder {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  raw_text_list?: string | null;
  image_list_path?: string | null;
  voice_list_path?: string | null;
  image_url?: string | null;
  voice_url?: string | null;
  total_amount?: string | number | null;
  status: string;
  created_at: string;
}

export interface TangailOrderSubmitResponse {
  success: boolean;
  message: string;
  resources?: TangailOrder;
  errors?: Record<string, string[]>;
}

export async function submitTangailOrder(
  formData: FormData
): Promise<TangailOrderSubmitResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8005";

  try {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        message:
          data?.message ||
          "অর্ডার সম্পন্ন করা সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন।",
        errors: data?.error || data?.errors,
      };
    }

    return {
      success: true,
      message: data.message,
      resources: data.resources,
    };
  } catch (err: any) {
    return {
      success: false,
      message:
        err?.message ||
        "সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। আপনার ইন্টারনেট কানেকশন চেক করুন।",
    };
  }
}
