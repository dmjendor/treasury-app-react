import { eachDayOfInterval } from "date-fns";
import { supabase } from "./supabase";
import { notFound } from "next/navigation";
import { auth } from "./auth";
/////////////
// GET
function normalizeVault(vault) {
  return {
    ...vault,
    containers_count: vault.containers?.[0]?.count ?? 0,
    treasure_count: vault.treasure?.[0]?.count ?? 0,
    currencies_count: vault.currency?.[0]?.count ?? 0,
    valuables_count: vault.valuables?.[0]?.count ?? 0,
  };
}

export async function getVaultById(id) {
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("id", id)
    .single();

  // For testing
  // await new Promise((res) => setTimeout(res, 1000));

  if (error) {
    console.error(error);
    notFound();
  }

  return data;
}

export const getVaults = async function () {
  const session = await auth();
  if (!session) throw new Error("You must be logged in.");
  const { data: vaults, error } = await supabase
    .from("vaults")
    .select(
      "id, active, base_currency_id, common_currency_id, edition_id, name, theme_id, containers(count), treasure(count), currency(count), valuables(count)"
    )
    // .eq("id", session.user.userId)
    .order("name");

  if (error) {
    console.error(error);
    throw new Error("Vaults could not be loaded");
  }

  const normalizedVaults = Array.isArray(vaults)
    ? vaults.map(normalizeVault)
    : [];
  return normalizedVaults;
};

// Users are uniquely identified by their email address
export async function getUser(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) {
    console.error(error);
  }
  // No error here! We handle the possibility of no user in the sign in callback
  return data;
}

/////////////
// CREATE

export async function createUser(newUser) {
  const { data, error } = await supabase.from("users").insert([newUser]);

  if (error) {
    console.error(error);
    throw new Error("User could not be created");
  }

  return data;
}

export async function createVault(newVault) {
  const { data, error } = await supabase
    .from("vaults")
    .insert([newVault])
    .select();

  if (error) {
    console.error(error);
    throw new Error("User could not be created");
  }

  return data;
}
/////////////
// UPDATE

// The updatedFields is an object which should ONLY contain the updated data
// export async function updateUser(id, updatedFields) {
//   const { data, error } = await supabase
//     .from("users")
//     .update(updatedFields)
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) {
//     console.error(error);
//     throw new Error("User could not be updated");
//   }
//   return data;
// }

// export async function updateBooking(id, updatedFields) {
//   const { data, error } = await supabase
//     .from("bookings")
//     .update(updatedFields)
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) {
//     console.error(error);
//     throw new Error("Booking could not be updated");
//   }
//   return data;
// }

// /////////////
// // DELETE

// export async function deleteBooking(id) {
//   const { data, error } = await supabase.from("bookings").delete().eq("id", id);

//   if (error) {
//     console.error(error);
//     throw new Error("Booking could not be deleted");
//   }
//   return data;
// }
