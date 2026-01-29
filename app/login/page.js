import SignInButton from "@/app/_components/SignInButton";
import { getEnabledAuthProviders } from "@/app/_lib/authProviders";
export const metadata = {
  title: "Login",
};

export default function Page({ searchParams }) {
  const providers = getEnabledAuthProviders();
  const callbackUrl =
    typeof searchParams?.callbackUrl === "string"
      ? searchParams.callbackUrl
      : "/account";

  return (
    <div className="flex flex-col gap-10 mt-10 items-center">
      <h2 className="text-3xl font-semibold">
        Sign in to access your guest area
      </h2>
      <SignInButton providers={providers} callbackUrl={callbackUrl} />
    </div>
  );
}
