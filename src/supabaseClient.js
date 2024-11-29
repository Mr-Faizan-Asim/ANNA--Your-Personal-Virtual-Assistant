import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ghvppxlkgmgbxvcecpvy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodnBweGxrZ21nYnh2Y2VjcHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwOTY5ODEsImV4cCI6MjA0NzY3Mjk4MX0.YFyZasBMI60y_ol1uuofTESlibxUsfXCxV_U3SWVwsc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);