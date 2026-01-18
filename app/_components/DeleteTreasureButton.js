"use client";
import { useTransition } from "react";
import SpinnerMini from "./SpinnerMini";
import { HiOutlineTrash } from "react-icons/hi2";
import { Button } from "@/app/_components/Button";

function DeleteTreasureButton({ treasureId, onDelete }) {
  const [isPending, startsTransition] = useTransition();
  function handleDelete() {
    if (confirm("Are you sure you wish to delete this treasure?")) {
      startsTransition(() => onDelete(treasureId));
    }
  }
  return (
    <Button
      variant="danger"
      onClick={handleDelete}
      aria-label="Delete"
    >
      {isPending ? <SpinnerMini /> : <HiOutlineTrash className="h-5 w-5" />}
    </Button>
  );
}

export default DeleteTreasureButton;
