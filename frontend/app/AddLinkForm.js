"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddLinkForm() {
    const [url, setUrl] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch("http://localhost:4000/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "failed to add link");
            }

            setUrl("");
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
            <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 border rounded-lg px-3 py-2 bg-transparent"
            />
            <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-foreground text-background px-4 py-2 font-medium disabled:opacity-50"
            >
                {submitting ? "Adding..." : "Add"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
    );
}