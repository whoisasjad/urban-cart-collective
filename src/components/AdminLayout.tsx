
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import AdminNav from '@/components/AdminNav';
import { useToast } from '@/components/ui/use-toast';
import { isUserAdmin } from '@/integrations/supabase/client';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!loading) {
        if (!user) {
          toast({
            title: "Access denied",
            description: "You must be logged in to access the admin area.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        
        // Check if user has admin role
        try {
          const adminStatus = await isUserAdmin(user.id);
          
          if (!adminStatus) {
            toast({
              title: "Access denied",
              description: "You don't have permission to access the admin area.",
              variant: "destructive",
            });
            navigate('/');
            return;
          }
          
          setIsAdmin(true);
        } catch (error) {
          toast({
            title: "Error checking permissions",
            description: "There was a problem verifying your access.",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    };
    
    checkAdminAccess();
  }, [user, loading, navigate, toast]);

  if (loading || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-urban-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-urban-purple border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-urban-dark text-white">
      <AdminNav />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
