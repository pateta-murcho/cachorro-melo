import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderMobileProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
}

export function HeaderMobile({ cartItemsCount = 0, onCartClick }: HeaderMobileProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🌭</div>
          <div>
            <h1 className="text-lg font-bold text-primary">Cachorro Melo</h1>
            <p className="text-xs text-muted-foreground">Food Truck Delivery</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={onCartClick}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemsCount > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
              {cartItemsCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}