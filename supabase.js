import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://snptinuwoeakenejwhzl.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucHRpbnV3b2Vha2VuZWp3aHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTYyMzgsImV4cCI6MjA5NTUzMjIzOH0.Qw60gFhE8501Q5tHRQNXKd3I2-XETZzQ4l1bMTs_7ns'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)