'use client';

import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Login() {
   const [ username, setUsername ] = useState('');
   const [ password, setPassword ] = useState('');
   const router = useRouter();

   const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const response = await apiClient.login({ username, password });
      if (response.user) {
         router.push('/profile');
      } else {
         alert(`Login failed. Please check your credentials. ${response.message}`);
      }
   };

   return (
      <div>
         <h1>Login Page</h1>
         <form>
            <div>
               <label htmlFor="username">Username:</label>
               <input type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
               <label htmlFor="password">Password:</label>
               <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button onClick={onClick}>Login</button>
         </form>
      </div>
   );
}
