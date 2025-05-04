
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Newsletter() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Successfully subscribed",
      description: "Thank you for subscribing to our newsletter!",
    });
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="text-3xl sm:text-4xl font-graffiti text-white mb-4">
          Join The <span className="text-urban-purple">Movement</span>
        </h2>
        
        <p className="text-muted-foreground mb-8">
          Subscribe to our newsletter for exclusive drops, artist collaborations, and special offers.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input 
            type="email" 
            placeholder="Your email address" 
            required
            className="bg-background/50 border-urban-purple/30 text-white" 
          />
          <Button 
            type="submit"
            className="bg-urban-purple hover:bg-urban-magenta text-white font-bold whitespace-nowrap"
          >
            Subscribe
          </Button>
        </form>
        
        <p className="text-sm text-muted-foreground mt-4">
          By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
