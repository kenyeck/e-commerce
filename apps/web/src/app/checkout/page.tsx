import { CheckoutComplete } from "@/components/CheckoutComplete";
import { apiClient } from "@/lib/api";
import { Loading } from "@e-commerce/ui";
import { Suspense } from "react";

interface CheckoutCompletePageProps {
  searchParams: { session_id?: string };
}

export default async function CheckoutCompletePage({
  searchParams,
}: CheckoutCompletePageProps) {
  const session = apiClient.retrieveCheckoutSession(
    searchParams?.session_id || "",
  );
  return (
    <Suspense fallback={<Loading />}>
      <CheckoutComplete session={session} />
    </Suspense>
  );
}
