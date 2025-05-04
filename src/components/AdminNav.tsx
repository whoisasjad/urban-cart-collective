
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';

export default function AdminNav() {
  const { signOut } = useAuth();

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
    { icon: <Package className="w-5 h-5" />, label: 'Products', path: '/admin/products' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders', path: '/admin/orders' },
    { icon: <Users className="w-5 h-5" />, label: 'Customers', path: '/admin/customers' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-urban-dark border-r border-urban-purple/20 flex flex-col">
      <div className="p-4 border-b border-urban-purple/20">
        <h2 className="text-xl font-graffiti text-urban-purple">URBAN<span className="text-urban-magenta">CART</span></h2>
        <p className="text-xs text-muted-foreground">Administration</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-urban-purple/20 text-urban-purple' 
                      : 'text-muted-foreground hover:bg-background/10 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-urban-purple/20">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-white"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Log out</span>
        </Button>
        
        <NavLink 
          to="/"
          className="mt-2 flex items-center p-2 rounded-md text-muted-foreground hover:bg-background/10 hover:text-white transition-colors"
        >
          <span>Back to Store</span>
        </NavLink>
      </div>
    </div>
  );
}
