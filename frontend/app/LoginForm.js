"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch("http://localhost:4000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "login failed");
            }

            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8 items-start">
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="border rounded-lg px-3 py-2 bg-transparent"
            />
            <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="border rounded-lg px-3 py-2 bg-transparent"
            />
            <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-foreground text-background px-4 py-2 font-medium disabled:opacity-50"
            >
                {submitting ? "Logging in..." : "Log in"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
    );
}