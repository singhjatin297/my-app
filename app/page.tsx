"use client";

import { useApiClient } from "@/APIClient";
import { useState } from "react";

interface formData {
  email: string;
  password: string;
}

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const apiClient = useApiClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { email, password };
    if (!email || !password) return window.alert("Please fill all the fields");
    const body = JSON.stringify(data);
    const method = "POST";
    const options = { method, body };
    await apiClient("/api/login", options);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
