"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

function SignInButton({ providers = [], callbackUrl = "/account" }) {
  if (!providers.length) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-4 text-sm text-muted-fg">
        No login providers are configured yet.
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => signIn(provider.id, { callbackUrl })}
          className="flex items-center gap-4 text-lg border border-border bg-btn-secondary-bg px-6 py-3 font-medium text-btn-secondary-fg hover:bg-btn-secondary-hover-bg transition-colors"
        >
          <Image
            src={provider.icon}
            alt={`${provider.name} logo`}
            height="24"
            width="24"
          />
          <span>{`Continue with ${provider.name}`}</span>
        </button>
      ))}
    </div>
  );
}

export default SignInButton;
