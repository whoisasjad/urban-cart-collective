
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Try to get the session from the URL
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Get the user and check if we need additional profile information
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if the profile exists and has required information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, address, city, state, postal_code, country, phone')
          .eq('id', user.id)
          .single();
        
        if (profileError || !profile || !profile.first_name || !profile.address) {
          // If we're missing profile data, redirect to complete profile
          toast({
            title: "Welcome!",
            description: "Please complete your profile information.",
          });
          navigate('/profile');
          return;
        }

        // If all good, redirect to home
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        navigate('/');
      } else {
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-urban-dark">
      <div className="text-white text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-urban-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
