"use client";
import { useTransition } from "react";
import SpinnerMini from "./SpinnerMini";
import { HiOutlineTrash } from "react-icons/hi2";

function DeleteContainer({ containerId, onDelete }) {
  const [isPending, startsTransition] = useTransition();
  function handleDelete() {
    if (confirm("Are you sure you wish to delete this container?")) {
      startsTransition(() => onDelete(containerId));
    }
  }
  return (
    <button
      type="button"
      onClick={handleDelete}
      className="
    group
    inline-flex items-center justify-center
    h-9 w-9
    text-muted-fg
    transition-colors
    hover:text-fg
    hover:bg-danger-100
    rounded-full
    focus:outline-none focus:ring-2 focus:ring-accent
  "
      aria-label="Delete"
    >
      {isPending ? <SpinnerMini /> : <HiOutlineTrash className="h-5 w-5" />}
    </button>
  );
}

export default DeleteContainer;
