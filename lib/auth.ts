import { supabase } from "./supabase/client";

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};