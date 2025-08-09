'use client';
import { useState, use } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Box, Card, Stack } from '@e-commerce/ui';
import { CheckoutSession } from '@e-commerce/types';

export function CheckoutComplete({ session: s }: { session: Promise<CheckoutSession> }) {
   const session = use(s);
   const [success] = useState<boolean>(session.id ? true : false);
   const [text] = useState<string>(session.id ? 'Payment succeeded' : 'Payment canceled');

   return (
      <Box>
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
      </Box>
   );

   return null;
}

