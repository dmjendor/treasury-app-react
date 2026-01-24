import { HiArrowRightStartOnRectangle } from "react-icons/hi2";
import { signOutAction } from "../_lib/actions/auth";

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className="py-3 px-5 hover:bg-surface hover:text-fg transition-colors flex items-center gap-4 font-semibold text-muted-fg w-full cursor-pointer">
        <HiArrowRightStartOnRectangle className="h-5 w-5" />
        <span>Sign out</span>
      </button>
    </form>
  );
}

export default SignOutButton;
