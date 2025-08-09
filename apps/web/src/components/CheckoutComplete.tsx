'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/dist/client/components/navigation';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Box, Card, Stack } from '@e-commerce/ui';
import { apiClient } from '@/lib/api';
import { CheckoutSession } from '@e-commerce/types';

export function CheckoutComplete() {
   const searchParams = useSearchParams();
   const [success, setSuccess] = useState<boolean>(false);
   const [text, setText] = useState<string>();
   const [session, setSession] = useState<CheckoutSession>();

   useEffect(() => {
      const getSession = async (sessionId: string) => {
         setSuccess(true);
         setText(sessionId ? 'Payment succeeded' : 'Payment canceled');
         const s = await apiClient.retrieveCheckoutSession(sessionId);
         setSession(s);
         console.log('Checkout - Session:', s);
      };
      const sessionId = searchParams?.get('session_id');
      if (sessionId) {
         getSession(sessionId);
      }
   }, [searchParams]);

   return (
      <Suspense>
         <Stack
            id="payment-status"
            alignItems="center"
            maxWidth="600px"
            margin="0 auto"
         >
            <Box color={`${success ? 'green' : 'red'}`} fontSize="2em">
               {success ? <FaCheckCircle /> : <FaTimesCircle />}
            </Box>
            <Box marginLeft="15px" fontSize="1.75em">
               {text}
            </Box>
         </Stack>
         <Card>
            <Stack
               flexDirection="row"
               justifyContent="space-between"
               alignItems="center"
               width="100%"
            >
               <Box>Subtotal</Box>
               <Box>{`$${(session?.amount_subtotal ?? 0) / 100}`}</Box>
            </Stack>
            <Stack
               flexDirection="row"
               justifyContent="space-between"
               alignItems="center"
               width="100%"
            >
               <Box>Total</Box>
               <Box>{`$${(session?.amount_total ?? 0) / 100}`}</Box>
            </Stack>
            <Box>items</Box>
         </Card>
         <Box>
            {session && <pre>{JSON.stringify(session, null, 2)}</pre>}
         </Box>
      </Suspense>
   );

   return null;
}

