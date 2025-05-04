
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from "@/lib/utils";

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          sale_price: product.sale_price || null,
          featured: product.featured,
          in_stock: product.in_stock
        })
        .eq('id', product.id);
      
      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      // Invalidate and refetch both admin products AND regular products queries
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      setIsDialogOpen(false);
      toast({
        title: "Product updated",
        description: "The product has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEditProduct = (product: any) => {
    setEditingProduct({
      ...product,
      price: product.price / 100, // Convert from cents to dollars for editing
      sale_price: product.sale_price ? product.sale_price / 100 : ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProductMutation.mutate({
      ...editingProduct,
      price: Math.round(parseFloat(editingProduct.price) * 100), // Convert to cents
      sale_price: editingProduct.sale_price ? Math.round(parseFloat(editingProduct.sale_price) * 100) : null
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button className="bg-urban-purple hover:bg-urban-magenta">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-urban-purple border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-md border border-urban-purple/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-urban-dark/50 border-b border-urban-purple/30">
                <TableHead className="text-white">Product</TableHead>
                <TableHead className="text-white">Category</TableHead>
                <TableHead className="text-white">Price</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Featured</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product: any) => (
                <TableRow key={product.id} className="border-b border-urban-purple/20">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-10 h-10 object-cover rounded mr-3"
                      />
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>{product.categories?.name || 'Uncategorized'}</TableCell>
                  <TableCell>
                    {product.sale_price ? (
                      <div>
                        <span className="font-medium text-urban-purple">
                          {formatCurrency(product.sale_price)}
                        </span>
                        <span className="ml-2 text-muted-foreground line-through text-sm">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span>{formatCurrency(product.price)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        product.in_stock 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.featured ? (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-urban-purple/20 text-urban-purple">
                        Featured
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-white"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-urban-dark border-urban-purple/30 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingProduct?.price || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sale_price" className="text-right">
                  Sale Price ($)
                </Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={editingProduct?.sale_price || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, sale_price: e.target.value})}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="in_stock" className="text-right">
                  In Stock
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="in_stock"
                    type="checkbox"
                    checked={editingProduct?.in_stock || false}
                    onChange={(e) => setEditingProduct({...editingProduct, in_stock: e.target.checked})}
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="in_stock">Product is available for purchase</Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">
                  Featured
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={editingProduct?.featured || false}
                    onChange={(e) => setEditingProduct({...editingProduct, featured: e.target.checked})}
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="featured">Show on homepage featured section</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-urban-purple/30"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-urban-purple hover:bg-urban-magenta">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
