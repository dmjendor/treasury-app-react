"use client";
import CurrencyForm from "@/app/_components/CurrencyForm";
import Modal from "@/app/_components/Modal";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  const params = useParams();
  const currencyId = params?.currencyId ? String(params.currencyId) : "";

  const vault = useVault();
  if (!vault) return null;

  return (
    <Modal title="Edit Currency">
      <CurrencyForm
        mode="edit"
        vault={vault}
        currencyId={currencyId}
      />
    </Modal>
  );
}
