import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { AssociateTransaction } from "@/types/business";

export function useGetAssociateTransactionHistoryQuery(associateId: string) {
  return useQuery({
    queryKey: ["associate-transactions", associateId],
    queryFn: async () => {
      const response = await axios.get<AssociateTransaction[]>(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/associates/${associateId}/transactions`
      );
      return response.data;
    },
    enabled: !!associateId,
  });
} 