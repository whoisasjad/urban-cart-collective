
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
};

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    async function loadProfile() {
      setLoading(true);
      try {
        // First refresh profile to ensure we have the latest data
        await refreshProfile();
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Profile fetch error:", error);
          toast({
            title: "Error",
            description: "There was an error loading your profile.",
            variant: "destructive"
          });
        } else {
          console.log("Profile loaded:", data);
          setProfile(data);
        }
        
        // Load orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (orderError) {
          console.error("Orders fetch error:", orderError);
        } else {
          setOrders(orderData || []);
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, navigate, toast, refreshProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postal_code,
          country: profile.country,
          phone: profile.phone
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-urban-dark">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center text-white">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-urban-dark">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center text-white">
            <p>Profile not found. Please sign in again.</p>
            <Button onClick={() => navigate('/auth')} className="mt-4 bg-urban-purple hover:bg-urban-magenta">
              Go to Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-urban-dark">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Account</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <div className="urban-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm text-muted-foreground mb-1">
                      First Name
                    </label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={profile?.first_name || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm text-muted-foreground mb-1">
                      Last Name
                    </label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={profile?.last_name || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm text-muted-foreground mb-1">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={profile?.address || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm text-muted-foreground mb-1">
                      City
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={profile?.city || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm text-muted-foreground mb-1">
                      State/Province
                    </label>
                    <Input
                      id="state"
                      name="state"
                      value={profile?.state || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postal_code" className="block text-sm text-muted-foreground mb-1">
                      Postal Code
                    </label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={profile?.postal_code || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm text-muted-foreground mb-1">
                      Country
                    </label>
                    <Input
                      id="country"
                      name="country"
                      value={profile?.country || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile?.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="bg-urban-purple hover:bg-urban-magenta"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-6">
            <div className="urban-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Order History</h2>
              
              {orders.length === 0 ? (
                <p className="text-muted-foreground">You have no orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-urban-purple/30">
                        <th className="text-left p-4 text-white">Order #</th>
                        <th className="text-left p-4 text-white">Date</th>
                        <th className="text-left p-4 text-white">Status</th>
                        <th className="text-right p-4 text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-urban-purple/20">
                          <td className="p-4 text-white font-mono">
                            {order.id.substring(0, 8)}...
                          </td>
                          <td className="p-4 text-white">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                              order.status === 'shipped' ? 'bg-blue-900/20 text-blue-400' :
                              'bg-orange-900/20 text-orange-400'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-right text-urban-purple font-bold">
                            {formatCurrency(order.total / 100)} {/* Convert cents back to dollars */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
