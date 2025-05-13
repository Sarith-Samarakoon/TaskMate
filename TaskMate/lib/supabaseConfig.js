import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

// Initialize Supabase client
const supabaseUrl = "https://ejymmqhhhkalccdzdomz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqeW1tcWhoaGthbGNjZHpkb216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzg2MDQsImV4cCI6MjA2MjY1NDYwNH0.sUucBGHMuyvaOs-1QcXk4g6PmX3DlgOkFJ6j8JjzTdk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign in user
export const signInUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Supabase Sign-In Error:", error.message);
    return null;
  }
};

// Upload profile picture to Supabase Storage
export const uploadProfilePicture = async (uri, fileName) => {
  try {
    const fileData = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const blob = new Blob(
      [Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0))],
      {
        type: "image/jpeg",
      }
    );

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(`profile/${fileName}`, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(`profile/${fileName}`);

    return data?.publicUrl || null;
  } catch (error) {
    console.error("Supabase Upload Error:", error.message);
    return null;
  }
};

// Update user metadata in Supabase
export const updateUserMetadata = async (metadata) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Supabase Update Metadata Error:", error.message);
    return null;
  }
};
