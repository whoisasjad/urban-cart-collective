
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import AdminNav from '@/components/AdminNav';
import { useToast } from '@/components/ui/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    const checkAdminAccess = async () => {
      if (!loading && !user) {
        toast({
          title: "Access denied",
          description: "You must be logged in to access the admin area.",
          variant: "destructive",
        });
        navigate('/auth');
      }
      
      // In a real application, you would check if the user has admin role
      // This is just a placeholder for demonstration
    };
    
    checkAdminAccess();
  }, [user, loading, navigate, toast]);

  if (loading) {
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
