'use client';

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/dist/client/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Login() {
   const { login } = useAuth();
   const [ username, setUsername ] = useState('');
   const [ password, setPassword ] = useState('');
   const router = useRouter();

   const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (await login({ username, password })) {
         router.push('/');
      }
   };

   return (
      <div>
         <div style={{ fontSize: '1.5em' }}>Login</div>
         <form style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: 'auto', marginTop: '50px' }}>
            <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
               <label htmlFor="username">Username:</label>
               <input className="border border-gray-300 p-2 rounded ml-2" type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
               <label htmlFor="password">Password:</label>
               <input className="border border-gray-300 p-2 rounded ml-2" type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: '20px', fontSize: '0.75em', gap: '10px', alignItems: 'baseline', justifyContent: 'space-between' }}>
               <Link href="/forgot-password" className="text-blue-300 hover:underline">
                  Forgot Password?
               </Link>
               <Link href="/register" className="text-blue-300 hover:underline mt-2">
                  Don&apos;t have an account? Register
               </Link>
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer w-30 mt-8 mx-auto" onClick={onClick}>Login</button>
         </form>
      </div>
   );
}
