'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function Profile() {
   const { user, userId, loading } = useAuth();
   const router = useRouter();

   if (!loading && user === null) {
      router.push('/login');
      return null; // Prevent rendering while redirecting
   }

   return (
      <>
         {loading ? (
            <div>Loading...</div>
         ) : (
            <div style={{ padding: '20px', maxWidth: '600px' }}>
               <h1
                  style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}
               >
                  Profile Page
               </h1>
               <div>
                  <p>{`Name: ${user?.firstName} ${user?.lastName}`}</p>
                  <p>Username: {user?.username}</p>
                  <p>Email: {user?.email}</p>
                  <p>User ID: {userId}</p>
                  <p>Created At: {new Date(user?.createdAt as Date).toLocaleString()}</p>
                  <p>Updated At: {new Date(user?.updatedAt as Date).toLocaleString()}</p>
               </div>
            </div>
         )}
      </>
   );
}
