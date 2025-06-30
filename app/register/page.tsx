"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type Regisresponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const Page = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post<Regisresponse>(
        "/api/auth/register",
        { username, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;

      if (data.success) {
        alert("Registration successful!");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.push("/login");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
        <br />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required
        />
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Page;
